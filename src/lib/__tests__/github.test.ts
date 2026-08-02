import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFile, updateFile, triggerRebuild, testConnection } from '../github';

// Mock the global fetch
global.fetch = vi.fn();

describe('github.ts tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.GITHUB_REPO = 'test/repo';
    process.env.GITHUB_TOKEN = 'mock-token';
    process.env.GITHUB_BRANCH = 'main';
  });

  describe('getConfig validation', () => {
    it('throws if GITHUB_REPO is missing', async () => {
      delete process.env.GITHUB_REPO;
      await expect(getFile('test.json')).rejects.toThrow('GITHUB_REPO environment variable is missing.');
    });

    it('throws if GITHUB_TOKEN is missing', async () => {
      delete process.env.GITHUB_TOKEN;
      await expect(getFile('test.json')).rejects.toThrow('GITHUB_TOKEN environment variable is missing.');
    });
  });

  describe('getFile', () => {
    it('successfully fetches and decodes a file', async () => {
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ content: Buffer.from('{"key":"value"}').toString('base64'), sha: 'sha123' })
      });
      const result = await getFile('test.json');
      expect(result.content).toBe('{"key":"value"}');
      expect(result.sha).toBe('sha123');
      expect(fetch).toHaveBeenCalledWith('https://api.github.com/repos/test/repo/contents/test.json?ref=main', expect.any(Object));
    });

    it('throws an error on failed fetch', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => 'Not Found'
      });
      await expect(getFile('test.json')).rejects.toThrow(/GitHub API error 404/);
    });
  });

  describe('triggerRebuild', () => {
    it('successfully triggers workflow dispatch', async () => {
      (fetch as any).mockResolvedValue({ ok: true, status: 204 });
      const result = await triggerRebuild();
      expect(result).toBe('Triggered GitHub Actions rebuild successfully.');
    });
  });
});
