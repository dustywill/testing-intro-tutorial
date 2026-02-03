import { describe, test, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../../../src/api/app.js'
import { clearTasks, seedTasks } from '../../../src/server/data/store.js'
import { createTask, resetFactories } from '../../helpers/factories.js'

describe('Tasks API - CRUD', () => {
  const app = createApp()

  beforeEach(() => {
    clearTasks()
    resetFactories()
  })

  describe('GET /api/tasks', () => {
    test('returns 200 with empty array when no tasks', async () => {
      const res = await request(app).get('/api/tasks')
      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    test('returns 200 with all tasks when seeded', async () => {
      const tasks = [
        createTask({ title: 'Task 1' }),
        createTask({ title: 'Task 2' })
      ]
      seedTasks(tasks)

      const res = await request(app).get('/api/tasks')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
    })

    test('response body is an array', async () => {
      const res = await request(app).get('/api/tasks')
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })

    test('each task has id, title, status properties', async () => {
      seedTasks([createTask({ title: 'Test Task', status: 'todo' })])

      const res = await request(app).get('/api/tasks')
      expect(res.status).toBe(200)
      expect(res.body[0]).toHaveProperty('id')
      expect(res.body[0]).toHaveProperty('title')
      expect(res.body[0]).toHaveProperty('status')
    })
  })

  describe('POST /api/tasks', () => {
    test('returns 201 with created task for valid data', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'New Task', status: 'todo' })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('title', 'New Task')
      expect(res.body).toHaveProperty('status', 'todo')
    })

    test('created task has generated id', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'New Task' })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('id')
      expect(typeof res.body.id).toBe('string')
      expect(res.body.id.length).toBeGreaterThan(0)
    })

    test('created task has createdAt timestamp', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'New Task' })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('createdAt')
      expect(typeof res.body.createdAt).toBe('string')
    })

    test('task appears in subsequent GET /api/tasks', async () => {
      await request(app)
        .post('/api/tasks')
        .send({ title: 'New Task' })

      const res = await request(app).get('/api/tasks')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0].title).toBe('New Task')
    })

    test('returns 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ status: 'todo' })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toMatch(/title/i)
    })

    test('returns 400 when title is empty string', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: '', status: 'todo' })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toMatch(/title/i)
    })

    test('returns 400 for invalid status value', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test', status: 'invalid-status' })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
    })

    test('error response body has error property containing title message', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ status: 'todo' })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(typeof res.body.error).toBe('string')
      expect(res.body.error).toContain('title')
    })
  })

  describe('PUT /api/tasks/:id', () => {
    test('returns 200 with updated task when task exists', async () => {
      const task = createTask({ title: 'Original Title', status: 'todo' })
      seedTasks([task])

      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ title: 'Updated Title' })

      expect(res.status).toBe(200)
      expect(res.body.title).toBe('Updated Title')
      expect(res.body.id).toBe(task.id)
    })

    test('only updates provided fields (partial update)', async () => {
      const task = createTask({ title: 'Original', status: 'todo', priority: 'high' })
      seedTasks([task])

      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ status: 'done' })

      expect(res.status).toBe(200)
      expect(res.body.title).toBe('Original')
      expect(res.body.status).toBe('done')
      expect(res.body.priority).toBe('high')
    })

    test('cannot change task ID via update body', async () => {
      const task = createTask()
      seedTasks([task])

      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ id: 'different-id', title: 'Updated' })

      expect(res.status).toBe(200)
      expect(res.body.id).toBe(task.id)
    })

    test('returns 404 when task ID does not exist', async () => {
      const res = await request(app)
        .put('/api/tasks/nonexistent-id')
        .send({ title: 'Updated' })

      expect(res.status).toBe(404)
    })

    test('returns 404 body has error property', async () => {
      const res = await request(app)
        .put('/api/tasks/nonexistent-id')
        .send({ title: 'Updated' })

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('error')
      expect(typeof res.body.error).toBe('string')
    })
  })

  describe('DELETE /api/tasks/:id', () => {
    test('returns 204 (no content) when task exists', async () => {
      const task = createTask()
      seedTasks([task])

      const res = await request(app).delete(`/api/tasks/${task.id}`)
      expect(res.status).toBe(204)
    })

    test('task no longer appears in GET /api/tasks after delete', async () => {
      const task = createTask({ title: 'To Delete' })
      seedTasks([task])

      await request(app).delete(`/api/tasks/${task.id}`)

      const res = await request(app).get('/api/tasks')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(0)
    })

    test('returns 404 when task ID does not exist', async () => {
      const res = await request(app).delete('/api/tasks/nonexistent-id')
      expect(res.status).toBe(404)
    })
  })
})
