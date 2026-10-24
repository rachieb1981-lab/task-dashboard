import React from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import TaskList from '../../tasks/components/TaskList';
import TaskListConfig from './TaskListConfig';
import ListAddTask from './ListAddTask';
import { useTaskContext } from '../../../context/TaskContext';
import { useListContext } from '../../../context/ListContext';

function TaskBoardCard({
  list,
  isEditing,
  isAddingTask,
  onEdit,
  onCancelEdit,
  onSaveConfig,
  onStartAddTask,
  onCancelAddTask
}) {
  const { tasks, completeAllTasks, deleteCompletedTasks } = useTaskContext();
  const { deleteTaskList, getFilteredTasks } = useListContext();

  const filteredTasks = getFilteredTasks(list.filters, tasks);
  const completedTasksCount = filteredTasks.filter(task => task.isCompleted).length;
  const hasCompletedTasks = completedTasksCount > 0;
  const allTasksCompleted = filteredTasks.length > 0 && filteredTasks.every(task => task.isCompleted);

  const handleCompleteListTasks = () => {
    const filteredTaskIds = filteredTasks.map(task => task.id);
    completeAllTasks(filteredTaskIds);
  };

  const handleDeleteListCompletedTasks = () => {
    const completedFilteredTaskIds = filteredTasks
      .filter(task => task.isCompleted)
      .map(task => task.id);
    deleteCompletedTasks(completedFilteredTaskIds);
  };

  return (
    <div
      className="task-list-container bg-white rounded-xl shadow-soft w-full flex flex-col"
      data-testid={`task-list-${list.id}`}
    >
      {isEditing ? (
        <TaskListConfig
          taskList={list}
          onSave={(updates) => onSaveConfig(list.id, updates)}
          onCancel={onCancelEdit}
        />
      ) : (
        <>
          <div className="list-header p-4 border-b border-neutral-100 flex justify-between items-center">
            <h2 className="font-medium text-lg" data-testid={`list-title-${list.id}`}>{list.title}</h2>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-xs"
                data-testid={`task-count-${list.id}`}
              >
                {completedTasksCount}/{filteredTasks.length}
              </span>
              <button
                type="button"
                className="text-sm text-neutral-500 hover:text-neutral-700 px-2 py-1 hover:bg-neutral-100 rounded-xs"
                onClick={() => onEdit(list.id)}
                data-testid={`edit-list-${list.id}`}
              >
                Edit
              </button>
              {list.id !== 'default' && (
                <button
                  type="button"
                  className="text-sm text-rose-500 hover:text-rose-700 px-2 py-1 hover:bg-rose-50 rounded-xs"
                  onClick={() => deleteTaskList(list.id)}
                  data-testid={`delete-list-${list.id}`}
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          <div className="list-body p-4 grow overflow-y-auto max-h-[50vh]">
            {/* Show add task form when adding to this list */}
            {isAddingTask ? (
              <div className="mb-3">
                <ListAddTask
                  onCancel={onCancelAddTask}
                  listFilters={list.filters}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onStartAddTask(list.id)}
                className="mb-3 w-full py-2 px-3 flex items-center justify-center text-sm text-neutral-600 hover:text-primary-600 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-dashed border-neutral-300 hover:border-primary-300 transition-colors"
                data-testid={`add-task-to-list-${list.id}`}
              >
                <PlusIcon className="h-4 w-4 mr-1.5" />
                Add task to this list
              </button>
            )}

            <TaskList tasks={filteredTasks} />
          </div>

          {/* List action buttons */}
          {filteredTasks.length > 0 && (
            <div className="list-actions p-3 border-t border-neutral-100 flex justify-between">
              <motion.button
                type="button"
                onClick={handleCompleteListTasks}
                className="flex items-center text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors px-2 py-1 hover:bg-primary-50 rounded-lg"
                disabled={allTasksCompleted}
                whileHover={{ scale: allTasksCompleted ? 1 : 1.02 }}
                whileTap={{ scale: allTasksCompleted ? 1 : 0.98 }}
                data-testid={`complete-all-${list.id}`}
              >
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Complete All
              </motion.button>

              <motion.button
                type="button"
                onClick={handleDeleteListCompletedTasks}
                className="flex items-center text-xs font-medium text-rose-500 hover:text-rose-700 transition-colors px-2 py-1 hover:bg-rose-50 rounded-lg"
                disabled={!hasCompletedTasks}
                whileHover={{ scale: !hasCompletedTasks ? 1 : 1.02 }}
                whileTap={{ scale: !hasCompletedTasks ? 1 : 0.98 }}
                data-testid={`clear-completed-${list.id}`}
              >
                <TrashIcon className="h-3 w-3 mr-1" />
                Clear Completed
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TaskBoardCard;
