import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { tasksRouter } from './routes/tasks.js'
import { errorHandler } from './middleware/errorHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const createApp = () => {
  const app = express()

  app.use('/node_modules', express.static(path.join(__dirname, '..', '..', 'node_modules')))
  app.use(express.static(path.join(__dirname, '..', 'client')))
  app.use(express.json())

  tasksRouter(app)

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' })
  })

  app.use(errorHandler)

  return app
}
