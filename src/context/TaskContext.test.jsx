import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { TaskProvider, useTaskContext } from './TaskContext';
import { DataHydrationService } from '../common/utils/DataHydrationService';

describe('TaskContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }) => <TaskProvider>{children}</TaskProvider>;

  describe('initialization', () => {
    test('initializes with empty tasks when shouldHydrate is false', () => {
      vi.spyOn(DataHydrationService, 'shouldHydrate').mockReturnValue(false);

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      expect(result.current.tasks).toEqual([]);
      expect(result.current.stats).toEqual({ total: 0, completed: 0, remaining: 0 });
    });

    test('initializes with hydrated tasks when shouldHydrate is true', () => {
      const mockInitialTasks = [
        { id: 1, text: 'Hydrated Task 1', isCompleted: false },
        { id: 2, text: 'Hydrated Task 2', isCompleted: true },
      ];
      vi.spyOn(DataHydrationService, 'shouldHydrate').mockReturnValue(true);
      vi.spyOn(DataHydrationService, 'getInitialTasks').mockReturnValue(mockInitialTasks);

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      expect(result.current.tasks).toEqual(mockInitialTasks);
      expect(result.current.stats).toEqual({ total: 2, completed: 1, remaining: 1 });
    });
  });

  describe('completeAllTasks', () => {
    beforeEach(() => {
      vi.spyOn(DataHydrationService, 'shouldHydrate').mockReturnValue(false);
    });

    test('completes all tasks when no arguments are provided (default null)', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      act(() => {
        result.current.addTask({ text: 'Task 1', isCompleted: false });
      });
      act(() => {
        result.current.addTask({ text: 'Task 2', isCompleted: false });
      });
      act(() => {
        result.current.addTask({ text: 'Task 3', isCompleted: true });
      });

      expect(result.current.tasks).toHaveLength(3);
      expect(result.current.tasks.some(t => !t.isCompleted)).toBe(true);

      act(() => {
        result.current.completeAllTasks();
      });

      expect(result.current.tasks.every(t => t.isCompleted)).toBe(true);
      expect(result.current.stats).toEqual({ total: 3, completed: 3, remaining: 0 });
    });

    test('completes all tasks when passed null explicitly', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      act(() => {
        result.current.addTask({ text: 'Task 1', isCompleted: false });
      });
      act(() => {
        result.current.addTask({ text: 'Task 2', isCompleted: false });
      });

      act(() => {
        result.current.completeAllTasks(null);
      });

      expect(result.current.tasks.every(t => t.isCompleted)).toBe(true);
    });

    test('completes only specific tasks when taskIds array is provided', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      let task1, task2, task3;
      act(() => {
        task1 = result.current.addTask({ text: 'Task 1', isCompleted: false });
      });
      act(() => {
        task2 = result.current.addTask({ text: 'Task 2', isCompleted: false });
      });
      act(() => {
        task3 = result.current.addTask({ text: 'Task 3', isCompleted: false });
      });

      act(() => {
        result.current.completeAllTasks([task1.id, task3.id]);
      });

      const updatedTask1 = result.current.tasks.find(t => t.id === task1.id);
      const updatedTask2 = result.current.tasks.find(t => t.id === task2.id);
      const updatedTask3 = result.current.tasks.find(t => t.id === task3.id);

      expect(updatedTask1.isCompleted).toBe(true);
      expect(updatedTask2.isCompleted).toBe(false);
      expect(updatedTask3.isCompleted).toBe(true);

      expect(result.current.stats).toEqual({ total: 3, completed: 2, remaining: 1 });
    });

    test('handles empty taskIds array without altering tasks', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      act(() => {
        result.current.addTask({ text: 'Task 1', isCompleted: false });
      });
      act(() => {
        result.current.addTask({ text: 'Task 2', isCompleted: false });
      });

      act(() => {
        result.current.completeAllTasks([]);
      });

      expect(result.current.tasks.every(t => !t.isCompleted)).toBe(true);
    });

    test('ignores non-existent task IDs in taskIds array', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      let task1;
      act(() => {
        task1 = result.current.addTask({ text: 'Task 1', isCompleted: false });
      });

      act(() => {
        result.current.completeAllTasks([99999, task1.id, 88888]);
      });

      expect(result.current.tasks.find(t => t.id === task1.id).isCompleted).toBe(true);
    });

    test('does not affect tasks that are already completed when called with taskIds', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      let task1, task2;
      act(() => {
        task1 = result.current.addTask({ text: 'Task 1', isCompleted: true });
      });
      act(() => {
        task2 = result.current.addTask({ text: 'Task 2', isCompleted: false });
      });

      act(() => {
        result.current.completeAllTasks([task1.id]);
      });

      expect(result.current.tasks.find(t => t.id === task1.id).isCompleted).toBe(true);
      expect(result.current.tasks.find(t => t.id === task2.id).isCompleted).toBe(false);
    });

    test('handles calling completeAllTasks on empty tasks state gracefully', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      act(() => {
        result.current.completeAllTasks([1, 2, 3]);
      });

      expect(result.current.tasks).toEqual([]);
      expect(result.current.stats).toEqual({ total: 0, completed: 0, remaining: 0 });
    });
  });

  describe('other task context operations', () => {
    beforeEach(() => {
      vi.spyOn(DataHydrationService, 'shouldHydrate').mockReturnValue(false);
    });

    test('addTask adds a new task with unique id', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      act(() => {
        result.current.addTask({ text: 'New Task' });
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].text).toBe('New Task');
      expect(result.current.tasks[0].id).toBeDefined();
    });

    test('toggleTask toggles the isCompleted state of a task', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      let task;
      act(() => {
        task = result.current.addTask({ text: 'Toggle Task', isCompleted: false });
      });

      act(() => {
        result.current.toggleTask(task.id);
      });
      expect(result.current.tasks[0].isCompleted).toBe(true);

      act(() => {
        result.current.toggleTask(task.id);
      });
      expect(result.current.tasks[0].isCompleted).toBe(false);
    });

    test('deleteTask removes a task by id', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      let task;
      act(() => {
        task = result.current.addTask({ text: 'Delete Task' });
      });

      expect(result.current.tasks).toHaveLength(1);

      act(() => {
        result.current.deleteTask(task.id);
      });

      expect(result.current.tasks).toHaveLength(0);
    });

    test('deleteCompletedTasks deletes all completed tasks when no taskIds provided', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      act(() => {
        result.current.addTask({ text: 'Task 1', isCompleted: true });
      });
      act(() => {
        result.current.addTask({ text: 'Task 2', isCompleted: false });
      });

      act(() => {
        result.current.deleteCompletedTasks();
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].text).toBe('Task 2');
    });

    test('deleteCompletedTasks deletes specific tasks when taskIds provided', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      let task1, task2;
      act(() => {
        task1 = result.current.addTask({ text: 'Task 1', isCompleted: true });
      });
      act(() => {
        task2 = result.current.addTask({ text: 'Task 2', isCompleted: false });
      });

      act(() => {
        result.current.deleteCompletedTasks([task1.id]);
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].id).toBe(task2.id);
    });

    test('updateTasksWithEditedTag updates tag names in tasks', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      act(() => {
        result.current.addTask({ text: 'Task with tag', tags: ['oldTag', 'otherTag'] });
      });

      act(() => {
        result.current.updateTasksWithEditedTag('oldTag', 'newTag');
      });

      expect(result.current.tasks[0].tags).toEqual(['newTag', 'otherTag']);
    });

    test('updateTasksWithDeletedTag removes deleted tag from tasks', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      act(() => {
        result.current.addTask({ text: 'Task with tag', tags: ['tag1', 'tag2'] });
      });

      act(() => {
        result.current.updateTasksWithDeletedTag('tag1');
      });

      expect(result.current.tasks[0].tags).toEqual(['tag2']);
    });
  });
});
