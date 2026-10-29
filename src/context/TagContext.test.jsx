import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { TagProvider, useTagContext } from './TagContext';
import { TaskProvider, useTaskContext } from './TaskContext';
import { DataHydrationService } from '../common/utils/DataHydrationService';

// Test consumer component to display state and invoke methods
const TestConsumer = ({ onRender }) => {
  const tagContext = useTagContext();
  const taskContext = useTaskContext();
  if (onRender) onRender({ tagContext, taskContext });

  return (
    <div>
      <div data-testid="tags">{JSON.stringify(tagContext.tags)}</div>
      <button
        data-testid="add-btn"
        onClick={() => tagContext.addTag('new-tag')}
      >
        Add Tag
      </button>
      <button
        data-testid="edit-btn"
        onClick={() => tagContext.editTag('work', 'job')}
      >
        Edit Tag
      </button>
      <button
        data-testid="delete-btn"
        onClick={() => tagContext.deleteTag('work')}
      >
        Delete Tag
      </button>
      <button
        data-testid="manage-add"
        onClick={() => tagContext.handleManageTags('add', 'managed-tag')}
      >
        Manage Add
      </button>
      <button
        data-testid="manage-edit"
        onClick={() => tagContext.handleManageTags('edit', 'managed-tag', 'renamed-tag')}
      >
        Manage Edit
      </button>
      <button
        data-testid="manage-delete"
        onClick={() => tagContext.handleManageTags('delete', 'renamed-tag')}
      >
        Manage Delete
      </button>
      <button
        data-testid="manage-default"
        onClick={() => tagContext.handleManageTags('unknown', 'test')}
      >
        Manage Default
      </button>
      {taskContext && (
        <button
          data-testid="add-task-btn"
          onClick={() =>
            taskContext.addTask({
              title: 'New Task',
              tags: ['task-tag-1', 'task-tag-2']
            })
          }
        >
          Add Task
        </button>
      )}
    </div>
  );
};

describe('TagContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('initializes with empty tags when shouldHydrate returns false', () => {
    vi.spyOn(DataHydrationService, 'shouldHydrate').mockReturnValue(false);

    let contextValues;
    render(
      <TaskProvider>
        <TagProvider>
          <TestConsumer onRender={(val) => (contextValues = val)} />
        </TagProvider>
      </TaskProvider>
    );

    expect(contextValues.tagContext.tags).toEqual([]);
  });

  test('initializes with hydrated tags when shouldHydrate returns true', () => {
    vi.spyOn(DataHydrationService, 'shouldHydrate').mockReturnValue(true);
    vi.spyOn(DataHydrationService, 'getInitialTags').mockReturnValue(['initial1', 'initial2']);
    vi.spyOn(DataHydrationService, 'getInitialTasks').mockReturnValue([]);

    let contextValues;
    render(
      <TaskProvider>
        <TagProvider>
          <TestConsumer onRender={(val) => (contextValues = val)} />
        </TagProvider>
      </TaskProvider>
    );

    expect(contextValues.tagContext.tags).toEqual(['initial1', 'initial2']);
  });

  test('extracts and collects unique tags from tasks when tasks change', () => {
    vi.spyOn(DataHydrationService, 'shouldHydrate').mockReturnValue(false);

    render(
      <TaskProvider>
        <TagProvider>
          <TestConsumer />
        </TagProvider>
      </TaskProvider>
    );

    expect(screen.getByTestId('tags').textContent).toBe('[]');

    // Add a task with tags
    act(() => {
      screen.getByTestId('add-task-btn').click();
    });

    expect(JSON.parse(screen.getByTestId('tags').textContent)).toEqual([
      'task-tag-1',
      'task-tag-2'
    ]);
  });

  test('handles tasks with missing or non-array tags and duplicate tags across tasks', () => {
    vi.spyOn(DataHydrationService, 'shouldHydrate').mockReturnValue(true);
    vi.spyOn(DataHydrationService, 'getInitialTags').mockReturnValue([]);
    vi.spyOn(DataHydrationService, 'getInitialTasks').mockReturnValue([
      { id: 1, title: 'Task 1', tags: ['shared-tag', 'unique-1'] },
      { id: 2, title: 'Task 2', tags: ['shared-tag', 'unique-2'] },
      { id: 3, title: 'Task 3', tags: null },
      { id: 4, title: 'Task 4', tags: 'not-an-array' },
      { id: 5, title: 'Task 5' }
    ]);

    render(
      <TaskProvider>
        <TagProvider>
          <TestConsumer />
        </TagProvider>
      </TaskProvider>
    );

    expect(JSON.parse(screen.getByTestId('tags').textContent)).toEqual([
      'shared-tag',
      'unique-1',
      'unique-2'
    ]);
  });

  test('correctly deduplicates tags across tasks and existing tag state', () => {
    vi.spyOn(DataHydrationService, 'shouldHydrate').mockReturnValue(true);
    vi.spyOn(DataHydrationService, 'getInitialTags').mockReturnValue(['existing-tag', 'shared-tag']);
    vi.spyOn(DataHydrationService, 'getInitialTasks').mockReturnValue([
      { id: 1, tags: ['shared-tag', 'new-task-tag'] },
      { id: 2, tags: ['new-task-tag', 'another-tag'] },
      { id: 3, tags: null },
      { id: 4, tags: 'invalid-tags-prop' }
    ]);

    render(
      <TaskProvider>
        <TagProvider>
          <TestConsumer />
        </TagProvider>
      </TaskProvider>
    );

    const tags = JSON.parse(screen.getByTestId('tags').textContent);
    expect(tags).toEqual(['existing-tag', 'shared-tag', 'new-task-tag', 'another-tag']);
  });

  test('addTag adds a new tag if not present and ignores if present', () => {
    vi.spyOn(DataHydrationService, 'shouldHydrate').mockReturnValue(false);

    render(
      <TaskProvider>
        <TagProvider>
          <TestConsumer />
        </TagProvider>
      </TaskProvider>
    );

    act(() => {
      screen.getByTestId('add-btn').click();
    });

    expect(JSON.parse(screen.getByTestId('tags').textContent)).toEqual(['new-tag']);

    // Attempting to add the same tag again
    act(() => {
      screen.getByTestId('add-btn').click();
    });

    expect(JSON.parse(screen.getByTestId('tags').textContent)).toEqual(['new-tag']);
  });

  test('editTag replaces oldTag with newTag in tags array', () => {
    vi.spyOn(DataHydrationService, 'shouldHydrate').mockReturnValue(true);
    vi.spyOn(DataHydrationService, 'getInitialTags').mockReturnValue(['work', 'personal']);
    vi.spyOn(DataHydrationService, 'getInitialTasks').mockReturnValue([]);

    render(
      <TaskProvider>
        <TagProvider>
          <TestConsumer />
        </TagProvider>
      </TaskProvider>
    );

    expect(JSON.parse(screen.getByTestId('tags').textContent)).toEqual(['work', 'personal']);

    act(() => {
      screen.getByTestId('edit-btn').click();
    });

    expect(JSON.parse(screen.getByTestId('tags').textContent)).toEqual(['job', 'personal']);
  });

  test('deleteTag removes tag from tags array', () => {
    vi.spyOn(DataHydrationService, 'shouldHydrate').mockReturnValue(true);
    vi.spyOn(DataHydrationService, 'getInitialTags').mockReturnValue(['work', 'personal']);
    vi.spyOn(DataHydrationService, 'getInitialTasks').mockReturnValue([]);

    render(
      <TaskProvider>
        <TagProvider>
          <TestConsumer />
        </TagProvider>
      </TaskProvider>
    );

    act(() => {
      screen.getByTestId('delete-btn').click();
    });

    expect(JSON.parse(screen.getByTestId('tags').textContent)).toEqual(['personal']);
  });

  test('handleManageTags handles add, edit, delete and default operations', () => {
    vi.spyOn(DataHydrationService, 'shouldHydrate').mockReturnValue(false);

    render(
      <TaskProvider>
        <TagProvider>
          <TestConsumer />
        </TagProvider>
      </TaskProvider>
    );

    // Test add operation
    act(() => {
      screen.getByTestId('manage-add').click();
    });
    expect(JSON.parse(screen.getByTestId('tags').textContent)).toEqual(['managed-tag']);

    // Test edit operation
    act(() => {
      screen.getByTestId('manage-edit').click();
    });
    expect(JSON.parse(screen.getByTestId('tags').textContent)).toEqual(['renamed-tag']);

    // Test delete operation
    act(() => {
      screen.getByTestId('manage-delete').click();
    });
    expect(JSON.parse(screen.getByTestId('tags').textContent)).toEqual([]);

    // Test default/unknown operation
    act(() => {
      screen.getByTestId('manage-default').click();
    });
    expect(JSON.parse(screen.getByTestId('tags').textContent)).toEqual([]);
  });
});
