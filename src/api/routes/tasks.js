import { getTasks, addTask, updateTask, deleteTask } from '../../server/data/store.js'
import { validateTaskData } from '../../lib/validators/taskValidator.js'
import { applyFilters } from '../../lib/filters/taskFilters.js'

export const tasksRouter = (app) => {
  app.get('/api/tasks', (req, res) => {
    const tasks = getTasks()
    const filtered = applyFilters(tasks, req.query)
    res.json(filtered)
  })

  app.post('/api/tasks', (req, res) => {
    const validation = validateTaskData(req.body)

    if (!validation.valid) {
      return res.status(400).json({ error: validation.errors.join(', ') })
    }

    const created = addTask(req.body)
    res.status(201).json(created)
  })

  app.put('/api/tasks/:id', (req, res) => {
    const updated = updateTask(req.params.id, req.body)

    if (!updated) {
      return res.status(404).json({ error: `Task ${req.params.id} not found` })
    }

    res.json(updated)
  })

  app.delete('/api/tasks/:id', (req, res) => {
    const deleted = deleteTask(req.params.id)

    if (!deleted) {
      return res.status(404).json({ error: `Task ${req.params.id} not found` })
    }

    res.status(204).send()
  })
}
