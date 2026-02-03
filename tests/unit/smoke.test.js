import { describe, test, expect } from 'vitest'
import { createTask, createProject, resetFactories } from '../helpers/factories.js'

describe('Test Infrastructure Smoke Test', () => {
  test('vitest runs with explicit imports', () => {
    expect(true).toBe(true)
  })

  test('createTask factory produces valid task with defaults', () => {
    const task = createTask()
    expect(task).toHaveProperty('id')
    expect(task).toHaveProperty('title', 'Test Task')
    expect(task).toHaveProperty('status', 'todo')
    expect(task).toHaveProperty('priority', 'medium')
    expect(task).toHaveProperty('dueDate', '2026-12-31')
  })

  test('createTask factory accepts overrides', () => {
    const task = createTask({ title: 'Custom Task', priority: 'high' })
    expect(task.title).toBe('Custom Task')
    expect(task.priority).toBe('high')
    expect(task.status).toBe('todo')
  })

  test('createProject factory produces valid project with defaults', () => {
    const project = createProject()
    expect(project).toHaveProperty('id')
    expect(project).toHaveProperty('name', 'Test Project')
    expect(project).toHaveProperty('taskIds')
    expect(project.taskIds).toEqual([])
  })

  test('createProject factory accepts overrides', () => {
    const project = createProject({ name: 'My Project', taskIds: ['task-1'] })
    expect(project.name).toBe('My Project')
    expect(project.taskIds).toEqual(['task-1'])
  })

  test('resetFactories resets ID counters', () => {
    resetFactories()
    const task1 = createTask()
    const task2 = createTask()
    expect(task1.id).toBe('task-1')
    expect(task2.id).toBe('task-2')
    resetFactories()
    const task3 = createTask()
    expect(task3.id).toBe('task-1')
  })
})
