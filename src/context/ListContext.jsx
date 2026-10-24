import React, { createContext, useState, useContext } from 'react';
import { DataHydrationService } from '../common/utils/DataHydrationService';

// Create the list context
const ListContext = createContext();

// Custom hook for using list context
export const useListContext = () => useContext(ListContext);

// List provider component
export const ListProvider = ({ children }) => {
  const [taskLists, setTaskLists] = useState(() => {
    // Initialize with hydrated data if should hydrate
    return DataHydrationService.shouldHydrate() 
      ? DataHydrationService.getInitialTaskLists() 
      : [{ id: 'default', title: 'All Tasks', filters: [] }];
  });

  const addTaskList = () => {
    const newList = {
      id: `list-${Date.now()}`,
      title: 'New List',
      filters: []
    };
    setTaskLists([...taskLists, newList]);
    return newList;
  };

  const updateTaskList = (id, updates) => {
    setTaskLists(
      taskLists.map(list => 
        list.id === id ? { ...list, ...updates } : list
      )
    );
  };

  const deleteTaskList = (id) => {
    // Don't allow deleting the default list
    if (id === 'default') return;
    setTaskLists(taskLists.filter(list => list.id !== id));
  };

  // Filter tasks according to the task list's filter configuration
  const getFilteredTasks = (filterConfig, tasks) => {
    if (!filterConfig || filterConfig.length === 0 || !tasks || tasks.length === 0) {
      return tasks || [];
    }
    
    // Pre-process filters once before iterating over tasks
    const completedFilters = [];
    const tagFilters = [];
    const otherFilters = [];

    for (let i = 0; i < filterConfig.length; i++) {
      const filter = filterConfig[i];
      if (!filter) continue;

      if (filter.type === 'completed') {
        completedFilters.push(filter.value);
      } else if (filter.type === 'tag') {
        tagFilters.push(filter.value);
      } else {
        otherFilters.push(filter);
      }
    }

    const numCompletedFilters = completedFilters.length;
    const numTagFilters = tagFilters.length;
    const numOtherFilters = otherFilters.length;

    return tasks.filter(task => {
      if (!task) return false;

      // 1. Fast boolean evaluations first: completed status
      if (numCompletedFilters > 0) {
        for (let i = 0; i < numCompletedFilters; i++) {
          if (task.isCompleted !== completedFilters[i]) {
            return false;
          }
        }
      }

      // 2. Tag filters evaluation
      if (numTagFilters > 0) {
        const tags = task.tags;
        if (!tags) return false;

        const isSet = typeof tags.has === 'function';
        const isArray = typeof tags.includes === 'function';

        if (isSet) {
          for (let i = 0; i < numTagFilters; i++) {
            if (!tags.has(tagFilters[i])) return false;
          }
        } else if (isArray) {
          for (let i = 0; i < numTagFilters; i++) {
            if (!tags.includes(tagFilters[i])) return false;
          }
        } else {
          return false;
        }
      }

      // 3. Fallback for any non-standard filter types
      if (numOtherFilters > 0) {
        for (let i = 0; i < numOtherFilters; i++) {
          const filter = otherFilters[i];
          if (filter.predicate && typeof filter.predicate === 'function') {
            if (!filter.predicate(task)) return false;
          }
        }
      }

      return true;
    });
  };

  return (
    <ListContext.Provider
      value={{
        taskLists,
        addTaskList,
        updateTaskList,
        deleteTaskList,
        getFilteredTasks
      }}
    >
      {children}
    </ListContext.Provider>
  );
};
