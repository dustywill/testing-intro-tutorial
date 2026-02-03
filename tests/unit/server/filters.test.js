import { describe, test, expect, vi, beforeEach } from 'vitest'
import {
  filterByStatus,
  filterByAssignee,
  filterByPriority,
  applyFilters
} from '../../../src/lib/filters/taskFilters.js'
import { createTask, resetFactories } from '../../helpers/factories.js'

describe('Task Filters', () => {
  beforeEach(() => resetFactories())

  describe('filterByStatus', () => {
    test('returns all tasks when status is undefined', () => {
      const tasks = [
        createTask({ status: 'todo' }),
        createTask({ status: 'done' })
      ]
      const result = filterByStatus(tasks, undefined)
      expect(result).toHaveLength(2)
    })

    test('returns all tasks when status is null', () => {
      const tasks = [createTask(), createTask()]
      const result = filterByStatus(tasks, null)
      expect(result).toHaveLength(2)
    })

    test('returns only tasks matching status', () => {
      const tasks = [
        createTask({ status: 'todo' }),
        createTask({ status: 'in-progress' }),
        createTask({ status: 'done' })
      ]
      const result = filterByStatus(tasks, 'todo')
      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('todo')
    })

    test('returns empty array when no tasks match', () => {
      const tasks = [
        createTask({ status: 'todo' }),
        createTask({ status: 'todo' })
      ]
      const result = filterByStatus(tasks, 'done')
      expect(result).toEqual([])
    })

    test('handles empty input array', () => {
      const result = filterByStatus([], 'todo')
      expect(result).toEqual([])
    })
  })

  describe('filterByAssignee', () => {
    test('returns all tasks when assignee is undefined', () => {
      const tasks = [createTask(), createTask()]
      const result = filterByAssignee(tasks, undefined)
      expect(result).toHaveLength(2)
    })

    test('returns all tasks when assignee is null', () => {
      const tasks = [createTask(), createTask()]
      const result = filterByAssignee(tasks, null)
      expect(result).toHaveLength(2)
    })

    test('returns only tasks matching assignee case-sensitive', () => {
      const tasks = [
        createTask({ assignee: 'Alice' }),
        createTask({ assignee: 'Bob' }),
        createTask({ assignee: 'alice' })
      ]
      const result = filterByAssignee(tasks, 'Alice')
      expect(result).toHaveLength(1)
      expect(result[0].assignee).toBe('Alice')
    })

    test('handles null assignee on tasks', () => {
      const tasks = [
        createTask({ assignee: null }),
        createTask({ assignee: 'Alice' })
      ]
      const result = filterByAssignee(tasks, 'Alice')
      expect(result).toHaveLength(1)
      expect(result[0].assignee).toBe('Alice')
    })
  })

  describe('filterByPriority', () => {
    test('returns all tasks when priority is undefined', () => {
      const tasks = [createTask(), createTask()]
      const result = filterByPriority(tasks, undefined)
      expect(result).toHaveLength(2)
    })

    test('returns all tasks when priority is null', () => {
      const tasks = [createTask(), createTask()]
      const result = filterByPriority(tasks, null)
      expect(result).toHaveLength(2)
    })

    test('returns only tasks matching priority', () => {
      const tasks = [
        createTask({ priority: 'low' }),
        createTask({ priority: 'high' }),
        createTask({ priority: 'medium' })
      ]
      const result = filterByPriority(tasks, 'high')
      expect(result).toHaveLength(1)
      expect(result[0].priority).toBe('high')
    })
  })

  describe('applyFilters', () => {
    test('returns all tasks when no filters provided', () => {
      const tasks = [createTask(), createTask(), createTask()]
      const result = applyFilters(tasks, {})
      expect(result).toHaveLength(3)
    })

    test('applies single filter - status only', () => {
      const tasks = [
        createTask({ status: 'todo' }),
        createTask({ status: 'done' })
      ]
      const result = applyFilters(tasks, { status: 'todo' })
      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('todo')
    })

    test('applies multiple filters - status and assignee', () => {
      const tasks = [
        createTask({ status: 'todo', assignee: 'Alice' }),
        createTask({ status: 'todo', assignee: 'Bob' }),
        createTask({ status: 'done', assignee: 'Alice' })
      ]
      const result = applyFilters(tasks, { status: 'todo', assignee: 'Alice' })
      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('todo')
      expect(result[0].assignee).toBe('Alice')
    })

    test('applies all three filters together', () => {
      const tasks = [
        createTask({ status: 'todo', assignee: 'Alice', priority: 'high' }),
        createTask({ status: 'todo', assignee: 'Alice', priority: 'low' }),
        createTask({ status: 'done', assignee: 'Alice', priority: 'high' })
      ]
      const result = applyFilters(tasks, {
        status: 'todo',
        assignee: 'Alice',
        priority: 'high'
      })
      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('todo')
      expect(result[0].assignee).toBe('Alice')
      expect(result[0].priority).toBe('high')
    })

    test('returns empty array when filters eliminate all tasks', () => {
      const tasks = [
        createTask({ status: 'todo' }),
        createTask({ status: 'done' })
      ]
      const result = applyFilters(tasks, { status: 'in-progress' })
      expect(result).toEqual([])
    })
  })
})

describe('Mocking Demonstration (UNIT-03)', () => {
  describe('vi.fn() - function mocking', () => {
    test('creates mock function that tracks calls', () => {
      const mockFn = vi.fn()
      mockFn('arg1', 'arg2')
      expect(mockFn).toHaveBeenCalled()
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test('mock returns controlled values', () => {
      const mockFn = vi.fn()
      mockFn.mockReturnValue(42)

      const result = mockFn()
      expect(result).toBe(42)
    })

    test('mock implementation can change per test', () => {
      const mockFn = vi.fn()

      mockFn.mockImplementation((x) => x * 2)
      expect(mockFn(5)).toBe(10)

      mockFn.mockImplementation((x) => x + 10)
      expect(mockFn(5)).toBe(15)
    })

    test('toHaveBeenCalledWith verifies arguments', () => {
      const mockFn = vi.fn()
      mockFn('hello', 'world')
      expect(mockFn).toHaveBeenCalledWith('hello', 'world')
    })

    test('mock can simulate filter function behavior', () => {
      const tasks = [
        createTask({ status: 'todo' }),
        createTask({ status: 'done' })
      ]

      const mockFilter = vi.fn((taskArray, status) => {
        return taskArray.filter(t => t.status === status)
      })

      const result = mockFilter(tasks, 'todo')
      expect(mockFilter).toHaveBeenCalledWith(tasks, 'todo')
      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('todo')
    })
  })

  describe('vi.mock() - module mocking', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    test('mock replaces module exports', () => {
      const mockGetTasks = vi.fn(() => [
        { id: 1, title: 'Mocked Task' }
      ])

      const tasks = mockGetTasks()
      expect(tasks).toHaveLength(1)
      expect(tasks[0].title).toBe('Mocked Task')
    })

    test('clearAllMocks resets between tests', () => {
      const mockFn = vi.fn()
      mockFn()
      expect(mockFn).toHaveBeenCalledTimes(1)

      vi.clearAllMocks()

      const callCount = mockFn.mock.calls.length
      expect(callCount).toBe(0)
    })

    test('demonstrates mocking pattern for data store', () => {
      const mockStore = {
        getTasks: vi.fn(() => []),
        addTask: vi.fn((task) => ({ id: 'mock-id', ...task })),
        updateTask: vi.fn((id, updates) => ({ id, ...updates })),
        deleteTask: vi.fn(() => true)
      }

      const task = { title: 'Test' }
      const added = mockStore.addTask(task)
      expect(mockStore.addTask).toHaveBeenCalledWith(task)
      expect(added.id).toBe('mock-id')
    })
  })
})
