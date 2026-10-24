import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import TagItem from './TagItem';

describe('TagItem Component', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });

  test('renders tag item correctly in read-only mode', () => {
    render(<TagItem tag="work" onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    expect(screen.getByTestId('tag-item-work')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByTestId('edit-tag-work')).toBeInTheDocument();
    expect(screen.getByTestId('delete-tag-work')).toBeInTheDocument();
  });

  test('switches to edit mode when edit button is clicked', () => {
    render(<TagItem tag="work" onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    fireEvent.click(screen.getByTestId('edit-tag-work'));

    expect(screen.getByTestId('edit-tag-input')).toBeInTheDocument();
    expect(screen.getByTestId('save-tag-edit')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-tag-edit')).toBeInTheDocument();
  });

  test('calls onEdit with updated name when saved', () => {
    render(<TagItem tag="work" onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    fireEvent.click(screen.getByTestId('edit-tag-work'));

    const input = screen.getByTestId('edit-tag-input');
    fireEvent.change(input, { target: { value: 'work-updated' } });

    fireEvent.click(screen.getByTestId('save-tag-edit'));

    expect(mockOnEdit).toHaveBeenCalledWith('work', 'work-updated');
    expect(screen.queryByTestId('edit-tag-input')).not.toBeInTheDocument();
  });

  test('does not call onEdit if edited tag name is empty', () => {
    render(<TagItem tag="work" onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    fireEvent.click(screen.getByTestId('edit-tag-work'));

    const input = screen.getByTestId('edit-tag-input');
    fireEvent.change(input, { target: { value: '   ' } });

    fireEvent.click(screen.getByTestId('save-tag-edit'));

    expect(mockOnEdit).not.toHaveBeenCalled();
  });

  test('cancels edit mode without calling onEdit', () => {
    render(<TagItem tag="work" onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    fireEvent.click(screen.getByTestId('edit-tag-work'));

    const input = screen.getByTestId('edit-tag-input');
    fireEvent.change(input, { target: { value: 'work-cancelled' } });

    fireEvent.click(screen.getByTestId('cancel-tag-edit'));

    expect(mockOnEdit).not.toHaveBeenCalled();
    expect(screen.queryByTestId('edit-tag-input')).not.toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
  });

  test('calls onDelete when delete button is clicked', () => {
    render(<TagItem tag="work" onEdit={mockOnEdit} onDelete={mockOnDelete} />);

    fireEvent.click(screen.getByTestId('delete-tag-work'));

    expect(mockOnDelete).toHaveBeenCalledWith('work');
  });
});
