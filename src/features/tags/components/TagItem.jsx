import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TagIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

function TagItem({ tag, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTagName, setEditedTagName] = useState(tag);

  const handleStartEditing = () => {
    setIsEditing(true);
    setEditedTagName(tag);
  };

  const handleSaveEdit = () => {
    if (!editedTagName.trim()) return;
    onEdit(tag, editedTagName.trim());
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTagName(tag);
  };

  const handleDelete = () => {
    onDelete(tag);
  };

  return (
    <div
      className="flex items-center justify-between p-2 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
      data-testid={`tag-item-${tag}`}
    >
      {isEditing ? (
        <input
          type="text"
          value={editedTagName}
          onChange={(e) => setEditedTagName(e.target.value)}
          className="w-full py-1 px-2 text-sm border border-primary-300 rounded-xs focus:outline-hidden focus:ring-1 focus:ring-primary-500"
          autoFocus
          data-testid="edit-tag-input"
        />
      ) : (
        <div className="flex items-center">
          <TagIcon className="h-4 w-4 text-primary-600 mr-2" />
          <span className="text-neutral-800">{tag}</span>
        </div>
      )}

      <div className="flex gap-1">
        {isEditing ? (
          <>
            <motion.button
              className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
              onClick={handleSaveEdit}
              whileTap={{ scale: 0.9 }}
              data-testid="save-tag-edit"
            >
              <CheckIcon className="h-4 w-4" />
            </motion.button>
            <motion.button
              className="p-1.5 text-neutral-500 hover:bg-neutral-200 rounded-full"
              onClick={handleCancelEdit}
              whileTap={{ scale: 0.9 }}
              data-testid="cancel-tag-edit"
            >
              <XMarkIcon className="h-4 w-4" />
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-full"
              onClick={handleStartEditing}
              whileTap={{ scale: 0.9 }}
              data-testid={`edit-tag-${tag}`}
            >
              <PencilIcon className="h-4 w-4" />
            </motion.button>
            <motion.button
              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-full"
              onClick={handleDelete}
              whileTap={{ scale: 0.9 }}
              data-testid={`delete-tag-${tag}`}
            >
              <TrashIcon className="h-4 w-4" />
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}

export default TagItem;
