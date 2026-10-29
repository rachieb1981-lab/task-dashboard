import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { ListProvider, useListContext } from './ListContext';

const wrapper = ({ children }) => <ListProvider>{children}</ListProvider>;

describe('ListContext and getFilteredTasks', () => {
  test('provides default list management functions', () => {
    const { result } = renderHook(() => useListContext(), { wrapper });

    expect(result.current.taskLists.length).toBeGreaterThan(0);
    expect(typeof result.current.addTaskList).toBe('function');
    expect(typeof result.current.updateTaskList).toBe('function');
    expect(typeof result.current.deleteTaskList).toBe('function');
    expect(typeof result.current.getFilteredTasks).toBe('function');
  });

  test('adds, updates, and deletes task lists', () => {
    const { result } = renderHook(() => useListContext(), { wrapper });

    let newList;
    act(() => {
      newList = result.current.addTaskList();
    });

    expect(result.current.taskLists.some(l => l.id === newList.id)).toBe(true);

    act(() => {
      result.current.updateTaskList(newList.id, { title: 'Updated List Title' });
    });

    const updated = result.current.taskLists.find(l => l.id === newList.id);
    expect(updated.title).toBe('Updated List Title');

    act(() => {
      result.current.deleteTaskList(newList.id);
    });

    expect(result.current.taskLists.some(l => l.id === newList.id)).toBe(false);
  });

  test('does not allow deleting default task list', () => {
    const { result } = renderHook(() => useListContext(), { wrapper });

    act(() => {
      result.current.deleteTaskList('default');
    });

    expect(result.current.taskLists.some(l => l.id === 'default')).toBe(true);
  });

  describe('getFilteredTasks logic', () => {
    const tasks = [
      { id: 1, title: 'Task 1', isCompleted: false, tags: ['work', 'urgent'] },
      { id: 2, title: 'Task 2', isCompleted: true, tags: ['work'] },
      { id: 3, title: 'Task 3', isCompleted: false, tags: ['personal'] },
      { id: 4, title: 'Task 4', isCompleted: true, tags: ['personal', 'urgent'] }
    ];

    test('returns all tasks when filterConfig is null, empty, or missing', () => {
      const { result } = renderHook(() => useListContext(), { wrapper });
      const { getFilteredTasks } = result.current;

      expect(getFilteredTasks(null, tasks)).toBe(tasks);
      expect(getFilteredTasks([], tasks)).toBe(tasks);
      expect(getFilteredTasks([], undefined)).toEqual([]);
    });

    test('filters tasks by completion status', () => {
      const { result } = renderHook(() => useListContext(), { wrapper });
      const { getFilteredTasks } = result.current;

      const completed = getFilteredTasks([{ type: 'completed', value: true }], tasks);
      expect(completed.map(t => t.id)).toEqual([2, 4]);

      const incomplete = getFilteredTasks([{ type: 'completed', value: false }], tasks);
      expect(incomplete.map(t => t.id)).toEqual([1, 3]);
    });

    test('filters tasks by tag array', () => {
      const { result } = renderHook(() => useListContext(), { wrapper });
      const { getFilteredTasks } = result.current;

      const workTasks = getFilteredTasks([{ type: 'tag', value: 'work' }], tasks);
      expect(workTasks.map(t => t.id)).toEqual([1, 2]);

      const urgentTasks = getFilteredTasks([{ type: 'tag', value: 'urgent' }], tasks);
      expect(urgentTasks.map(t => t.id)).toEqual([1, 4]);
    });

    test('filters tasks with multiple tag filters (AND logic)', () => {
      const { result } = renderHook(() => useListContext(), { wrapper });
      const { getFilteredTasks } = result.current;

      const workAndUrgent = getFilteredTasks([
        { type: 'tag', value: 'work' },
        { type: 'tag', value: 'urgent' }
      ], tasks);
      expect(workAndUrgent.map(t => t.id)).toEqual([1]);
    });

    test('filters tasks with combined tag and completion filters', () => {
      const { result } = renderHook(() => useListContext(), { wrapper });
      const { getFilteredTasks } = result.current;

      const completedWork = getFilteredTasks([
        { type: 'tag', value: 'work' },
        { type: 'completed', value: true }
      ], tasks);
      expect(completedWork.map(t => t.id)).toEqual([2]);
    });

    test('handles Set data structures for task.tags', () => {
      const { result } = renderHook(() => useListContext(), { wrapper });
      const { getFilteredTasks } = result.current;

      const tasksWithSets = [
        { id: 10, isCompleted: false, tags: new Set(['work', 'urgent']) },
        { id: 20, isCompleted: true, tags: new Set(['personal']) }
      ];

      const filtered = getFilteredTasks([{ type: 'tag', value: 'urgent' }], tasksWithSets);
      expect(filtered.map(t => t.id)).toEqual([10]);
    });

    test('handles edge cases gracefully (null tasks, missing tags)', () => {
      const { result } = renderHook(() => useListContext(), { wrapper });
      const { getFilteredTasks } = result.current;

      const messyTasks = [
        null,
        { id: 100, isCompleted: false }, // missing tags
        { id: 101, isCompleted: true, tags: null }
      ];

      const filtered = getFilteredTasks([{ type: 'tag', value: 'work' }], messyTasks);
      expect(filtered).toEqual([]);
    });
  });
});
