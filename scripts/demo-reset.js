import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

const ALL_PATCHES = [
  { id: 'bug-01', name: 'Priority Filter Bug', path: 'scripts/patches/demo-01-priority-filter-bug.patch' },
  { id: 'bug-02', name: 'Null Reference Bug', path: 'scripts/patches/demo-02-null-ref-bug.patch' },
  { id: 'bug-03', name: 'Validation Bug', path: 'scripts/patches/demo-03-validation-bug.patch' },
  { id: 'bug-04', name: 'Drag-Drop Bug', path: 'scripts/patches/demo-04-dragdrop-bug.patch' },
  { id: 'feature-search', name: 'Search Filter Removed', path: 'scripts/patches/feature-remove-search-filter.patch' }
]

function printHeader(text, char = '=', width = 70) {
  console.log(char.repeat(width))
  console.log(text)
  console.log(char.repeat(width))
}

function isPatchApplied(patchPath) {
  if (!existsSync(patchPath)) {
    return false
  }

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

function detectAppliedPatches() {
  console.log('\n[1/3] Detecting applied patches...\n')

  const appliedPatches = []
  const cleanPatches = []

  for (const patch of ALL_PATCHES) {
    const patchPath = resolve(projectRoot, patch.path)

    if (isPatchApplied(patchPath)) {
      console.log(`  [X] ${patch.name}`)
      appliedPatches.push({ ...patch, fullPath: patchPath })
    } else {
      console.log(`  [ ] ${patch.name}`)
      cleanPatches.push(patch)
    }
  }

  return { appliedPatches, cleanPatches }
}

function reversePatches(appliedPatches) {
  if (appliedPatches.length === 0) {
    console.log('\n[2/3] No patches to reverse.')
    return true
  }

  console.log(`\n[2/3] Reversing ${appliedPatches.length} patch(es)...\n`)

  const reversedOrder = [...appliedPatches].reverse()

  for (const patch of reversedOrder) {
    try {
      execSync(`git apply --reverse "${patch.fullPath}"`, {
        cwd: projectRoot,
        stdio: 'pipe',
        encoding: 'utf-8'
      })
      console.log(`  [OK] Reversed: ${patch.name}`)
    } catch (error) {
      console.error(`\n[X] ERROR: Failed to reverse ${patch.name}`)
      console.error('    You may need to manually restore with: git checkout -- <file>\n')
      return false
    }
  }

  return true
}

function validateCleanState() {
  console.log('\n[3/3] Validating clean state with test suite...\n')

  try {
    execSync('npm test', {
      cwd: projectRoot,
      stdio: 'inherit',
      encoding: 'utf-8'
    })
    return true
  } catch (error) {
    return false
  }
}

function main() {
  console.log('')
  printHeader('DEMO RESET: Restoring Clean State')
  console.log('\nThis will detect and reverse any applied demo patches.')

  const { appliedPatches } = detectAppliedPatches()

  if (appliedPatches.length === 0) {
    console.log('')
    printHeader('RESET COMPLETE')
    console.log('\n[OK] Already in clean state - no patches applied.')
    console.log('\n------------------------------------------------------------')
    console.log('Available setup commands:')
    console.log('  npm run demo:setup-broken     - Apply all 4 bugs')
    console.log('  npm run demo:setup-no-filter  - Remove search filter')
    console.log('------------------------------------------------------------\n')
    process.exit(0)
  }

  const reversed = reversePatches(appliedPatches)

  if (!reversed) {
    console.log('\n[X] ERROR: Some patches could not be reversed.')
    console.log('Check git status and consider: git checkout -- <file>\n')
    process.exit(1)
  }

  const testsPass = validateCleanState()

  console.log('')
  printHeader('RESET COMPLETE')

  if (testsPass) {
    console.log('\n[OK] All tests passing - clean state restored successfully!')
    console.log('\n------------------------------------------------------------')
    console.log('Available setup commands:')
    console.log('  npm run demo:setup-broken     - Apply all 4 bugs')
    console.log('  npm run demo:setup-no-filter  - Remove search filter')
    console.log('------------------------------------------------------------\n')
    process.exit(0)
  } else {
    console.log('\n[!] WARNING: Some tests are still failing.')
    console.log('    Check git status for uncommitted changes.')
    console.log('    Manual intervention may be required.\n')
    process.exit(1)
  }
}

main()
