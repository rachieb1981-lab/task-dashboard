import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import TaskTagInput from './TaskTagInput';

vi.mock('../../../context/TagContext', () => ({
  useTagContext: () => ({
    tags: ['work', 'personal', 'urgent'],
  })
}));

describe('TaskTagInput Component', () => {
  const defaultProps = {
    selectedTags: [],
    onAddTag: vi.fn(),
    onRemoveTag: vi.fn(),
    newTagInput: '',
    setNewTagInput: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders input field correctly', () => {
    render(<TaskTagInput {...defaultProps} />);
    expect(screen.getByTestId('tag-input')).toBeInTheDocument();
  });

  test('calls setNewTagInput on typing', () => {
    const setNewTagInput = vi.fn();
    render(<TaskTagInput {...defaultProps} setNewTagInput={setNewTagInput} />);

    const input = screen.getByTestId('tag-input');
    fireEvent.change(input, { target: { value: 'work' } });

    expect(setNewTagInput).toHaveBeenCalledWith('work');
  });

  test('calls onAddTag when Enter or comma key is pressed', () => {
    const onAddTag = vi.fn();
    render(<TaskTagInput {...defaultProps} newTagInput="new-tag" onAddTag={onAddTag} />);

    const input = screen.getByTestId('tag-input');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onAddTag).toHaveBeenCalledWith('new-tag');

    fireEvent.keyDown(input, { key: ',' });
    expect(onAddTag).toHaveBeenCalledWith('new-tag');
  });

  test('shows add tag button when newTagInput is non-empty and calls onAddTag when clicked', () => {
    const onAddTag = vi.fn();
    render(<TaskTagInput {...defaultProps} newTagInput="new-tag" onAddTag={onAddTag} />);

    const addButton = screen.getByTestId('add-tag-button');
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);
    expect(onAddTag).toHaveBeenCalledWith('new-tag');
  });

  test('displays suggestions matching newTagInput and triggers onAddTag on suggestion click', () => {
    const onAddTag = vi.fn();
    render(<TaskTagInput {...defaultProps} newTagInput="wor" onAddTag={onAddTag} />);

    expect(screen.getByTestId('tag-suggestions')).toBeInTheDocument();
    const suggestionBtn = screen.getByTestId('tag-suggestion-work');
    expect(suggestionBtn).toBeInTheDocument();

    fireEvent.click(suggestionBtn);
    expect(onAddTag).toHaveBeenCalledWith('work');
  });

  test('renders selected tags and triggers onRemoveTag when remove button is clicked', () => {
    const onRemoveTag = vi.fn();
    render(
      <TaskTagInput
        {...defaultProps}
        selectedTags={['work', 'personal']}
        onRemoveTag={onRemoveTag}
      />
    );

    expect(screen.getByTestId('selected-tags')).toBeInTheDocument();
    expect(screen.getByTestId('selected-tag-work')).toBeInTheDocument();
    expect(screen.getByTestId('selected-tag-personal')).toBeInTheDocument();

    const removeBtn = screen.getByTestId('remove-tag-work');
    fireEvent.click(removeBtn);
    expect(onRemoveTag).toHaveBeenCalledWith('work');
  });
});
