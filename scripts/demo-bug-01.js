import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

const BUG_CONFIG = {
  id: 'bug-01',
  name: 'Priority Filter Null Reference',
  description: 'Calling .toLowerCase() on undefined in priority filter',
  patch: 'scripts/patches/demo-01-priority-filter-bug.patch',
  testPattern: 'tests/integration/api/tasks-filtering.test.js',
  testType: 'Integration'
}

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

function runTests(expectFailure) {
  console.log(`\n  Running ${BUG_CONFIG.testType} tests...`)
  console.log(`  Pattern: ${BUG_CONFIG.testPattern}\n`)

  try {
    execSync(`npm test -- ${BUG_CONFIG.testPattern}`, {
      cwd: projectRoot,
      stdio: 'inherit',
      encoding: 'utf-8'
    })

    if (expectFailure) {
      console.log('\n  [!] WARNING: Tests PASSED but should FAIL')
      console.log('      Bug may not be properly introduced.')
      return false
    } else {
      console.log('\n  [OK] Tests passed as expected.')
      return true
    }
  } catch (error) {
    if (expectFailure) {
      console.log('\n  [OK] Tests failed as expected - bug is active.')
      return true
    } else {
      console.log('\n  [X] ERROR: Tests FAILED unexpectedly.')
      return false
    }
  }
}

function toggleBug() {
  console.log('')
  printHeader(`BUG TOGGLE: ${BUG_CONFIG.name}`)
  console.log(`\nDescription: ${BUG_CONFIG.description}`)
  console.log(`Bug ID: ${BUG_CONFIG.id}`)

  const patchPath = resolve(projectRoot, BUG_CONFIG.patch)

  if (!existsSync(patchPath)) {
    console.log(`\n[X] ERROR: Patch file not found: ${BUG_CONFIG.patch}`)
    process.exit(1)
  }

  const isApplied = isPatchApplied(patchPath)

  if (isApplied) {
    console.log('\n[STATE] Bug is currently ACTIVE')
    console.log('[ACTION] Removing bug (reverting patch)...')

    try {
      execSync(`git apply --reverse "${patchPath}"`, {
        cwd: projectRoot,
        stdio: 'pipe',
        encoding: 'utf-8'
      })
      console.log('\n  Patch reversed successfully.')
    } catch (error) {
      console.log('\n[X] ERROR: Failed to reverse patch.')
      console.log('    Try: git checkout -- <affected files>')
      process.exit(1)
    }

    console.log('\n[VERIFY] Checking that tests now PASS...')
    const testsOk = runTests(false)

    console.log('')
    printHeader('TOGGLE COMPLETE')

    if (testsOk) {
      console.log('\n[OK] Bug removed - tests are passing.')
    } else {
      console.log('\n[!] Bug removed but tests still failing.')
      console.log('    Other issues may exist in codebase.')
    }
  } else {
    console.log('\n[STATE] Bug is currently NOT ACTIVE')

    if (!canPatchApply(patchPath)) {
      console.log('\n[X] ERROR: Patch cannot be applied (conflicts with current code).')
      console.log('    The patch may be outdated or another change conflicts.')
      process.exit(1)
    }

    console.log('[ACTION] Introducing bug (applying patch)...')

    try {
      execSync(`git apply "${patchPath}"`, {
        cwd: projectRoot,
        stdio: 'pipe',
        encoding: 'utf-8'
      })
      console.log('\n  Patch applied successfully.')
    } catch (error) {
      console.log('\n[X] ERROR: Failed to apply patch.')
      process.exit(1)
    }

    console.log('\n[VERIFY] Checking that tests now FAIL (as expected)...')
    const testsOk = runTests(true)

    console.log('')
    printHeader('TOGGLE COMPLETE')

    if (testsOk) {
      console.log('\n[OK] Bug introduced - tests are failing as expected.')
    } else {
      console.log('\n[!] Bug introduced but tests passed unexpectedly.')
      console.log('    The bug may not affect test coverage.')
    }
  }

  console.log('\n------------------------------------------------------------')
  console.log('To reset all demo state: npm run demo:reset')
  console.log('------------------------------------------------------------\n')
}

toggleBug()
