import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

const SCENARIOS = [
  {
    id: 1,
    name: 'Null Reference in Priority Filter',
    description: 'Calling .toLowerCase() on undefined priority crashes the app',
    patch: 'demo-01-priority-filter-bug.patch',
    testCommand: 'npm test -- tests/integration/api/tasks-filtering.test.js',
    testType: 'Integration',
    takeaway: 'Integration test caught null reference that would cause 500 errors when filtering tasks without priority'
  },
  {
    id: 2,
    name: 'Array Access on Empty Store',
    description: 'Accessing tasks[0].id when array is empty causes TypeError',
    patch: 'demo-02-null-ref-bug.patch',
    testCommand: 'npm test -- tests/unit/server/store.test.js',
    testType: 'Unit',
    takeaway: 'Unit test caught TypeError from array access before checking length - crashes on empty store'
  },
  {
    id: 3,
    name: 'Missing Status Validation',
    description: 'Removed status validation allows invalid values into database',
    patch: 'demo-03-validation-bug.patch',
    testCommand: 'npm test -- tests/unit/server/validators.test.js',
    testType: 'Unit',
    takeaway: 'Unit test caught missing validation - invalid status values would corrupt data integrity'
  },
  {
    id: 4,
    name: 'Widget Layout Not Persisted',
    description: 'Commented out layoutStore.save() breaks layout persistence',
    patch: 'demo-04-dragdrop-bug.patch',
    testCommand: 'npm run test:e2e:headless -- e2e/flows/widget-drag-drop.spec.js',
    testType: 'E2E',
    takeaway: 'E2E test caught broken persistence - layout changes lost on page refresh'
  }
]

function printHeader(text, char = '=', width = 70) {
  console.log(char.repeat(width))
  console.log(text)
  console.log(char.repeat(width))
}

function printSubHeader(text, width = 70) {
  console.log('')
  console.log('-'.repeat(width))
  console.log(text)
  console.log('-'.repeat(width))
}

function checkCleanWorkingDirectory() {
  console.log('\nChecking working directory...')

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
      console.log('\nPlease commit or stash your changes before running the demo.')
      console.log('This ensures the demo can be cleanly reversed with demo:fix.')
      process.exit(1)
    }

    console.log('[OK] Working directory is clean.\n')
  } catch (error) {
    console.log('[X] ERROR: Could not check git status')
    console.log(error.message)
    process.exit(1)
  }
}

function verifyPatchesExist() {
  console.log('Verifying patch files exist...')

  for (const scenario of SCENARIOS) {
    const patchPath = resolve(projectRoot, 'scripts/patches', scenario.patch)
    if (!existsSync(patchPath)) {
      console.log(`[X] ERROR: Patch file not found: ${scenario.patch}`)
      process.exit(1)
    }
  }

  console.log('[OK] All 4 patch files found.\n')
}

function applyPatch(scenario) {
  const patchPath = resolve(projectRoot, 'scripts/patches', scenario.patch)

  console.log(`\nIntroducing bug: ${scenario.description}`)
  console.log(`Patch: scripts/patches/${scenario.patch}`)

  try {
    execSync(`git apply "${patchPath}"`, {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: 'pipe'
    })
    console.log('[OK] Patch applied successfully.\n')
    return true
  } catch (error) {
    console.log('[X] ERROR: Failed to apply patch')
    console.log(error.message)
    return false
  }
}

function runTests(scenario) {
  console.log(`Running ${scenario.testType} tests: ${scenario.testCommand}\n`)

  try {
    execSync(scenario.testCommand, {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: 'inherit'
    })
    console.log('\n[!] UNEXPECTED: Tests passed (bug was not detected)')
    return false
  } catch (error) {
    console.log('\n[OK] RESULT: Tests FAILED as expected - bug was caught!')
    console.log(`    Key takeaway: ${scenario.takeaway}`)
    return true
  }
}

function main() {
  console.log('')
  printHeader('DEMO: Break-Then-Fix Testing Scenarios')
  console.log('\nThis demo introduces 4 real bugs and shows how different')
  console.log('test types (unit, integration, E2E) catch them immediately.\n')

  checkCleanWorkingDirectory()
  verifyPatchesExist()

  let successCount = 0
  let failedScenarios = []

  for (const scenario of SCENARIOS) {
    printSubHeader(`SCENARIO ${scenario.id}: ${scenario.name}`)

    if (!applyPatch(scenario)) {
      failedScenarios.push(scenario.id)
      continue
    }

    if (runTests(scenario)) {
      successCount++
    } else {
      failedScenarios.push(scenario.id)
    }
  }

  console.log('')
  printHeader('DEMO COMPLETE')

  if (successCount === SCENARIOS.length) {
    console.log(`\n[OK] All ${SCENARIOS.length} bugs introduced and caught by tests!`)
    console.log('\nKey insight: These bugs would have reached production without tests.')
    console.log('Manual testing rarely covers edge cases like empty arrays or null values.')
  } else {
    console.log(`\n[!] ${successCount}/${SCENARIOS.length} scenarios completed successfully.`)
    console.log(`    Failed scenarios: ${failedScenarios.join(', ')}`)
  }

  console.log('\n------------------------------------------------------------')
  console.log('To restore working code, run: npm run demo:fix')
  console.log('------------------------------------------------------------\n')

  process.exit(failedScenarios.length > 0 ? 1 : 0)
}

main()
