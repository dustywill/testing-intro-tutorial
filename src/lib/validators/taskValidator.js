export const validateTaskData = (data) => {
  if (data === null || data === undefined || typeof data !== 'object' || Array.isArray(data)) {
    return {
      valid: false,
      errors: ['task data must be an object']
    }
  }

  const errors = []

  if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
    errors.push('title is required')
  } else if (data.title.length > 200) {
    errors.push('title must be 200 characters or less')
  }

  if (data.status !== undefined && !['todo', 'in-progress', 'done'].includes(data.status)) {
    errors.push('status must be one of: todo, in-progress, done')
  }

  if (data.priority !== undefined && !['low', 'medium', 'high'].includes(data.priority)) {
    errors.push('priority must be one of: low, medium, high')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
