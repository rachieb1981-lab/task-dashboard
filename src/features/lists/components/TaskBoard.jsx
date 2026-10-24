import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, TagIcon } from '@heroicons/react/24/outline';
import TagManagerModal from './TagManagerModal';
import TaskBoardCard from './TaskBoardCard';
import { useListContext } from '../../../context/ListContext';

function TaskBoard() {
  const { taskLists, addTaskList, updateTaskList } = useListContext();
  
  const [editingListId, setEditingListId] = useState(null);
  const [showTagManager, setShowTagManager] = useState(false);
  const [addingTaskToListId, setAddingTaskToListId] = useState(null);

  // Handle saving list configuration and closing the editor
  const handleSaveListConfig = (listId, updates) => {
    updateTaskList(listId, updates);
    setEditingListId(null);
  };

  return (
    <div className="task-board" data-testid="task-board">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="font-semibold text-lg text-neutral-700">Task Lists</h2>
        <button 
          type="button"
          className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors px-3 py-1.5 hover:bg-primary-50 rounded-lg"
          onClick={() => setShowTagManager(true)}
          data-testid="manage-tags-button"
        >
          <TagIcon className="h-4 w-4 mr-2" />
          Manage Tags
        </button>
      </div>
      
      {/* Tag Manager Modal */}
      <TagManagerModal
        isOpen={showTagManager}
        onClose={() => setShowTagManager(false)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4" data-testid="task-lists-container">
        {taskLists.map(list => (
          <TaskBoardCard
            key={list.id}
            list={list}
            isEditing={editingListId === list.id}
            isAddingTask={addingTaskToListId === list.id}
            onEdit={(id) => setEditingListId(id)}
            onCancelEdit={() => setEditingListId(null)}
            onSaveConfig={handleSaveListConfig}
            onStartAddTask={(id) => setAddingTaskToListId(id)}
            onCancelAddTask={() => setAddingTaskToListId(null)}
          />
        ))}

        {/* Add new task list button */}
        <motion.button
          type="button"
          className="add-list-button h-48 rounded-xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-400 hover:text-primary-600 hover:border-primary-300 transition-colors"
          onClick={addTaskList}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          data-testid="add-list-button"
        >
          <PlusIcon className="h-10 w-10" />
          <span className="mt-2 font-medium">Add New List</span>
        </motion.button>
      </div>
    </div>
  );
}

export default TaskBoard;
