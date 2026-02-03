import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

const FEATURE_PATCH = {
  id: 'feature-search',
  name: 'Search Filter Feature',
  path: 'scripts/patches/feature-remove-search-filter.patch',
  description: 'Removes search filter functionality for TDD demonstration'
}

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
      console.log('\nPlease commit or stash changes before running demo setup.\n')
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

function verifyPatchExists() {
  console.log('\n[2/3] Verifying patch file exists...')

  const patchPath = resolve(projectRoot, FEATURE_PATCH.path)
  if (!existsSync(patchPath)) {
    console.log(`[X] ERROR: Patch file not found: ${FEATURE_PATCH.path}`)
    process.exit(1)
  }

  console.log('      Patch file found.')
}

function applyFeaturePatch() {
  console.log('\n[3/3] Applying feature removal patch...')

  const patchPath = resolve(projectRoot, FEATURE_PATCH.path)

  if (isPatchApplied(patchPath)) {
    console.log(`\n  [~] ${FEATURE_PATCH.name}: Already removed`)
    return { alreadyApplied: true }
  }

  try {
    execSync(`git apply "${patchPath}"`, {
      cwd: projectRoot,
      stdio: 'pipe',
      encoding: 'utf-8'
    })
    console.log(`\n  [+] ${FEATURE_PATCH.name}: Removed`)
    return { alreadyApplied: false }
  } catch (error) {
    console.error(`\n[X] ERROR: Failed to apply patch`)
    console.error('    Run: npm run demo:reset to restore clean state\n')
    process.exit(1)
  }
}

function main() {
  console.log('')
  printHeader('DEMO SETUP: Feature Removed (No Search Filter)')
  console.log('\nThis removes the search filter feature for TDD demonstration.')
  console.log('Use this to show test-driven development by rebuilding the feature.')

  checkCleanWorkingDirectory()
  verifyPatchExists()
  const { alreadyApplied } = applyFeaturePatch()

  console.log('')
  printHeader('SETUP COMPLETE')

  if (alreadyApplied) {
    console.log('\n[OK] Demo state: FEATURE REMOVED')
    console.log('     Search filter was already removed.')
  } else {
    console.log('\n[OK] Demo state: FEATURE REMOVED')
    console.log('     Search filter functionality has been removed.')
  }

  console.log('\nPurpose: TDD demonstration - rebuild the feature with tests.')
  console.log('The search input is removed from the UI.')
  console.log('\n------------------------------------------------------------')
  console.log('To restore: npm run demo:reset')
  console.log('------------------------------------------------------------\n')

  process.exit(0)
}

main()
