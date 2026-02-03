import { describe, test, expect, beforeEach } from 'vitest'
import { createTask, resetFactories } from '../../helpers/factories.js'
import {
  getTasks,
  getTaskById,
  addTask,
  updateTask,
  deleteTask,
  clearTasks,
  seedTasks
} from '../../../src/server/data/store.js'

describe('Task Store', () => {
  beforeEach(() => {
    clearTasks()
    resetFactories()
  })

  describe('getTasks', () => {
    test('returns empty array when no tasks exist', () => {
      const tasks = getTasks()
      expect(tasks).toEqual([])
    })

    test('returns all seeded tasks', () => {
      const seedData = [createTask(), createTask()]
      seedTasks(seedData)
      const tasks = getTasks()
      expect(tasks).toHaveLength(2)
      expect(tasks[0].id).toBe('task-1')
      expect(tasks[1].id).toBe('task-2')
    })
  })

  describe('getTaskById', () => {
    test('returns task when ID exists', () => {
      const task = createTask({ id: 'task-100' })
      seedTasks([task])
      const result = getTaskById('task-100')
      expect(result).toEqual(task)
    })

    test('returns undefined when ID does not exist', () => {
      seedTasks([createTask()])
      const result = getTaskById('nonexistent')
      expect(result).toBeUndefined()
    })

    test('returns undefined for null ID', () => {
      seedTasks([createTask()])
      const result = getTaskById(null)
      expect(result).toBeUndefined()
    })

    test('returns undefined for empty string ID', () => {
      seedTasks([createTask()])
      const result = getTaskById('')
      expect(result).toBeUndefined()
    })
  })

  describe('addTask', () => {
    test('adds task and returns it with generated ID', () => {
      const taskData = { title: 'New Task', status: 'todo' }
      const result = addTask(taskData)

      expect(result).toHaveProperty('id')
      expect(result.title).toBe('New Task')
      expect(result.status).toBe('todo')

      const allTasks = getTasks()
      expect(allTasks).toHaveLength(1)
      expect(allTasks[0]).toEqual(result)
    })

    test('auto-generates ID if not provided', () => {
      const taskData = { title: 'Task without ID' }
      const result = addTask(taskData)

      expect(result.id).toMatch(/^task-/)
      expect(result.title).toBe('Task without ID')
    })

    test('preserves provided ID if given', () => {
      const taskData = { id: 'custom-id', title: 'Custom ID Task' }
      const result = addTask(taskData)

      expect(result.id).toBe('custom-id')
    })

    test('adds createdAt timestamp if not provided', () => {
      const taskData = { title: 'Task' }
      const result = addTask(taskData)

      expect(result.createdAt).toBeDefined()
      expect(typeof result.createdAt).toBe('string')
    })
  })

  describe('updateTask', () => {
    test('updates existing task fields immutably', () => {
      const original = createTask({ title: 'Original', status: 'todo' })
      seedTasks([original])

      const result = updateTask(original.id, { title: 'Updated' })

      expect(result).not.toBe(original)
      expect(result.title).toBe('Updated')
      expect(result.status).toBe('todo')
      expect(result.id).toBe(original.id)
    })

    test('returns null when task ID does not exist', () => {
      const result = updateTask('nonexistent', { title: 'Update' })
      expect(result).toBeNull()
    })

    test('does not modify other tasks', () => {
      const task1 = createTask({ id: 'task-1', title: 'Task 1' })
      const task2 = createTask({ id: 'task-2', title: 'Task 2' })
      seedTasks([task1, task2])

      updateTask('task-1', { title: 'Updated Task 1' })

      const tasks = getTasks()
      expect(tasks[1].title).toBe('Task 2')
    })

    test('handles partial updates', () => {
      const original = createTask({ title: 'Original', status: 'todo', priority: 'low' })
      seedTasks([original])

      const result = updateTask(original.id, { status: 'done' })

      expect(result.title).toBe('Original')
      expect(result.status).toBe('done')
      expect(result.priority).toBe('low')
    })
  })

  describe('deleteTask', () => {
    test('removes task and returns true', () => {
      const task = createTask()
      seedTasks([task])

      const result = deleteTask(task.id)

      expect(result).toBe(true)
      expect(getTasks()).toHaveLength(0)
    })

    test('returns false when task ID does not exist', () => {
      const result = deleteTask('nonexistent')
      expect(result).toBe(false)
    })
  })

  describe('seedTasks', () => {
    test('replaces all tasks with provided array', () => {
      seedTasks([createTask(), createTask()])
      expect(getTasks()).toHaveLength(2)

      const newTasks = [createTask()]
      seedTasks(newTasks)
      expect(getTasks()).toHaveLength(1)
    })

    test('creates spread copy not reference', () => {
      const original = [createTask()]
      seedTasks(original)

      original.push(createTask())

      expect(getTasks()).toHaveLength(1)
    })

    test('clears existing tasks before seeding', () => {
      seedTasks([createTask(), createTask()])
      seedTasks([createTask()])
      expect(getTasks()).toHaveLength(1)
    })
  })

  describe('clearTasks', () => {
    test('removes all tasks', () => {
      seedTasks([createTask(), createTask()])
      clearTasks()
      expect(getTasks()).toHaveLength(0)
    })

    test('getTasks returns empty array after clear', () => {
      seedTasks([createTask()])
      clearTasks()
      const result = getTasks()
      expect(result).toEqual([])
    })
  })
})
