export const filterByStatus = (tasks, status) => {
  if (!status) return [...tasks]
  return tasks.filter(task => task.status === status)
}

export const filterByAssignee = (tasks, assignee) => {
  if (!assignee) return [...tasks]
  return tasks.filter(task => task.assignee === assignee)
}

export const filterByPriority = (tasks, priority) => {
  if (!priority) return [...tasks]
  return tasks.filter(task => task.priority === priority)
}

export const applyFilters = (tasks, filters) => {
  let result = tasks

  if (filters.status) {
    result = filterByStatus(result, filters.status)
  }

  if (filters.assignee) {
    result = filterByAssignee(result, filters.assignee)
  }

  if (filters.priority) {
    result = filterByPriority(result, filters.priority)
  }

  return result
}
