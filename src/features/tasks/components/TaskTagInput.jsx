import React from 'react';
import { TagIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTagContext } from '../../../context/TagContext';

function TaskTagInput({ selectedTags, onAddTag, onRemoveTag, newTagInput, setNewTagInput }) {
  const { tags } = useTagContext();

  // Handle input key events (add tag on Enter or comma)
  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && newTagInput.trim()) {
      e.preventDefault();
      onAddTag(newTagInput.trim());
    }
  };

  // Get matching tags based on the current input
  const getMatchingTags = () => {
    if (!newTagInput.trim()) return [];

    const inputLower = newTagInput.toLowerCase();
    return tags.filter(tag =>
      !selectedTags.includes(tag) &&
      tag.toLowerCase().includes(inputLower)
    );
  };

  return (
    <>
      {/* Tag input field */}
      <div className="mb-3">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <TagIcon className="h-4 w-4 text-neutral-500" />
          </div>
          <input
            type="text"
            placeholder="Enter a new tag (press Enter or comma to add)"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="w-full py-3 px-4 pl-9 text-sm text-neutral-800 rounded-lg border border-neutral-200 focus:border-primary-400 focus:ring-1 focus:ring-primary-200 outline-hidden transition-all"
            autoComplete="off"
            data-testid="tag-input"
          />

          {/* Add button */}
          {newTagInput.trim() && !selectedTags.includes(newTagInput.trim()) && (
            <button
              type="button"
              onClick={() => onAddTag(newTagInput.trim())}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-primary-500 hover:bg-primary-600 text-white rounded-full"
              data-testid="add-tag-button"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Matching tag suggestions - only shown when input matches existing tags */}
        {getMatchingTags().length > 0 && (
          <div className="mt-2" data-testid="tag-suggestions">
            <p className="text-xs font-medium text-neutral-500 mb-1.5">Select matching tag:</p>
            <div className="flex flex-wrap gap-2">
              {getMatchingTags().map((tag, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onAddTag(tag)}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                  data-testid={`tag-suggestion-${tag}`}
                >
                  <TagIcon className="h-3 w-3 mr-1" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="mb-1" data-testid="selected-tags">
          <p className="text-xs font-medium text-neutral-500 mb-2">Selected tags:</p>
          <div className="flex flex-wrap gap-2 p-2 bg-neutral-50 rounded-lg">
            {selectedTags.map((tag, index) => (
              <div
                key={index}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary-500 text-white group"
                data-testid={`selected-tag-${tag}`}
              >
                <TagIcon className="h-3 w-3 mr-1" />
                <span>{tag}</span>
                <button
                  type="button"
                  className="ml-1 p-0.5 rounded-full hover:bg-primary-600 group-hover:text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    onRemoveTag(tag);
                  }}
                  data-testid={`remove-tag-${tag}`}
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default TaskTagInput;
