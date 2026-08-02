import { describe, it, expect, vi } from 'vitest';
import { createContentRoute } from '../route-helper';
import * as github from '../github';
import { NextResponse } from 'next/server';

vi.mock('../github', () => ({
  getContentJSON: vi.fn(),
  saveContentJSON: vi.fn(),
}));

describe('route-helper.ts tests', () => {
  it('GET method returns JSON successfully', async () => {
    vi.mocked(github.getContentJSON).mockResolvedValue({ data: { test: 123 }, sha: '123' });
    const route = createContentRoute('test.json', 'test label');
    
    const response = await route.GET() as NextResponse;
    expect(response.status).toBe(200);
  });

  it('POST method rejects empty bodies with 400', async () => {
    const route = createContentRoute('test.json', 'test label');
    // Mock an empty body syntax error behavior
    const request = { json: async () => { throw new SyntaxError("Unexpected end of JSON input"); } } as any;
    
    const response = await route.POST(request) as NextResponse;
    expect(response.status).toBe(400);
  });

  it('POST method rejects invalid JSON structures (not object or array)', async () => {
    const route = createContentRoute('test.json', 'test label');
    const request = { json: async () => "just a string" } as any;
    
    const response = await route.POST(request) as NextResponse;
    expect(response.status).toBe(400);
  });
});
