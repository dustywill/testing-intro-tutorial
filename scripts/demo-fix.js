import { execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

const PATCHES = [
  'demo-04-dragdrop-bug.patch',
  'demo-03-validation-bug.patch',
  'demo-02-null-ref-bug.patch',
  'demo-01-priority-filter-bug.patch'
]

function printHeader(text, char = '=', width = 70) {
  console.log(char.repeat(width))
  console.log(text)
  console.log(char.repeat(width))
}

function reversePatch(patchName) {
  const patchPath = resolve(projectRoot, 'scripts/patches', patchName)

  console.log(`\nReversing: ${patchName}`)

  try {
    execSync(`git apply --reverse --check "${patchPath}"`, {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: 'pipe'
    })

    execSync(`git apply --reverse "${patchPath}"`, {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: 'pipe'
    })
    console.log('[OK] Reversed successfully.')
    return true
  } catch (error) {
    console.log('[--] Patch not applied, skipping.')
    return true
  }
}

function runFullTestSuite() {
  console.log('\n------------------------------------------------------------')
  console.log('Running full test suite to verify restoration...')
  console.log('------------------------------------------------------------\n')

  try {
    execSync('npm test', {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: 'inherit'
    })
    return true
  } catch (error) {
    return false
  }
}

function main() {
  console.log('')
  printHeader('RESTORING: Reversing all demo patches')

  let allReversed = true

  for (const patch of PATCHES) {
    if (!reversePatch(patch)) {
      allReversed = false
    }
  }

  if (!allReversed) {
    console.log('\n[X] ERROR: Some patches could not be reversed.')
    console.log('You may need to manually restore files using: git checkout -- <file>')
    process.exit(1)
  }

  const testsPass = runFullTestSuite()

  console.log('')
  printHeader('RESTORE COMPLETE')

  if (testsPass) {
    console.log('\n[OK] All tests passing - code restored successfully!')
    console.log('\nThe demo showed how tests catch bugs before they reach production.')
    console.log('Without these tests, all 4 bugs would have required manual debugging.\n')
    process.exit(0)
  } else {
    console.log('\n[X] WARNING: Some tests are still failing.')
    console.log('This may indicate additional patches need reversal or other issues.')
    console.log('Check git status and consider: git checkout -- <file>\n')
    process.exit(1)
  }
}

main()
