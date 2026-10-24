import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { TaskProvider, useTaskContext } from './TaskContext';
import { DataHydrationService } from '../common/utils/DataHydrationService';

vi.mock('../common/utils/DataHydrationService', () => ({
  DataHydrationService: {
    shouldHydrate: vi.fn(),
    getInitialTasks: vi.fn(),
  },
}));

const wrapper = ({ children }) => <TaskProvider>{children}</TaskProvider>;

describe('TaskContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    DataHydrationService.shouldHydrate.mockReturnValue(false);
    DataHydrationService.getInitialTasks.mockReturnValue([]);
  });

  describe('updateTasksWithDeletedTag', () => {
    test('removes the specified tag from tasks containing it while keeping other tags intact', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      act(() => {
        result.current.addTask({ title: 'Task 1', tags: ['work', 'urgent'] });
      });
      act(() => {
        result.current.addTask({ title: 'Task 2', tags: ['work'] });
      });
      act(() => {
        result.current.addTask({ title: 'Task 3', tags: ['personal'] });
      });

      expect(result.current.tasks).toHaveLength(3);

      act(() => {
        result.current.updateTasksWithDeletedTag('work');
      });

      expect(result.current.tasks[0].tags).toEqual(['urgent']);
      expect(result.current.tasks[1].tags).toEqual([]);
      expect(result.current.tasks[2].tags).toEqual(['personal']);
    });

    test('handles tasks without tags property or with null/non-array tags gracefully', () => {
      DataHydrationService.shouldHydrate.mockReturnValue(true);
      DataHydrationService.getInitialTasks.mockReturnValue([
        { id: 1, title: 'Task without tags' },
        { id: 2, title: 'Task with null tags', tags: null },
        { id: 3, title: 'Task with work tag', tags: ['work'] }
      ]);

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      expect(result.current.tasks).toHaveLength(3);

      act(() => {
        result.current.updateTasksWithDeletedTag('work');
      });

      expect(result.current.tasks[0].tags).toBeUndefined();
      expect(result.current.tasks[1].tags).toBeNull();
      expect(result.current.tasks[2].tags).toEqual([]);
    });

    test('leaves tasks unchanged if tag to delete is not found in any task', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      act(() => {
        result.current.addTask({ title: 'Task 1', tags: ['home'] });
      });

      const initialTasks = [...result.current.tasks];

      act(() => {
        result.current.updateTasksWithDeletedTag('nonexistent-tag');
      });

      expect(result.current.tasks).toEqual(initialTasks);
    });
  });

  describe('updateTasksWithEditedTag', () => {
    test('renames specified tag in tasks containing it while keeping other tags unchanged', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      act(() => {
        result.current.addTask({ title: 'Task 1', tags: ['work', 'urgent'] });
      });
      act(() => {
        result.current.addTask({ title: 'Task 2', tags: ['personal'] });
      });

      act(() => {
        result.current.updateTasksWithEditedTag('work', 'office');
      });

      expect(result.current.tasks[0].tags).toEqual(['office', 'urgent']);
      expect(result.current.tasks[1].tags).toEqual(['personal']);
    });

    test('does nothing if old tag is not found in tasks', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      act(() => {
        result.current.addTask({ title: 'Task 1', tags: ['home'] });
      });

      act(() => {
        result.current.updateTasksWithEditedTag('nonexistent', 'new-tag');
      });

      expect(result.current.tasks[0].tags).toEqual(['home']);
    });
  });

  describe('Hydration and Initial State', () => {
    test('initializes with hydrated tasks when shouldHydrate returns true', () => {
      DataHydrationService.shouldHydrate.mockReturnValue(true);
      DataHydrationService.getInitialTasks.mockReturnValue([
        { id: 101, title: 'Hydrated Task', tags: ['hydrated'] }
      ]);

      const { result } = renderHook(() => useTaskContext(), { wrapper });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].title).toBe('Hydrated Task');
      expect(result.current.stats).toEqual({ total: 1, completed: 0, remaining: 1 });
    });
  });
});
