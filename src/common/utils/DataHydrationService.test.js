import { describe, it, expect, afterEach, vi } from 'vitest';
import { DataHydrationService } from './DataHydrationService';
import initialData from '../../data/initialData.json';

describe('DataHydrationService', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('getInitialTaskLists', () => {
    it('returns task lists from initialData', () => {
      const taskLists = DataHydrationService.getInitialTaskLists();
      expect(taskLists).toEqual(initialData.taskLists);
      expect(Array.isArray(taskLists)).toBe(true);
      expect(taskLists.length).toBeGreaterThan(0);
    });
  });

  describe('getInitialTags', () => {
    it('returns tags from initialData', () => {
      const tags = DataHydrationService.getInitialTags();
      expect(tags).toEqual(initialData.tags);
      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBeGreaterThan(0);
    });
  });

  describe('getInitialTasks', () => {
    it('returns tasks from initialData', () => {
      const tasks = DataHydrationService.getInitialTasks();
      expect(tasks).toEqual(initialData.tasks);
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThan(0);
    });
  });

  describe('shouldHydrate', () => {
    it('returns true when VITE_ENABLE_DATA_HYDRATION is "true"', () => {
      vi.stubEnv('VITE_ENABLE_DATA_HYDRATION', 'true');
      expect(DataHydrationService.shouldHydrate()).toBe(true);
    });

    it('returns false when VITE_ENABLE_DATA_HYDRATION is "false"', () => {
      vi.stubEnv('VITE_ENABLE_DATA_HYDRATION', 'false');
      expect(DataHydrationService.shouldHydrate()).toBe(false);
    });

    it('returns false when VITE_ENABLE_DATA_HYDRATION is undefined or arbitrary string', () => {
      vi.stubEnv('VITE_ENABLE_DATA_HYDRATION', undefined);
      expect(DataHydrationService.shouldHydrate()).toBe(false);

      vi.stubEnv('VITE_ENABLE_DATA_HYDRATION', '1');
      expect(DataHydrationService.shouldHydrate()).toBe(false);
    });
  });
});
