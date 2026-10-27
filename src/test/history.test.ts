import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCreations,
  addCreation,
  toggleFavoriteCreation,
  deleteCreation,
  clearAllCreations,
  exportCreationsJson,
  importCreationsJson,
  CreationRecord,
} from '../store/generationHistory';

describe('Generation History Store Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockItem: CreationRecord = {
    id: 'test-creation-1',
    title: 'Cyberpunk Metropolis',
    mode: 'text-to-video',
    modelId: 'wan2.1-t2v-14b',
    prompt: 'Neon skyscrapers in rain',
    aspectRatio: '16:9',
    resolution: '720p',
    durationSeconds: 5,
    fps: 16,
    videoUrl: 'https://example.com/test.mp4',
    createdAt: 1700000000000,
    isFavorite: false,
    providerId: 'demo-provider',
    isSimulated: true,
  };

  it('loads seed creations if localStorage is empty', () => {
    const list = loadCreations();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].id).toContain('seed-');
  });

  it('adds a new creation to the front of history', () => {
    const list = addCreation(mockItem);
    expect(list[0].id).toBe(mockItem.id);
    expect(list[0].title).toBe('Cyberpunk Metropolis');
  });

  it('toggles favorite status of an existing creation', () => {
    addCreation(mockItem);
    const updated = toggleFavoriteCreation(mockItem.id);
    const item = updated.find((c) => c.id === mockItem.id);
    expect(item?.isFavorite).toBe(true);

    const reverted = toggleFavoriteCreation(mockItem.id);
    const itemReverted = reverted.find((c) => c.id === mockItem.id);
    expect(itemReverted?.isFavorite).toBe(false);
  });

  it('deletes a creation by id', () => {
    addCreation(mockItem);
    const updated = deleteCreation(mockItem.id);
    expect(updated.find((c) => c.id === mockItem.id)).toBeUndefined();
  });

  it('exports and imports valid JSON data', () => {
    addCreation(mockItem);
    const exportedJson = exportCreationsJson();
    expect(exportedJson).toContain('Cyberpunk Metropolis');

    // Clear and import back
    clearAllCreations();
    expect(loadCreations().length).toBeGreaterThan(0); // seed reloads on empty read

    const importRes = importCreationsJson(exportedJson);
    expect(importRes.success).toBe(true);
    expect(importRes.count).toBeGreaterThanOrEqual(1);

    const reloaded = loadCreations();
    expect(reloaded.some((c) => c.id === mockItem.id)).toBe(true);
  });

  it('safely handles malformed JSON during import', () => {
    const res = importCreationsJson('invalid-json-content{{{');
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});
