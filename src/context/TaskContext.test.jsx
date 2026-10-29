import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { TaskProvider, useTaskContext } from './TaskContext';
import { DataHydrationService } from '../common/utils/DataHydrationService';

vi.mock('../common/utils/DataHydrationService', () => ({
  DataHydrationService: {
    shouldHydrate: vi.fn(),
    getInitialTasks: vi.fn(),
  },
}));

describe('TaskContext', () => {
  const wrapper = ({ children }) => <TaskProvider>{children}</TaskProvider>;

  beforeEach(() => {
    vi.clearAllMocks();
    DataHydrationService.shouldHydrate.mockReturnValue(false);
    DataHydrationService.getInitialTasks.mockReturnValue([]);
  });

  describe('Initialization and Hydration', () => {
    test('initializes with empty array when hydration is disabled', () => {
      DataHydrationService.shouldHydrate.mockReturnValue(false);

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      expect(result.current.tasks).toEqual([]);
      expect(result.current.stats).toEqual({
        total: 0,
        completed: 0,
        remaining: 0,
      });
    });

    test('initializes with hydrated tasks when hydration is enabled', () => {
      const initialTasks = [
        { id: 101, text: 'Hydrated Task 1', isCompleted: false },
        { id: 102, text: 'Hydrated Task 2', isCompleted: true },
      ];
      DataHydrationService.shouldHydrate.mockReturnValue(true);
      DataHydrationService.getInitialTasks.mockReturnValue(initialTasks);

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      expect(result.current.tasks).toEqual(initialTasks);
      expect(result.current.stats).toEqual({
        total: 2,
        completed: 1,
        remaining: 1,
      });
    });
  });

  describe('addTask', () => {
    test('adds a new task with a generated id and updates stats', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      let createdTask;
      act(() => {
        createdTask = result.current.addTask({ text: 'New Task', isCompleted: false });
      });

      expect(createdTask).toHaveProperty('id');
      expect(createdTask.text).toBe('New Task');
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0]).toEqual(createdTask);
      expect(result.current.stats).toEqual({
        total: 1,
        completed: 0,
        remaining: 1,
      });
    });
  });

  describe('toggleTask', () => {
    test('toggles the isCompleted status of the specified task', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      let createdTask;
      act(() => {
        createdTask = result.current.addTask({ text: 'Task to toggle', isCompleted: false });
      });

      act(() => {
        result.current.toggleTask(createdTask.id);
      });

      expect(result.current.tasks[0].isCompleted).toBe(true);
      expect(result.current.stats).toEqual({
        total: 1,
        completed: 1,
        remaining: 0,
      });

      act(() => {
        result.current.toggleTask(createdTask.id);
      });

      expect(result.current.tasks[0].isCompleted).toBe(false);
    });
  });

  describe('deleteTask', () => {
    test('removes the specified task by id', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      let task1, task2;
      act(() => {
        task1 = result.current.addTask({ text: 'Task 1', isCompleted: false });
      });
      act(() => {
        task2 = result.current.addTask({ text: 'Task 2', isCompleted: false });
      });

      expect(result.current.tasks).toHaveLength(2);

      act(() => {
        result.current.deleteTask(task1.id);
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].id).toBe(task2.id);
    });
  });

  describe('completeAllTasks', () => {
    test('completes all tasks when no taskIds parameter is passed', () => {
      const initialTasks = [
        { id: 1, text: 'Task 1', isCompleted: false },
        { id: 2, text: 'Task 2', isCompleted: false },
      ];
      DataHydrationService.shouldHydrate.mockReturnValue(true);
      DataHydrationService.getInitialTasks.mockReturnValue(initialTasks);

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      act(() => {
        result.current.completeAllTasks();
      });

      expect(result.current.tasks.every(t => t.isCompleted)).toBe(true);
      expect(result.current.stats.completed).toBe(2);
    });

    test('completes only specific tasks when taskIds array is provided', () => {
      const initialTasks = [
        { id: 1, text: 'Task 1', isCompleted: false },
        { id: 2, text: 'Task 2', isCompleted: false },
        { id: 3, text: 'Task 3', isCompleted: false },
      ];
      DataHydrationService.shouldHydrate.mockReturnValue(true);
      DataHydrationService.getInitialTasks.mockReturnValue(initialTasks);

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      act(() => {
        result.current.completeAllTasks([1, 3]);
      });

      expect(result.current.tasks.find(t => t.id === 1).isCompleted).toBe(true);
      expect(result.current.tasks.find(t => t.id === 2).isCompleted).toBe(false);
      expect(result.current.tasks.find(t => t.id === 3).isCompleted).toBe(true);
    });
  });

  describe('deleteCompletedTasks', () => {
    test('deletes all completed tasks when taskIds is null or omitted', () => {
      const initialTasks = [
        { id: 1, text: 'Task 1', isCompleted: false },
        { id: 2, text: 'Task 2', isCompleted: true },
        { id: 3, text: 'Task 3', isCompleted: true },
      ];
      DataHydrationService.shouldHydrate.mockReturnValue(true);
      DataHydrationService.getInitialTasks.mockReturnValue(initialTasks);

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      act(() => {
        result.current.deleteCompletedTasks();
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].id).toBe(1);
      expect(result.current.stats).toEqual({
        total: 1,
        completed: 0,
        remaining: 1,
      });
    });

    test('deletes all completed tasks when taskIds is an empty array', () => {
      const initialTasks = [
        { id: 1, text: 'Task 1', isCompleted: false },
        { id: 2, text: 'Task 2', isCompleted: true },
      ];
      DataHydrationService.shouldHydrate.mockReturnValue(true);
      DataHydrationService.getInitialTasks.mockReturnValue(initialTasks);

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      act(() => {
        result.current.deleteCompletedTasks([]);
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].id).toBe(1);
    });

    test('deletes specific tasks when taskIds array is provided', () => {
      const initialTasks = [
        { id: 1, text: 'Task 1', isCompleted: true },
        { id: 2, text: 'Task 2', isCompleted: true },
        { id: 3, text: 'Task 3', isCompleted: false },
      ];
      DataHydrationService.shouldHydrate.mockReturnValue(true);
      DataHydrationService.getInitialTasks.mockReturnValue(initialTasks);

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      act(() => {
        result.current.deleteCompletedTasks([1]);
      });

      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks.map(t => t.id)).toEqual([2, 3]);
    });

    test('deletes multiple specific tasks provided in taskIds array', () => {
      const initialTasks = [
        { id: 10, text: 'Task 10', isCompleted: true },
        { id: 20, text: 'Task 20', isCompleted: true },
        { id: 30, text: 'Task 30', isCompleted: true },
        { id: 40, text: 'Task 40', isCompleted: false },
      ];
      DataHydrationService.shouldHydrate.mockReturnValue(true);
      DataHydrationService.getInitialTasks.mockReturnValue(initialTasks);

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      act(() => {
        result.current.deleteCompletedTasks([10, 30]);
      });

      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks.map(t => t.id)).toEqual([20, 40]);
    });
  });

  describe('Tag-related operations', () => {
    test('updateTasksWithEditedTag renames matching tag in tasks', () => {
      const initialTasks = [
        { id: 1, text: 'Task 1', tags: ['work', 'urgent'] },
        { id: 2, text: 'Task 2', tags: ['personal'] },
        { id: 3, text: 'Task 3' },
      ];
      DataHydrationService.shouldHydrate.mockReturnValue(true);
      DataHydrationService.getInitialTasks.mockReturnValue(initialTasks);

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      act(() => {
        result.current.updateTasksWithEditedTag('work', 'office');
      });

      expect(result.current.tasks[0].tags).toEqual(['office', 'urgent']);
      expect(result.current.tasks[1].tags).toEqual(['personal']);
      expect(result.current.tasks[2].tags).toBeUndefined();
    });

    test('updateTasksWithDeletedTag removes specified tag from tasks', () => {
      const initialTasks = [
        { id: 1, text: 'Task 1', tags: ['work', 'urgent'] },
        { id: 2, text: 'Task 2', tags: ['personal'] },
        { id: 3, text: 'Task 3' },
      ];
      DataHydrationService.shouldHydrate.mockReturnValue(true);
      DataHydrationService.getInitialTasks.mockReturnValue(initialTasks);

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      act(() => {
        result.current.updateTasksWithDeletedTag('urgent');
      });

      expect(result.current.tags || result.current.tasks[0].tags).toEqual(['work']);
      expect(result.current.tasks[1].tags).toEqual(['personal']);
      expect(result.current.tasks[2].tags).toBeUndefined();
    });
  });
});
