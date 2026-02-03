import { describe, test, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../../../src/api/app.js'
import { clearTasks, seedTasks } from '../../../src/server/data/store.js'
import { createTask, resetFactories } from '../../helpers/factories.js'

describe('Tasks API - Filtering', () => {
  const app = createApp()

  beforeEach(() => {
    clearTasks()
    resetFactories()
    seedTasks([
      createTask({ title: 'Task A', status: 'todo', assignee: 'Alice', priority: 'high' }),
      createTask({ title: 'Task B', status: 'done', assignee: 'Bob', priority: 'low' }),
      createTask({ title: 'Task C', status: 'todo', assignee: 'Alice', priority: 'medium' }),
      createTask({ title: 'Task D', status: 'in-progress', assignee: 'Charlie', priority: 'high' })
    ])
  })

  describe('single filter', () => {
    test('GET /api/tasks?status=todo returns 2 tasks', async () => {
      const res = await request(app).get('/api/tasks?status=todo')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
      expect(res.body.every(t => t.status === 'todo')).toBe(true)
    })

    test('GET /api/tasks?status=done returns 1 task', async () => {
      const res = await request(app).get('/api/tasks?status=done')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].status).toBe('done')
    })

    test('GET /api/tasks?assignee=Alice returns 2 tasks', async () => {
      const res = await request(app).get('/api/tasks?assignee=Alice')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
      expect(res.body.every(t => t.assignee === 'Alice')).toBe(true)
    })

    test('GET /api/tasks?assignee=Bob returns 1 task', async () => {
      const res = await request(app).get('/api/tasks?assignee=Bob')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].assignee).toBe('Bob')
    })

    test('GET /api/tasks?priority=high returns 2 tasks', async () => {
      const res = await request(app).get('/api/tasks?priority=high')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
      expect(res.body.every(t => t.priority === 'high')).toBe(true)
    })
  })

  describe('multiple filters (intersection)', () => {
    test('GET /api/tasks?status=todo&assignee=Alice returns 2 tasks', async () => {
      const res = await request(app).get('/api/tasks?status=todo&assignee=Alice')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
      expect(res.body.every(t => t.status === 'todo' && t.assignee === 'Alice')).toBe(true)
    })

    test('GET /api/tasks?status=done&assignee=Alice returns 0 tasks', async () => {
      const res = await request(app).get('/api/tasks?status=done&assignee=Alice')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(0)
    })

    test('GET /api/tasks?status=todo&priority=high returns 1 task', async () => {
      const res = await request(app).get('/api/tasks?status=todo&priority=high')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].title).toBe('Task A')
    })

    test('GET /api/tasks?status=todo&assignee=Alice&priority=medium returns 1 task', async () => {
      const res = await request(app).get('/api/tasks?status=todo&assignee=Alice&priority=medium')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].title).toBe('Task C')
    })
  })

  describe('no matching results', () => {
    test('GET /api/tasks?status=archived returns empty array (not 404)', async () => {
      const res = await request(app).get('/api/tasks?status=archived')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(0)
      expect(Array.isArray(res.body)).toBe(true)
    })

    test('GET /api/tasks?assignee=Nobody returns empty array', async () => {
      const res = await request(app).get('/api/tasks?assignee=Nobody')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(0)
      expect(Array.isArray(res.body)).toBe(true)
    })
  })

  describe('no filters', () => {
    test('GET /api/tasks returns all 4 tasks when no query params', async () => {
      const res = await request(app).get('/api/tasks')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(4)
    })

    test('GET /api/tasks? (empty query string) returns all 4 tasks', async () => {
      const res = await request(app).get('/api/tasks?')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(4)
    })
  })
})
