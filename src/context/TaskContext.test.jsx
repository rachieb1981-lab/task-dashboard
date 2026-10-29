import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { vi, beforeEach, describe, test, expect } from 'vitest';
import { TaskProvider, useTaskContext } from './TaskContext';
import { DataHydrationService } from '../common/utils/DataHydrationService';

// Mock DataHydrationService
vi.mock('../common/utils/DataHydrationService', () => ({
  DataHydrationService: {
    shouldHydrate: vi.fn(),
    getInitialTasks: vi.fn(),
  },
}));

// Test Consumer Component to access context value in tests
const TestComponent = ({ onContextValue }) => {
  const context = useTaskContext();
  if (onContextValue) {
    onContextValue(context);
  }
  return (
    <div>
      <div data-testid="task-count">{context.tasks.length}</div>
      <div data-testid="stats-total">{context.stats.total}</div>
      <div data-testid="stats-completed">{context.stats.completed}</div>
      <div data-testid="stats-remaining">{context.stats.remaining}</div>
      <button
        data-testid="add-btn"
        onClick={() => context.addTask({ text: 'New Task', tags: ['work'] })}
      >
        Add
      </button>
      <button
        data-testid="toggle-btn"
        onClick={() => context.tasks.length > 0 && context.toggleTask(context.tasks[0].id)}
      >
        Toggle
      </button>
      <button
        data-testid="delete-btn"
        onClick={() => context.tasks.length > 0 && context.deleteTask(context.tasks[0].id)}
      >
        Delete
      </button>
      <button
        data-testid="complete-all-btn"
        onClick={() => context.completeAllTasks()}
      >
        Complete All
      </button>
      <button
        data-testid="complete-specific-btn"
        onClick={() => context.tasks.length > 0 && context.completeAllTasks([context.tasks[0].id])}
      >
        Complete Specific
      </button>
      <button
        data-testid="delete-completed-btn"
        onClick={() => context.deleteCompletedTasks()}
      >
        Delete Completed
      </button>
      <button
        data-testid="delete-specific-completed-btn"
        onClick={() => context.tasks.length > 0 && context.deleteCompletedTasks([context.tasks[0].id])}
      >
        Delete Specific Completed
      </button>
      <button
        data-testid="edit-tag-btn"
        onClick={() => context.updateTasksWithEditedTag('work', 'job')}
      >
        Edit Tag
      </button>
      <button
        data-testid="delete-tag-btn"
        onClick={() => context.updateTasksWithDeletedTag('work')}
      >
        Delete Tag
      </button>
    </div>
  );
};

describe('TaskContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    DataHydrationService.shouldHydrate.mockReturnValue(false);
  });

  test('initializes with empty array when hydration is disabled', () => {
    let contextValue;
    render(
      <TaskProvider>
        <TestComponent onContextValue={(val) => (contextValue = val)} />
      </TaskProvider>
    );

    expect(contextValue.tasks).toEqual([]);
    expect(contextValue.stats).toEqual({ total: 0, completed: 0, remaining: 0 });
  });

  test('initializes with sample data when hydration is enabled', () => {
    const mockTasks = [
      { id: 1, text: 'Task 1', isCompleted: false },
      { id: 2, text: 'Task 2', isCompleted: true },
    ];
    DataHydrationService.shouldHydrate.mockReturnValue(true);
    DataHydrationService.getInitialTasks.mockReturnValue(mockTasks);

    let contextValue;
    render(
      <TaskProvider>
        <TestComponent onContextValue={(val) => (contextValue = val)} />
      </TaskProvider>
    );

    expect(contextValue.tasks).toEqual(mockTasks);
    expect(contextValue.stats).toEqual({ total: 2, completed: 1, remaining: 1 });
  });

  test('addTask adds a new task with a random id and updates stats', () => {
    let contextValue;
    render(
      <TaskProvider>
        <TestComponent onContextValue={(val) => (contextValue = val)} />
      </TaskProvider>
    );

    let createdTask;
    act(() => {
      createdTask = contextValue.addTask({ text: 'First Task', isCompleted: false, tags: ['dev'] });
    });

    expect(createdTask).toHaveProperty('id');
    expect(createdTask.text).toBe('First Task');

    expect(contextValue.tasks).toHaveLength(1);
    expect(contextValue.tasks[0].text).toBe('First Task');
    expect(contextValue.stats).toEqual({ total: 1, completed: 0, remaining: 1 });
  });

  test('toggleTask toggles completion status of specified task', () => {
    let contextValue;
    render(
      <TaskProvider>
        <TestComponent onContextValue={(val) => (contextValue = val)} />
      </TaskProvider>
    );

    act(() => {
      contextValue.addTask({ text: 'Task 1', isCompleted: false });
    });
    act(() => {
      contextValue.addTask({ text: 'Task 2', isCompleted: false });
    });

    const taskIdToToggle = contextValue.tasks[0].id;

    act(() => {
      contextValue.toggleTask(taskIdToToggle);
    });

    expect(contextValue.tasks[0].isCompleted).toBe(true);
    expect(contextValue.tasks[1].isCompleted).toBe(false);
    expect(contextValue.stats).toEqual({ total: 2, completed: 1, remaining: 1 });

    act(() => {
      contextValue.toggleTask(taskIdToToggle);
    });

    expect(contextValue.tasks[0].isCompleted).toBe(false);
    expect(contextValue.stats).toEqual({ total: 2, completed: 0, remaining: 2 });
  });

  test('deleteTask removes task by id', () => {
    let contextValue;
    render(
      <TaskProvider>
        <TestComponent onContextValue={(val) => (contextValue = val)} />
      </TaskProvider>
    );

    act(() => {
      contextValue.addTask({ text: 'Task 1' });
    });
    act(() => {
      contextValue.addTask({ text: 'Task 2' });
    });

    const taskIdToDelete = contextValue.tasks[0].id;

    act(() => {
      contextValue.deleteTask(taskIdToDelete);
    });

    expect(contextValue.tasks).toHaveLength(1);
    expect(contextValue.tasks[0].text).toBe('Task 2');
    expect(contextValue.stats.total).toBe(1);
  });

  test('completeAllTasks completes all tasks when no IDs passed', () => {
    let contextValue;
    render(
      <TaskProvider>
        <TestComponent onContextValue={(val) => (contextValue = val)} />
      </TaskProvider>
    );

    act(() => {
      contextValue.addTask({ text: 'Task 1', isCompleted: false });
    });
    act(() => {
      contextValue.addTask({ text: 'Task 2', isCompleted: false });
    });

    act(() => {
      contextValue.completeAllTasks();
    });

    expect(contextValue.tasks.every(t => t.isCompleted)).toBe(true);
    expect(contextValue.stats).toEqual({ total: 2, completed: 2, remaining: 0 });
  });

  test('completeAllTasks completes specific tasks when array of taskIds is passed', () => {
    let contextValue;
    render(
      <TaskProvider>
        <TestComponent onContextValue={(val) => (contextValue = val)} />
      </TaskProvider>
    );

    let id1, id2;
    act(() => {
      const t1 = contextValue.addTask({ text: 'Task 1', isCompleted: false });
      id1 = t1.id;
    });
    act(() => {
      const t2 = contextValue.addTask({ text: 'Task 2', isCompleted: false });
      id2 = t2.id;
    });

    act(() => {
      contextValue.completeAllTasks([id1]);
    });

    expect(contextValue.tasks.find(t => t.id === id1).isCompleted).toBe(true);
    expect(contextValue.tasks.find(t => t.id === id2).isCompleted).toBe(false);
    expect(contextValue.stats).toEqual({ total: 2, completed: 1, remaining: 1 });
  });

  test('deleteCompletedTasks removes all completed tasks when no taskIds provided', () => {
    let contextValue;
    render(
      <TaskProvider>
        <TestComponent onContextValue={(val) => (contextValue = val)} />
      </TaskProvider>
    );

    act(() => {
      contextValue.addTask({ text: 'Task 1', isCompleted: true });
    });
    act(() => {
      contextValue.addTask({ text: 'Task 2', isCompleted: false });
    });
    act(() => {
      contextValue.addTask({ text: 'Task 3', isCompleted: true });
    });

    act(() => {
      contextValue.deleteCompletedTasks();
    });

    expect(contextValue.tasks).toHaveLength(1);
    expect(contextValue.tasks[0].text).toBe('Task 2');
    expect(contextValue.stats).toEqual({ total: 1, completed: 0, remaining: 1 });
  });

  test('deleteCompletedTasks removes specific taskIds when provided', () => {
    let contextValue;
    render(
      <TaskProvider>
        <TestComponent onContextValue={(val) => (contextValue = val)} />
      </TaskProvider>
    );

    let id1, id2;
    act(() => {
      const t1 = contextValue.addTask({ text: 'Task 1', isCompleted: true });
      id1 = t1.id;
    });
    act(() => {
      const t2 = contextValue.addTask({ text: 'Task 2', isCompleted: true });
      id2 = t2.id;
    });

    act(() => {
      contextValue.deleteCompletedTasks([id1]);
    });

    expect(contextValue.tasks).toHaveLength(1);
    expect(contextValue.tasks[0].id).toBe(id2);
  });

  test('updateTasksWithEditedTag updates matching tag in task tags', () => {
    let contextValue;
    render(
      <TaskProvider>
        <TestComponent onContextValue={(val) => (contextValue = val)} />
      </TaskProvider>
    );

    act(() => {
      contextValue.addTask({ text: 'Task 1', tags: ['work', 'urgent'] });
    });
    act(() => {
      contextValue.addTask({ text: 'Task 2', tags: ['personal'] });
    });
    act(() => {
      contextValue.addTask({ text: 'Task 3' }); // no tags
    });

    act(() => {
      contextValue.updateTasksWithEditedTag('work', 'job');
    });

    expect(contextValue.tasks[0].tags).toEqual(['job', 'urgent']);
    expect(contextValue.tasks[1].tags).toEqual(['personal']);
    expect(contextValue.tasks[2].tags).toBeUndefined();
  });

  test('updateTasksWithDeletedTag removes matching tag from task tags', () => {
    let contextValue;
    render(
      <TaskProvider>
        <TestComponent onContextValue={(val) => (contextValue = val)} />
      </TaskProvider>
    );

    act(() => {
      contextValue.addTask({ text: 'Task 1', tags: ['work', 'urgent'] });
    });
    act(() => {
      contextValue.addTask({ text: 'Task 2', tags: ['personal'] });
    });
    act(() => {
      contextValue.addTask({ text: 'Task 3' }); // no tags
    });

    act(() => {
      contextValue.updateTasksWithDeletedTag('work');
    });

    expect(contextValue.tasks[0].tags).toEqual(['urgent']);
    expect(contextValue.tasks[1].tags).toEqual(['personal']);
    expect(contextValue.tasks[2].tags).toBeUndefined();
  });

  test('UI button triggers perform context state operations', () => {
    render(
      <TaskProvider>
        <TestComponent />
      </TaskProvider>
    );

    expect(screen.getByTestId('task-count')).toHaveTextContent('0');

    // Add task via button click
    fireEvent.click(screen.getByTestId('add-btn'));
    expect(screen.getByTestId('task-count')).toHaveTextContent('1');
    expect(screen.getByTestId('stats-total')).toHaveTextContent('1');

    // Toggle task via button click
    fireEvent.click(screen.getByTestId('toggle-btn'));
    expect(screen.getByTestId('stats-completed')).toHaveTextContent('1');

    // Edit tag
    fireEvent.click(screen.getByTestId('edit-tag-btn'));

    // Delete tag
    fireEvent.click(screen.getByTestId('delete-tag-btn'));

    // Complete specific
    fireEvent.click(screen.getByTestId('complete-specific-btn'));

    // Complete all
    fireEvent.click(screen.getByTestId('complete-all-btn'));

    // Delete specific completed
    fireEvent.click(screen.getByTestId('delete-specific-completed-btn'));

    // Add task again & delete completed
    fireEvent.click(screen.getByTestId('add-btn'));
    fireEvent.click(screen.getByTestId('toggle-btn'));
    fireEvent.click(screen.getByTestId('delete-completed-btn'));

    // Delete remaining task via button click
    fireEvent.click(screen.getByTestId('add-btn'));
    fireEvent.click(screen.getByTestId('delete-btn'));
    expect(screen.getByTestId('task-count')).toHaveTextContent('0');
  });
});
