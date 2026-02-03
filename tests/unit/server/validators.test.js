import { describe, test, expect } from 'vitest'
import { validateTaskData } from '../../../src/lib/validators/taskValidator.js'

describe('validateTaskData', () => {
  describe('valid input', () => {
    test('returns valid=true for complete task with title and valid status', () => {
      const result = validateTaskData({
        title: 'Valid Task',
        status: 'todo'
      })
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    test('accepts task with only title', () => {
      const result = validateTaskData({ title: 'Task' })
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    test('accepts null assignee', () => {
      const result = validateTaskData({
        title: 'Task',
        assignee: null
      })
      expect(result.valid).toBe(true)
    })

    test('accepts empty tags array', () => {
      const result = validateTaskData({
        title: 'Task',
        tags: []
      })
      expect(result.valid).toBe(true)
    })
  })

  describe('title validation', () => {
    test('returns error when title is missing', () => {
      const result = validateTaskData({})
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('title is required')
    })

    test('returns error when title is null', () => {
      const result = validateTaskData({ title: null })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('title is required')
    })

    test('returns error when title is empty string', () => {
      const result = validateTaskData({ title: '' })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('title is required')
    })

    test('returns error when title is whitespace only', () => {
      const result = validateTaskData({ title: '   ' })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('title is required')
    })

    test('returns error when title exceeds 200 characters', () => {
      const longTitle = 'a'.repeat(201)
      const result = validateTaskData({ title: longTitle })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('title must be 200 characters or less')
    })
  })

  describe('status validation', () => {
    test('accepts todo status', () => {
      const result = validateTaskData({ title: 'Task', status: 'todo' })
      expect(result.valid).toBe(true)
    })

    test('accepts in-progress status', () => {
      const result = validateTaskData({ title: 'Task', status: 'in-progress' })
      expect(result.valid).toBe(true)
    })

    test('accepts done status', () => {
      const result = validateTaskData({ title: 'Task', status: 'done' })
      expect(result.valid).toBe(true)
    })

    test('returns error for invalid status value', () => {
      const result = validateTaskData({ title: 'Task', status: 'invalid' })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('status must be one of: todo, in-progress, done')
    })

    test('allows missing status', () => {
      const result = validateTaskData({ title: 'Task' })
      expect(result.valid).toBe(true)
    })
  })

  describe('priority validation', () => {
    test('accepts low priority', () => {
      const result = validateTaskData({ title: 'Task', priority: 'low' })
      expect(result.valid).toBe(true)
    })

    test('accepts medium priority', () => {
      const result = validateTaskData({ title: 'Task', priority: 'medium' })
      expect(result.valid).toBe(true)
    })

    test('accepts high priority', () => {
      const result = validateTaskData({ title: 'Task', priority: 'high' })
      expect(result.valid).toBe(true)
    })

    test('returns error for invalid priority', () => {
      const result = validateTaskData({ title: 'Task', priority: 'urgent' })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('priority must be one of: low, medium, high')
    })

    test('allows missing priority', () => {
      const result = validateTaskData({ title: 'Task' })
      expect(result.valid).toBe(true)
    })
  })

  describe('multiple errors', () => {
    test('returns multiple errors when both title missing and status invalid', () => {
      const result = validateTaskData({ status: 'invalid' })
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(2)
      expect(result.errors).toContain('title is required')
      expect(result.errors).toContain('status must be one of: todo, in-progress, done')
    })

    test('errors array length matches number of violations', () => {
      const result = validateTaskData({
        title: '',
        status: 'wrong',
        priority: 'urgent'
      })
      expect(result.errors.length).toBe(3)
    })
  })

  describe('boundary conditions', () => {
    test('handles undefined input', () => {
      const result = validateTaskData(undefined)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('task data must be an object')
    })

    test('handles null input', () => {
      const result = validateTaskData(null)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('task data must be an object')
    })

    test('handles non-object input like string', () => {
      const result = validateTaskData('not an object')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('task data must be an object')
    })
  })
})
