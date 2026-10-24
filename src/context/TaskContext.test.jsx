import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { TaskProvider, useTaskContext } from './TaskContext';

// Helper component to consume context and execute operations
const TestComponent = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useTaskContext();

  return (
    <div>
      <div data-testid="task-count">{tasks.length}</div>
      <button
        data-testid="add-task-btn"
        onClick={() => addTask({ title: 'Test Task', isCompleted: false })}
      >
        Add Task
      </button>
      {tasks.map((task) => (
        <div key={task.id} data-testid={`task-${task.id}`}>
          <span data-testid={`task-id-${task.id}`}>{task.id}</span>
          <span data-testid={`task-title-${task.id}`}>{task.title}</span>
          <button
            data-testid={`toggle-task-${task.id}`}
            onClick={() => toggleTask(task.id)}
          >
            Toggle
          </button>
          <button
            data-testid={`delete-task-${task.id}`}
            onClick={() => deleteTask(task.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

describe('TaskContext', () => {
  test('addTask generates a valid UUID for new tasks', () => {
    let addedTask;
    const TaskTestConsumer = () => {
      const { addTask } = useTaskContext();
      return (
        <button
          data-testid="add-task-consumer-btn"
          onClick={() => {
            addedTask = addTask({ title: 'Secure Task', isCompleted: false });
          }}
        >
          Add Task
        </button>
      );
    };

    render(
      <TaskProvider>
        <TaskTestConsumer />
      </TaskProvider>
    );

    const button = screen.getByTestId('add-task-consumer-btn');
    act(() => {
      button.click();
    });

    expect(addedTask).toBeDefined();
    // UUID v4 format regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(addedTask.id).toMatch(uuidRegex);
  });

  test('addTask creates unique IDs for multiple tasks', () => {
    let task1, task2;
    const MultiTaskConsumer = () => {
      const { addTask } = useTaskContext();
      return (
        <button
          data-testid="add-multiple-btn"
          onClick={() => {
            task1 = addTask({ title: 'Task 1' });
            task2 = addTask({ title: 'Task 2' });
          }}
        >
          Add Tasks
        </button>
      );
    };

    render(
      <TaskProvider>
        <MultiTaskConsumer />
      </TaskProvider>
    );

    act(() => {
      screen.getByTestId('add-multiple-btn').click();
    });

    expect(task1.id).not.toBe(task2.id);
  });
});
