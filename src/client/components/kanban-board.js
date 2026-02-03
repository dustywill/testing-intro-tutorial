import Sortable from '/node_modules/sortablejs/modular/sortable.esm.js';
import { updateTask } from '../api/tasksApi.js';

let sortableInstances = [];

const populateColumns = (tasks) => {
  const containers = document.querySelectorAll('.kanban-tasks');
  containers.forEach(container => {
    container.innerHTML = '';
  });

  tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.dataset.taskId = task.id;
    card.tabIndex = 0;
    card.role = 'button';
    card.ariaLabel = `Task card for ${task.assignee || 'Unassigned'}. Press arrow keys to move.`;

    card.innerHTML = `
      <strong>${task.title}</strong>
      <div>${task.assignee || 'Unassigned'} | ${task.priority || 'medium'}</div>
    `;

    const targetContainer = document.querySelector(`.kanban-tasks[data-status="${task.status}"]`);
    if (targetContainer) {
      targetContainer.appendChild(card);
    }
  });

  addKeyboardSupport();
};

const addKeyboardSupport = () => {
  const cards = document.querySelectorAll('.kanban-card');

  cards.forEach(card => {
    card.addEventListener('keydown', async (e) => {
      const taskId = card.dataset.taskId;
      const currentColumn = card.closest('.kanban-tasks');
      const currentStatus = currentColumn.dataset.status;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const newStatus = currentStatus === 'in-progress' ? 'todo' : currentStatus === 'done' ? 'in-progress' : currentStatus;
        if (newStatus !== currentStatus) {
          await updateTask(taskId, { status: newStatus });
          if (window.gridApi) {
            const rowNode = window.gridApi.getRowNode(taskId);
            if (rowNode) {
              window.gridApi.applyTransaction({ update: [{ ...rowNode.data, status: newStatus }] });
            }
          }
          const targetColumn = document.querySelector(`.kanban-tasks[data-status="${newStatus}"]`);
          targetColumn.appendChild(card);
          card.focus();
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const newStatus = currentStatus === 'todo' ? 'in-progress' : currentStatus === 'in-progress' ? 'done' : currentStatus;
        if (newStatus !== currentStatus) {
          await updateTask(taskId, { status: newStatus });
          if (window.gridApi) {
            const rowNode = window.gridApi.getRowNode(taskId);
            if (rowNode) {
              window.gridApi.applyTransaction({ update: [{ ...rowNode.data, status: newStatus }] });
            }
          }
          const targetColumn = document.querySelector(`.kanban-tasks[data-status="${newStatus}"]`);
          targetColumn.appendChild(card);
          card.focus();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const cards = Array.from(currentColumn.children);
        const currentIndex = cards.indexOf(card);
        if (currentIndex > 0) {
          currentColumn.insertBefore(card, cards[currentIndex - 1]);
          card.focus();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const cards = Array.from(currentColumn.children);
        const currentIndex = cards.indexOf(card);
        if (currentIndex < cards.length - 1) {
          currentColumn.insertBefore(cards[currentIndex + 1], card);
          card.focus();
        }
      }
    });
  });
};

export const initKanban = (tasks) => {
  populateColumns(tasks);

  const containers = document.querySelectorAll('.kanban-tasks');

  containers.forEach(container => {
    const sortable = Sortable.create(container, {
      group: 'kanban',
      animation: 150,
      ghostClass: 'sortable-ghost',
      onEnd: async (evt) => {
        const taskId = evt.item.dataset.taskId;

        if (evt.from !== evt.to) {
          const newStatus = evt.to.dataset.status;
          try {
            const updatedTask = await updateTask(taskId, { status: newStatus });
            if (window.gridApi) {
              window.gridApi.applyTransaction({ update: [updatedTask] });
            }
          } catch (error) {
            console.error('Failed to update task status:', error);
            evt.from.insertBefore(evt.item, evt.from.children[evt.oldIndex]);
          }
        }
      }
    });

    sortableInstances.push(sortable);
  });
};

export const refreshKanban = (tasks) => {
  sortableInstances.forEach(instance => instance.destroy());
  sortableInstances = [];

  populateColumns(tasks);

  const containers = document.querySelectorAll('.kanban-tasks');
  containers.forEach(container => {
    const sortable = Sortable.create(container, {
      group: 'kanban',
      animation: 150,
      ghostClass: 'sortable-ghost',
      onEnd: async (evt) => {
        const taskId = evt.item.dataset.taskId;

        if (evt.from !== evt.to) {
          const newStatus = evt.to.dataset.status;
          try {
            const updatedTask = await updateTask(taskId, { status: newStatus });
            if (window.gridApi) {
              window.gridApi.applyTransaction({ update: [updatedTask] });
            }
          } catch (error) {
            console.error('Failed to update task status:', error);
            evt.from.insertBefore(evt.item, evt.from.children[evt.oldIndex]);
          }
        }
      }
    });

    sortableInstances.push(sortable);
  });
};
