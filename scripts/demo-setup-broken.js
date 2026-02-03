import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

const BUG_PATCHES = [
  { id: 'bug-01', name: 'Priority Filter Bug', path: 'scripts/patches/demo-01-priority-filter-bug.patch' },
  { id: 'bug-02', name: 'Null Reference Bug', path: 'scripts/patches/demo-02-null-ref-bug.patch' },
  { id: 'bug-03', name: 'Validation Bug', path: 'scripts/patches/demo-03-validation-bug.patch' },
  { id: 'bug-04', name: 'Drag-Drop Bug', path: 'scripts/patches/demo-04-dragdrop-bug.patch' }
]

function printHeader(text, char = '=', width = 70) {
  console.log(char.repeat(width))
  console.log(text)
  console.log(char.repeat(width))
}

function checkCleanWorkingDirectory() {
  console.log('\n[1/3] Checking working directory...')

  try {
    const status = execSync('git status --porcelain', {
      cwd: projectRoot,
      encoding: 'utf-8'
    }).trim()

    const sourceChanges = status
      .split('\n')
      .filter(line => line.trim())
      .filter(line => !line.includes('.planning/'))
      .filter(line => !line.includes('.claude/'))
      .filter(line => !line.startsWith('??'))

    if (sourceChanges.length > 0) {
      console.log('\n[X] ERROR: Working directory has uncommitted changes:')
      sourceChanges.forEach(line => console.log(`    ${line}`))
      console.log('\nPlease commit or stash changes before running demo setup.')
      console.log('This ensures patches can be cleanly applied and reversed.\n')
      process.exit(1)
    }

    console.log('      Working directory is clean.')
  } catch (error) {
    console.log('[X] ERROR: Could not check git status')
    console.log(error.message)
    process.exit(1)
  }
}

function isPatchApplied(patchPath) {
  try {
    execSync(`git apply --reverse --check "${patchPath}"`, {
      cwd: projectRoot,
      stdio: 'pipe',
      encoding: 'utf-8'
    })
    return true
  } catch (error) {
    return false
  }
}

function canPatchApply(patchPath) {
  try {
    execSync(`git apply --check "${patchPath}"`, {
      cwd: projectRoot,
      stdio: 'pipe',
      encoding: 'utf-8'
    })
    return true
  } catch (error) {
    return false
  }
}

function verifyPatchesExist() {
  console.log('\n[2/3] Verifying patch files exist...')

  for (const patch of BUG_PATCHES) {
    const patchPath = resolve(projectRoot, patch.path)
    if (!existsSync(patchPath)) {
      console.log(`[X] ERROR: Patch file not found: ${patch.path}`)
      process.exit(1)
    }
  }

  console.log(`      All ${BUG_PATCHES.length} patch files found.`)
}

function applyBugPatches() {
  console.log('\n[3/3] Applying bug patches...\n')

  let appliedCount = 0
  let alreadyAppliedCount = 0
  let skippedCount = 0
  const skippedPatches = []

  for (const patch of BUG_PATCHES) {
    const patchPath = resolve(projectRoot, patch.path)

    if (isPatchApplied(patchPath)) {
      console.log(`  [~] ${patch.name}: Already applied`)
      alreadyAppliedCount++
      continue
    }

    if (!canPatchApply(patchPath)) {
      console.log(`  [!] ${patch.name}: Skipped (patch conflicts with current code)`)
      skippedCount++
      skippedPatches.push(patch.name)
      continue
    }

    try {
      execSync(`git apply "${patchPath}"`, {
        cwd: projectRoot,
        stdio: 'pipe',
        encoding: 'utf-8'
      })
      console.log(`  [+] ${patch.name}: Applied`)
      appliedCount++
    } catch (error) {
      console.log(`  [!] ${patch.name}: Failed to apply`)
      skippedCount++
      skippedPatches.push(patch.name)
    }
  }

  return { appliedCount, alreadyAppliedCount, skippedCount, skippedPatches }
}

function main() {
  console.log('')
  printHeader('DEMO SETUP: Multi-Bug Broken State')
  console.log('\nThis will introduce all 4 bugs for the demo presentation.')

  checkCleanWorkingDirectory()
  verifyPatchesExist()
  const { appliedCount, alreadyAppliedCount, skippedCount, skippedPatches } = applyBugPatches()

  const activeCount = appliedCount + alreadyAppliedCount

  console.log('')
  printHeader('SETUP COMPLETE')

  if (activeCount === BUG_PATCHES.length) {
    console.log('\n[OK] Demo state: BROKEN (4 bugs active)')
    if (alreadyAppliedCount > 0) {
      console.log(`     ${appliedCount} applied, ${alreadyAppliedCount} already active.`)
    }
  } else if (activeCount > 0) {
    console.log(`\n[OK] Demo state: BROKEN (${activeCount} of ${BUG_PATCHES.length} bugs active)`)
    console.log(`     Applied: ${appliedCount}, Already active: ${alreadyAppliedCount}`)
    if (skippedCount > 0) {
      console.log(`     Skipped: ${skippedPatches.join(', ')}`)
    }
  } else {
    console.log('\n[!] WARNING: No bugs could be applied.')
    console.log('    Check that patches match the current codebase.')
    process.exit(1)
  }

  console.log('\nExpected: Tests will fail across unit, integration, and E2E layers.')
  console.log('\n------------------------------------------------------------')
  console.log('To restore: npm run demo:reset')
  console.log('------------------------------------------------------------\n')

  process.exit(0)
}

main()
