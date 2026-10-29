import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TagIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useTagContext } from '../../../context/TagContext';
import { useTaskContext } from '../../../context/TaskContext';
import TagItem from './TagItem';

function TagManager({ onClose }) {
  const { tags, addTag, editTag, deleteTag } = useTagContext();
  const { updateTasksWithEditedTag, updateTasksWithDeletedTag } = useTaskContext();

  const [newTagName, setNewTagName] = useState('');

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    addTag(newTagName.trim());
    setNewTagName('');
  };

  const handleEditTag = (originalTag, newName) => {
    // Update in tag context
    editTag(originalTag, newName);
    // Update in task context
    updateTasksWithEditedTag(originalTag, newName);
  };

  const handleDeleteTag = (tag) => {
    // Delete from tag context
    deleteTag(tag);
    // Update tasks that have this tag
    updateTasksWithDeletedTag(tag);
  };

  return (
    <div className="tag-manager bg-white rounded-xl shadow-lg p-5" data-testid="tag-manager">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-neutral-800">Manage Tags</h3>
        <button
          className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
          onClick={onClose}
          data-testid="close-tag-manager"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Add new tag */}
      <div className="mb-5">
        <div className="flex gap-2">
          <div className="relative grow">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <TagIcon className="h-4 w-4 text-neutral-500" />
            </div>
            <input
              type="text"
              placeholder="Add a new tag"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="w-full py-2 px-4 pl-9 text-sm text-neutral-800 rounded-lg border border-neutral-300 focus:border-primary-400 focus:ring-1 focus:ring-primary-200 outline-hidden transition-all"
              data-testid="new-tag-input"
            />
          </div>
          <motion.button
            onClick={handleAddTag}
            whileTap={{ scale: 0.95 }}
            disabled={!newTagName.trim()}
            className={`px-3 py-2 rounded-lg ${
              newTagName.trim() 
              ? 'bg-primary-500 text-white hover:bg-primary-600' 
              : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            } transition-colors`}
            data-testid="add-tag"
          >
            <PlusIcon className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Tag list */}
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto" data-testid="tag-list">
        {tags.length === 0 ? (
          <p className="text-center text-neutral-500 py-3" data-testid="no-tags-message">No tags yet</p>
        ) : (
          tags.map((tag) => (
            <TagItem
              key={tag}
              tag={tag}
              onEdit={handleEditTag}
              onDelete={handleDeleteTag}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TagManager;
