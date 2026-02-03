let tasks = [
  { id: 'task-1', title: 'Set up CI pipeline', status: 'done', assignee: 'Alice', dueDate: '2025-02-15', priority: 'high', createdAt: '2025-01-10T10:00:00Z' },
  { id: 'task-2', title: 'Write unit tests for auth', status: 'in-progress', assignee: 'Bob', dueDate: '2025-02-20', priority: 'high', createdAt: '2025-01-12T09:00:00Z' },
  { id: 'task-3', title: 'Refactor database queries', status: 'todo', assignee: 'Alice', dueDate: '2025-03-01', priority: 'medium', createdAt: '2025-01-15T14:00:00Z' },
  { id: 'task-4', title: 'Add error logging', status: 'todo', assignee: 'Charlie', dueDate: '2025-03-10', priority: 'low', createdAt: '2025-01-18T11:00:00Z' },
  { id: 'task-5', title: 'Review pull requests', status: 'in-progress', assignee: 'Bob', dueDate: '2025-02-25', priority: 'medium', createdAt: '2025-01-20T08:00:00Z' }
]

export const getTasks = () => {
  return [...tasks]
}

export const getTaskById = (id) => {
  return tasks.find(t => t.id === id)
}

export const addTask = (taskData) => {
  const task = {
    id: taskData.id || `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...taskData,
    createdAt: taskData.createdAt || new Date().toISOString()
  }
  tasks.push(task)
  return { ...task }
}

export const updateTask = (id, updates) => {
  const index = tasks.findIndex(t => t.id === id)
  if (index === -1) return null

  const updated = {
    ...tasks[index],
    ...updates,
    id: tasks[index].id
  }
  tasks[index] = updated
  return { ...updated }
}

export const deleteTask = (id) => {
  const index = tasks.findIndex(t => t.id === id)
  if (index === -1) return false

  tasks.splice(index, 1)
  return true
}

export const seedTasks = (taskArray) => {
  tasks = [...taskArray]
}

export const clearTasks = () => {
  tasks = []
}
