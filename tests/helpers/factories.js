let taskCounter = 1
let projectCounter = 1

/**
 * Create a task object with default values and optional overrides
 * @param {Object} overrides - Fields to override from defaults
 * @returns {Object} Task object
 */
export const createTask = (overrides = {}) => {
  return {
    id: overrides.id ?? `task-${taskCounter++}`,
    title: overrides.title ?? 'Test Task',
    description: overrides.description ?? 'Test description',
    status: overrides.status ?? 'todo',
    priority: overrides.priority ?? 'medium',
    assignee: overrides.assignee ?? null,
    dueDate: overrides.dueDate ?? '2026-12-31',
    createdAt: overrides.createdAt ?? new Date().toISOString()
  }
}

/**
 * Create a project object with default values and optional overrides
 * @param {Object} overrides - Fields to override from defaults
 * @returns {Object} Project object
 */
export const createProject = (overrides = {}) => {
  return {
    id: overrides.id ?? `project-${projectCounter++}`,
    name: overrides.name ?? 'Test Project',
    description: overrides.description ?? 'Test project description',
    taskIds: overrides.taskIds ?? [],
    createdAt: overrides.createdAt ?? new Date().toISOString()
  }
}

/**
 * Reset factory ID counters to 1
 * Call in beforeEach if deterministic IDs are needed
 */
export const resetFactories = () => {
  taskCounter = 1
  projectCounter = 1
}
