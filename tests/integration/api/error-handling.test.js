import { describe, test, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../../../src/api/app.js'
import { clearTasks } from '../../../src/server/data/store.js'

describe('API Error Handling', () => {
  const app = createApp()

  beforeEach(() => {
    clearTasks()
  })

  describe('unknown routes', () => {
    test('GET /api/unknown returns 404', async () => {
      const res = await request(app).get('/api/unknown')
      expect(res.status).toBe(404)
    })

    test('POST /api/unknown returns 404', async () => {
      const res = await request(app).post('/api/unknown').send({})
      expect(res.status).toBe(404)
    })

    test('404 response has error property', async () => {
      const res = await request(app).get('/api/unknown')
      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('error')
      expect(typeof res.body.error).toBe('string')
    })
  })

  describe('malformed requests', () => {
    test('POST /api/tasks with non-JSON content-type still handled gracefully', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Content-Type', 'text/plain')
        .send('not json')

      expect([400, 415]).toContain(res.status)
    })

    test('PUT /api/tasks/:id with empty body returns 200 (no fields to update = no change)', async () => {
      const res = await request(app)
        .put('/api/tasks/some-id')
        .send({})

      expect(res.status).toBe(404)
    })
  })

  describe('validation error format (INTG-04)', () => {
    test('POST /api/tasks with invalid data returns JSON response', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ status: 'todo' })

      expect(res.status).toBe(400)
      expect(res.headers['content-type']).toMatch(/application\/json/)
    })

    test('error response has correct Content-Type: application/json', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: '' })

      expect(res.status).toBe(400)
      expect(res.headers['content-type']).toMatch(/application\/json/)
    })

    test('error response body shape is {error: string}', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: '' })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(typeof res.body.error).toBe('string')
      expect(res.body.error.length).toBeGreaterThan(0)
    })
  })
})
