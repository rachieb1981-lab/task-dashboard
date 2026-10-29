import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ListProvider, useListContext } from './ListContext';
import { DataHydrationService } from '../common/utils/DataHydrationService';

vi.mock('../common/utils/DataHydrationService', () => ({
  DataHydrationService: {
    shouldHydrate: vi.fn(),
    getInitialTaskLists: vi.fn(),
  },
}));

describe('ListContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useListContext hook', () => {
    it('returns undefined when rendered outside ListProvider', () => {
      const { result } = renderHook(() => useListContext());
      expect(result.current).toBeUndefined();
    });

    it('returns context value when rendered inside ListProvider', () => {
      DataHydrationService.shouldHydrate.mockReturnValue(false);
      const { result } = renderHook(() => useListContext(), {
        wrapper: ListProvider,
      });

      expect(result.current).toBeDefined();
      expect(result.current.taskLists).toEqual([
        { id: 'default', title: 'All Tasks', filters: [] },
      ]);
    });
  });

  describe('Initial State and Data Hydration', () => {
    it('initializes with default task list when hydration is disabled', () => {
      DataHydrationService.shouldHydrate.mockReturnValue(false);
      const { result } = renderHook(() => useListContext(), {
        wrapper: ListProvider,
      });

      expect(DataHydrationService.shouldHydrate).toHaveBeenCalled();
      expect(DataHydrationService.getInitialTaskLists).not.toHaveBeenCalled();
      expect(result.current.taskLists).toEqual([
        { id: 'default', title: 'All Tasks', filters: [] },
      ]);
    });

    it('initializes with hydrated task lists when hydration is enabled', () => {
      const mockHydratedLists = [
        { id: 'hydrated-1', title: 'Work', filters: [] },
        { id: 'hydrated-2', title: 'Personal', filters: [] },
      ];
      DataHydrationService.shouldHydrate.mockReturnValue(true);
      DataHydrationService.getInitialTaskLists.mockReturnValue(mockHydratedLists);

      const { result } = renderHook(() => useListContext(), {
        wrapper: ListProvider,
      });

      expect(DataHydrationService.shouldHydrate).toHaveBeenCalled();
      expect(DataHydrationService.getInitialTaskLists).toHaveBeenCalled();
      expect(result.current.taskLists).toEqual(mockHydratedLists);
    });
  });

  describe('addTaskList', () => {
    it('adds a new task list and returns it', () => {
      DataHydrationService.shouldHydrate.mockReturnValue(false);
      const { result } = renderHook(() => useListContext(), {
        wrapper: ListProvider,
      });

      let newList;
      act(() => {
        newList = result.current.addTaskList();
      });

      expect(newList).toBeDefined();
      expect(newList.id).toMatch(/^list-\d+$/);
      expect(newList.title).toBe('New List');
      expect(newList.filters).toEqual([]);

      expect(result.current.taskLists).toHaveLength(2);
      expect(result.current.taskLists[1]).toEqual(newList);
    });
  });

  describe('updateTaskList', () => {
    it('updates specified task list properties', () => {
      DataHydrationService.shouldHydrate.mockReturnValue(false);
      const { result } = renderHook(() => useListContext(), {
        wrapper: ListProvider,
      });

      let newList;
      act(() => {
        newList = result.current.addTaskList();
      });

      act(() => {
        result.current.updateTaskList(newList.id, {
          title: 'Updated Title',
          filters: [{ type: 'tag', value: 'work' }],
        });
      });

      const updatedList = result.current.taskLists.find((l) => l.id === newList.id);
      expect(updatedList).toEqual({
        id: newList.id,
        title: 'Updated Title',
        filters: [{ type: 'tag', value: 'work' }],
      });

      // Default list remains unchanged
      const defaultList = result.current.taskLists.find((l) => l.id === 'default');
      expect(defaultList).toEqual({ id: 'default', title: 'All Tasks', filters: [] });
    });
  });

  describe('deleteTaskList', () => {
    it('deletes a non-default task list', () => {
      DataHydrationService.shouldHydrate.mockReturnValue(false);
      const { result } = renderHook(() => useListContext(), {
        wrapper: ListProvider,
      });

      let newList;
      act(() => {
        newList = result.current.addTaskList();
      });

      expect(result.current.taskLists).toHaveLength(2);

      act(() => {
        result.current.deleteTaskList(newList.id);
      });

      expect(result.current.taskLists).toHaveLength(1);
      expect(result.current.taskLists.find((l) => l.id === newList.id)).toBeUndefined();
    });

    it('does not allow deleting the default list', () => {
      DataHydrationService.shouldHydrate.mockReturnValue(false);
      const { result } = renderHook(() => useListContext(), {
        wrapper: ListProvider,
      });

      act(() => {
        result.current.deleteTaskList('default');
      });

      expect(result.current.taskLists).toHaveLength(1);
      expect(result.current.taskLists[0].id).toBe('default');
    });
  });

  describe('getFilteredTasks', () => {
    const sampleTasks = [
      { id: 1, title: 'Task 1', isCompleted: false, tags: ['work', 'urgent'] },
      { id: 2, title: 'Task 2', isCompleted: true, tags: ['work'] },
      { id: 3, title: 'Task 3', isCompleted: false, tags: ['personal'] },
      { id: 4, title: 'Task 4', isCompleted: true }, // no tags property
    ];

    it('returns all tasks when filterConfig is null, undefined, or empty', () => {
      DataHydrationService.shouldHydrate.mockReturnValue(false);
      const { result } = renderHook(() => useListContext(), {
        wrapper: ListProvider,
      });

      expect(result.current.getFilteredTasks(null, sampleTasks)).toEqual(sampleTasks);
      expect(result.current.getFilteredTasks(undefined, sampleTasks)).toEqual(sampleTasks);
      expect(result.current.getFilteredTasks([], sampleTasks)).toEqual(sampleTasks);
    });

    it('filters tasks by tag', () => {
      DataHydrationService.shouldHydrate.mockReturnValue(false);
      const { result } = renderHook(() => useListContext(), {
        wrapper: ListProvider,
      });

      const filterConfig = [{ type: 'tag', value: 'work' }];
      const filtered = result.current.getFilteredTasks(filterConfig, sampleTasks);

      expect(filtered).toHaveLength(2);
      expect(filtered.map((t) => t.id)).toEqual([1, 2]);
    });

    it('filters tasks by completion status', () => {
      DataHydrationService.shouldHydrate.mockReturnValue(false);
      const { result } = renderHook(() => useListContext(), {
        wrapper: ListProvider,
      });

      const completedFilter = [{ type: 'completed', value: true }];
      const completedTasks = result.current.getFilteredTasks(completedFilter, sampleTasks);
      expect(completedTasks.map((t) => t.id)).toEqual([2, 4]);

      const activeFilter = [{ type: 'completed', value: false }];
      const activeTasks = result.current.getFilteredTasks(activeFilter, sampleTasks);
      expect(activeTasks.map((t) => t.id)).toEqual([1, 3]);
    });

    it('applies multiple filters with AND logic', () => {
      DataHydrationService.shouldHydrate.mockReturnValue(false);
      const { result } = renderHook(() => useListContext(), {
        wrapper: ListProvider,
      });

      const multipleFilters = [
        { type: 'tag', value: 'work' },
        { type: 'completed', value: false },
      ];

      const filtered = result.current.getFilteredTasks(multipleFilters, sampleTasks);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(1);
    });

    it('returns true for unknown/unsupported filter types', () => {
      DataHydrationService.shouldHydrate.mockReturnValue(false);
      const { result } = renderHook(() => useListContext(), {
        wrapper: ListProvider,
      });

      const unknownFilter = [{ type: 'priority', value: 'high' }];
      const filtered = result.current.getFilteredTasks(unknownFilter, sampleTasks);
      expect(filtered).toEqual(sampleTasks);
    });
  });
});
