import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { TaskProvider, useTaskContext } from './TaskContext';

describe('TaskContext', () => {
  const wrapper = ({ children }) => <TaskProvider>{children}</TaskProvider>;

  test('provides initial empty tasks and stats when data hydration is disabled', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });

    expect(result.current.tasks).toEqual([]);
    expect(result.current.stats).toEqual({ total: 0, completed: 0, remaining: 0 });
  });

  test('addTask adds a task and updates stats', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });

    act(() => {
      result.current.addTask({ text: 'Test Task', isCompleted: false, tags: ['work'] });
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0]).toMatchObject({
      text: 'Test Task',
      isCompleted: false,
      tags: ['work']
    });
    expect(result.current.tasks[0].id).toBeDefined();
    expect(result.current.stats).toEqual({ total: 1, completed: 0, remaining: 1 });
  });

  test('toggleTask toggles completion status and updates stats', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });

    let addedTask;
    act(() => {
      addedTask = result.current.addTask({ text: 'Test Task', isCompleted: false });
    });

    expect(result.current.stats).toEqual({ total: 1, completed: 0, remaining: 1 });

    act(() => {
      result.current.toggleTask(addedTask.id);
    });

    expect(result.current.tasks[0].isCompleted).toBe(true);
    expect(result.current.stats).toEqual({ total: 1, completed: 1, remaining: 0 });
  });

  test('deleteTask removes task and updates stats', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });

    let addedTask;
    act(() => {
      addedTask = result.current.addTask({ text: 'Task to delete' });
    });

    expect(result.current.tasks).toHaveLength(1);

    act(() => {
      result.current.deleteTask(addedTask.id);
    });

    expect(result.current.tasks).toHaveLength(0);
    expect(result.current.stats).toEqual({ total: 0, completed: 0, remaining: 0 });
  });

  test('completeAllTasks completes all tasks or specific task IDs', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });

    let task1, task2, task3;
    act(() => { task1 = result.current.addTask({ text: 'Task 1', isCompleted: false }); });
    act(() => { task2 = result.current.addTask({ text: 'Task 2', isCompleted: false }); });
    act(() => { task3 = result.current.addTask({ text: 'Task 3', isCompleted: false }); });

    // Complete specific task IDs
    act(() => {
      result.current.completeAllTasks([task1.id, task2.id]);
    });

    expect(result.current.tasks.find(t => t.id === task1.id).isCompleted).toBe(true);
    expect(result.current.tasks.find(t => t.id === task2.id).isCompleted).toBe(true);
    expect(result.current.tasks.find(t => t.id === task3.id).isCompleted).toBe(false);

    // Complete all tasks
    act(() => {
      result.current.completeAllTasks();
    });

    expect(result.current.tasks.every(t => t.isCompleted)).toBe(true);
  });

  test('deleteCompletedTasks deletes all or specific completed tasks', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper });

    let task1, task2, task3;
    act(() => { task1 = result.current.addTask({ text: 'Task 1', isCompleted: true }); });
    act(() => { task2 = result.current.addTask({ text: 'Task 2', isCompleted: true }); });
    act(() => { task3 = result.current.addTask({ text: 'Task 3', isCompleted: false }); });

    // Delete specific tasks
    act(() => {
      result.current.deleteCompletedTasks([task1.id]);
    });

    expect(result.current.tasks.map(t => t.id)).toEqual([task2.id, task3.id]);

    // Delete all remaining completed tasks
    act(() => {
      result.current.deleteCompletedTasks();
    });

    expect(result.current.tasks.map(t => t.id)).toEqual([task3.id]);
  });

  describe('updateTasksWithEditedTag', () => {
    test('renames tag across multiple tasks containing oldTag', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      let task1, task2, task3;
      act(() => { task1 = result.current.addTask({ text: 'Task 1', tags: ['work', 'urgent'] }); });
      act(() => { task2 = result.current.addTask({ text: 'Task 2', tags: ['work'] }); });
      act(() => { task3 = result.current.addTask({ text: 'Task 3', tags: ['home'] }); });

      act(() => {
        result.current.updateTasksWithEditedTag('work', 'job');
      });

      const updatedTasks = result.current.tasks;
      expect(updatedTasks.find(t => t.id === task1.id).tags).toEqual(['job', 'urgent']);
      expect(updatedTasks.find(t => t.id === task2.id).tags).toEqual(['job']);
      expect(updatedTasks.find(t => t.id === task3.id).tags).toEqual(['home']);
    });

    test('leaves tasks without tags or tasks without oldTag unaffected', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      let taskWithNoTags, taskWithNullTags, taskWithOtherTag;
      act(() => { taskWithNoTags = result.current.addTask({ text: 'No tags task' }); });
      act(() => { taskWithNullTags = result.current.addTask({ text: 'Null tags task', tags: null }); });
      act(() => { taskWithOtherTag = result.current.addTask({ text: 'Other tag task', tags: ['personal'] }); });

      act(() => {
        result.current.updateTasksWithEditedTag('work', 'job');
      });

      const updatedTasks = result.current.tasks;
      expect(updatedTasks.find(t => t.id === taskWithNoTags.id).tags).toBeUndefined();
      expect(updatedTasks.find(t => t.id === taskWithNullTags.id).tags).toBeNull();
      expect(updatedTasks.find(t => t.id === taskWithOtherTag.id).tags).toEqual(['personal']);
    });

    test('preserves task property immutability for unmodified tasks', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      let taskToUpdate, taskUnchanged;
      act(() => { taskToUpdate = result.current.addTask({ text: 'Update me', tags: ['oldTag'] }); });
      act(() => { taskUnchanged = result.current.addTask({ text: 'Keep me', tags: ['otherTag'] }); });

      const initialUnchangedTaskObj = result.current.tasks.find(t => t.id === taskUnchanged.id);

      act(() => {
        result.current.updateTasksWithEditedTag('oldTag', 'newTag');
      });

      const currentUnchangedTaskObj = result.current.tasks.find(t => t.id === taskUnchanged.id);
      expect(currentUnchangedTaskObj).toBe(initialUnchangedTaskObj);
    });
  });

  describe('updateTasksWithDeletedTag', () => {
    test('removes deleted tag from tasks containing it', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      let task1, task2;
      act(() => { task1 = result.current.addTask({ text: 'Task 1', tags: ['work', 'urgent'] }); });
      act(() => { task2 = result.current.addTask({ text: 'Task 2', tags: ['personal'] }); });

      act(() => {
        result.current.updateTasksWithDeletedTag('urgent');
      });

      expect(result.current.tasks.find(t => t.id === task1.id).tags).toEqual(['work']);
      expect(result.current.tasks.find(t => t.id === task2.id).tags).toEqual(['personal']);
    });

    test('handles tasks without tags safely when deleting tag', () => {
      const { result } = renderHook(() => useTaskContext(), { wrapper });

      let task1;
      act(() => { task1 = result.current.addTask({ text: 'Task 1' }); });

      act(() => {
        result.current.updateTasksWithDeletedTag('urgent');
      });

      expect(result.current.tasks.find(t => t.id === task1.id).tags).toBeUndefined();
    });
  });
});
