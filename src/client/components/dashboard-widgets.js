import Sortable from '/node_modules/sortablejs/modular/sortable.esm.js';
import { LayoutStore } from './layout-persistence.js';

const layoutStore = new LayoutStore('widgetLayout');

export function initWidgets(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  restoreLayout(container);

  Sortable.create(container, {
    animation: 150,
    handle: '.widget-handle',
    draggable: '.widget-panel',
    ghostClass: 'sortable-ghost',
    onEnd: () => {
      saveLayout(container);
    }
  });

  const widgets = container.querySelectorAll('.widget-panel');
  widgets.forEach(widget => {
    widget.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = widget.previousElementSibling;
        if (prev) {
          container.insertBefore(widget, prev);
          widget.focus();
          saveLayout(container);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = widget.nextElementSibling;
        if (next) {
          container.insertBefore(next, widget);
          widget.focus();
          saveLayout(container);
        }
      }
    });
  });
}

function saveLayout(container) {
  const widgets = container.querySelectorAll('.widget-panel');
  const widgetOrder = Array.from(widgets).map(w => w.dataset.widgetId);
  layoutStore.save({ widgetOrder });
}

function restoreLayout(container) {
  const layout = layoutStore.load();
  if (!layout || !layout.widgetOrder) return;

  const widgets = container.querySelectorAll('.widget-panel');
  const widgetMap = new Map();
  widgets.forEach(w => widgetMap.set(w.dataset.widgetId, w));

  layout.widgetOrder.forEach(id => {
    const widget = widgetMap.get(id);
    if (widget) {
      container.appendChild(widget);
    }
  });
}

export function updateWidgetContent(tasks) {
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === 'done').length;

  const priorityCounts = {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length
  };

  const statusCounts = {
    todo: tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length
  };

  const tasksSummaryContent = document.getElementById('tasks-summary-content');
  if (tasksSummaryContent) {
    tasksSummaryContent.innerHTML = `
      <div>Total Tasks: ${totalCount}</div>
      <div>Completed: ${completedCount}</div>
    `;
  }

  const priorityChartContent = document.getElementById('priority-chart-content');
  if (priorityChartContent) {
    priorityChartContent.innerHTML = `
      <div>High: ${priorityCounts.high}</div>
      <div>Medium: ${priorityCounts.medium}</div>
      <div>Low: ${priorityCounts.low}</div>
    `;
  }

  const statusOverviewContent = document.getElementById('status-overview-content');
  if (statusOverviewContent) {
    statusOverviewContent.innerHTML = `
      <div>To Do: ${statusCounts.todo}</div>
      <div>In Progress: ${statusCounts['in-progress']}</div>
      <div>Done: ${statusCounts.done}</div>
    `;
  }
}
