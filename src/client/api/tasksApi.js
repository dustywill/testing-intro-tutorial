export const fetchTasks = async () => {
  const response = await fetch('/api/tasks');
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
};

export const createTask = async (taskData) => {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
};

export const updateTask = async (id, updates) => {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
};

export const deleteTask = async (id) => {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return true;
};
