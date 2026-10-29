import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTaskContext } from '../../../context/TaskContext';
import { useTagContext } from '../../../context/TagContext';
import TaskTagInput from './TaskTagInput';

function GlobalTaskForm({ onCancel }) {
  const { addTask } = useTaskContext();
  const { tags, addTag } = useTagContext();
  
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    // Auto-focus input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // Add current tag input if it exists and not already added
    const finalTagInput = newTagInput.trim();
    if (finalTagInput && !selectedTags.includes(finalTagInput)) {
      // Add to global tags list if it's a new tag
      if (!tags.includes(finalTagInput)) {
        addTag(finalTagInput);
      }
      addTask({ title, description: "", isCompleted: false, tags: [...selectedTags, finalTagInput] });
    } else {
      addTask({ title, description: "", isCompleted: false, tags: selectedTags });
    }
    
    setTitle('');
    setSelectedTags([]);
    setNewTagInput('');
    onCancel();
  };

  const handleAddTag = (tag) => {
    if (!tag.trim() || selectedTags.includes(tag.trim())) return;
    setSelectedTags([...selectedTags, tag.trim()]);
    setNewTagInput('');
  };
  
  const handleRemoveTag = (tag) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  return (
    <form className="global-task-form mb-6" onSubmit={handleSubmit} data-testid="global-task-form">
      <div className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full py-3 px-4 pr-24 text-neutral-800 rounded-lg border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-hidden transition-all"
          autoComplete="off"
          data-testid="task-input"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <motion.button
            type="button"
            onClick={onCancel}
            className="p-2 text-neutral-500 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors"
            whileTap={{ scale: 0.9 }}
            data-testid="cancel-button"
          >
            <XMarkIcon className="h-5 w-5" />
          </motion.button>
          <motion.button
            type="submit"
            disabled={!title.trim()}
            className={`p-2 rounded-full ${
              title.trim() 
                ? 'text-primary-600 hover:text-primary-800 hover:bg-primary-50' 
                : 'text-neutral-300 cursor-not-allowed'
            } transition-colors`}
            whileTap={title.trim() ? { scale: 0.9 } : {}}
            data-testid="submit-button"
          >
            <CheckIcon className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
      
      <TaskTagInput
        selectedTags={selectedTags}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        newTagInput={newTagInput}
        setNewTagInput={setNewTagInput}
      />
    </form>
  );
}

export default GlobalTaskForm;
