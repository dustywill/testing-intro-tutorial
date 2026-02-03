import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

function printHeader(text, char = '=', width = 70) {
  console.log(char.repeat(width))
  console.log(text)
  console.log(char.repeat(width))
}

function createScaffoldedTestFile() {
  console.log('\n[1/2] Creating scaffolded test file...')

  const testDir = resolve(projectRoot, 'tests', 'unit')
  const testPath = resolve(testDir, 'tutorial-exercise.test.js')

  if (!existsSync(testDir)) {
    mkdirSync(testDir, { recursive: true })
  }

  const testContent = `import { describe, test, expect } from 'vitest'
import { createTask } from '../helpers/factories.js'

describe('Exercise 5: Write Your Own Test', () => {
  test('should verify task creation with custom title', () => {
    const task = createTask({ title: 'My Custom Task' })

    // TODO: Write your test assertion here
    // Goal: Verify that the task's title property equals 'My Custom Task'
    //
    // Your assertion should:
    // 1. Use expect() to create an assertion
    // 2. Check the task's title property
    // 3. Verify it matches 'My Custom Task'
    //
    // Example assertion structure:
    // expect(something).toBe(expectedValue)

    // REPLACE THIS LINE WITH YOUR ASSERTION:
    expect(true).toBe(false) // This will fail - write the correct assertion!
  })
})
`

  writeFileSync(testPath, testContent, 'utf-8')
  console.log(`      Created: ${testPath}`)
}

function verifyCreation() {
  console.log('\n[2/2] Verifying test file...')

  const testPath = resolve(projectRoot, 'tests', 'unit', 'tutorial-exercise.test.js')

  if (existsSync(testPath)) {
    console.log('      Test file exists and is ready.')
  } else {
    console.log('[X] ERROR: Failed to create test file')
    process.exit(1)
  }
}

function main() {
  console.log('')
  printHeader('TUTORIAL SETUP: Exercise 5')
  console.log('\nThis creates a scaffolded test file for you to complete.')
  console.log('You will write your own test assertion to practice TDD.')

  createScaffoldedTestFile()
  verifyCreation()

  console.log('')
  printHeader('SETUP COMPLETE')

  console.log('\n[OK] Test file created: tests/unit/tutorial-exercise.test.js')
  console.log('')
  console.log('Next steps:')
  console.log('  1. Open tests/unit/tutorial-exercise.test.js in your editor')
  console.log('  2. Find the TODO comment')
  console.log('  3. Write your test assertion')
  console.log('  4. Run: npm run test:unit')
  console.log('  5. Verify your test passes')
  console.log('')
  console.log('Hint: Look for progressive hints in the tutorial if you get stuck!')
  console.log('------------------------------------------------------------\n')

  process.exit(0)
}

main()
