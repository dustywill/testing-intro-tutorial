import { createGrid, AllCommunityModule, ModuleRegistry, setupAgTestIds } from '/node_modules/ag-grid-community/dist/package/main.esm.mjs';
import { fetchTasks, createTask, updateTask, deleteTask } from './api/tasksApi.js';
import { initWidgets, updateWidgetContent } from './components/dashboard-widgets.js';
import { initKanban, refreshKanban } from './components/kanban-board.js';

ModuleRegistry.registerModules([AllCommunityModule]);
setupAgTestIds();

const columnDefs = [
  { field: 'title', headerName: 'Title', editable: true, filter: true, flex: 2 },
  { field: 'status', headerName: 'Status', editable: true, filter: true, flex: 1 },
  { field: 'assignee', headerName: 'Assignee', editable: true, filter: true, flex: 1 },
  { field: 'dueDate', headerName: 'Due Date', editable: true, filter: true, flex: 1 },
  { field: 'priority', headerName: 'Priority', editable: true, filter: true, flex: 1 },
];

const gridOptions = {
  rowData: [],
  columnDefs,
  defaultColDef: { sortable: true, resizable: true },
  rowSelection: { mode: 'singleRow', checkboxes: false, enableClickSelection: true },
  getRowId: (params) => params.data.id,
  onCellValueChanged: async (event) => {
    try {
      await updateTask(event.data.id, event.data);

      const allTasks = [];
      event.api.forEachNode(node => allTasks.push(node.data));
      updateWidgetContent(allTasks);
      refreshKanban(allTasks);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  },
  onSelectionChanged: () => {
    const deleteBtn = document.getElementById('deleteBtn');
    const selectedRows = gridApi.getSelectedRows();
    deleteBtn.disabled = selectedRows.length === 0;
  },
  onRowDoubleClicked: (event) => {
    const taskFormSection = document.getElementById('taskFormSection');
    const taskForm = document.getElementById('taskForm');

    taskForm.elements.id.value = event.data.id;
    taskForm.elements.title.value = event.data.title || '';
    taskForm.elements.status.value = event.data.status || 'todo';
    taskForm.elements.assignee.value = event.data.assignee || '';
    taskForm.elements.dueDate.value = event.data.dueDate || '';
    taskForm.elements.priority.value = event.data.priority || 'medium';

    taskFormSection.removeAttribute('hidden');
  },
};

let gridApi;

document.addEventListener('DOMContentLoaded', async () => {
  const gridElement = document.getElementById('myGrid');
  gridApi = createGrid(gridElement, gridOptions);

  const tasks = await fetchTasks();
  gridApi.setGridOption('rowData', tasks);

  initWidgets('widget-container');
  updateWidgetContent(tasks);
  initKanban(tasks);

  window.gridApi = gridApi;

  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    gridApi.setGridOption('quickFilterText', e.target.value);
  });

  const newTaskBtn = document.getElementById('newTaskBtn');
  const taskFormSection = document.getElementById('taskFormSection');
  const taskForm = document.getElementById('taskForm');
  const cancelBtn = document.getElementById('cancelBtn');
  const deleteBtn = document.getElementById('deleteBtn');

  taskForm.addEventListener('focusin', () => {
    gridApi.clearCellSelection();
  });

  newTaskBtn.addEventListener('click', () => {
    taskForm.reset();
    taskForm.elements.id.value = '';
    taskFormSection.removeAttribute('hidden');
  });

  cancelBtn.addEventListener('click', () => {
    taskFormSection.setAttribute('hidden', '');
    taskForm.reset();
  });

  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(taskForm);
    const taskData = Object.fromEntries(formData);
    const taskId = taskData.id;

    delete taskData.id;

    try {
      if (taskId) {
        const updatedTask = await updateTask(taskId, taskData);
        gridApi.applyTransaction({ update: [updatedTask] });
      } else {
        const createdTask = await createTask(taskData);
        gridApi.applyTransaction({ add: [createdTask] });
      }

      taskFormSection.setAttribute('hidden', '');
      taskForm.reset();

      const allTasks = [];
      gridApi.forEachNode(node => allTasks.push(node.data));
      updateWidgetContent(allTasks);
      refreshKanban(allTasks);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  });

  deleteBtn.addEventListener('click', async () => {
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) return;

    const task = selectedRows[0];
    const confirmed = confirm(`Are you sure you want to delete '${task.title}'?`);

    if (confirmed) {
      try {
        await deleteTask(task.id);
        gridApi.applyTransaction({ remove: [task] });
        deleteBtn.disabled = true;

        const allTasks = [];
        gridApi.forEachNode(node => allTasks.push(node.data));
        updateWidgetContent(allTasks);
        refreshKanban(allTasks);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  });
});
