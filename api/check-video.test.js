import handler from './check-video';


// Mock node-fetch directly
jest.mock('node-fetch', () => jest.fn());
import fetch from 'node-fetch';

describe('check-video API', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      method: 'POST',
      body: { url: 'http://example.com/video.mp4' },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    // Clear mock before each test
    fetch.mockClear();
  });

  it('should return 400 if URL is missing', async () => {
    mockReq.body.url = undefined;
    await handler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'URL is required' });
  });

  it('should return 200 with available: true for a valid URL (mocked fetch)', async () => {
    fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
      })
    );

    await handler(mockReq, mockRes);
    expect(fetch).toHaveBeenCalledWith('http://example.com/video.mp4', { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NowShowing/1.0)' } });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ url: 'http://example.com/video.mp4', available: true });
  });

  it('should return 200 with available: false for an invalid URL (mocked fetch)', async () => {
    fetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 404,
      })
    );

    await handler(mockReq, mockRes);
    expect(fetch).toHaveBeenCalledWith('http://example.com/video.mp4', { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NowShowing/1.0)' } });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ url: 'http://example.com/video.mp4', available: false });
  });

  it('should return 200 with available: false and error message on fetch error', async () => {
    const errorMessage = 'Network error';
    fetch.mockImplementation(() => Promise.reject(new Error(errorMessage)));

    await handler(mockReq, mockRes);
    expect(fetch).toHaveBeenCalledWith('http://example.com/video.mp4', { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NowShowing/1.0)' } });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ url: 'http://example.com/video.mp4', available: false, error: `Network error: ${errorMessage}` });
  });

  it('should return 405 for non-POST requests', async () => {
    mockReq.method = 'GET';
    await handler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(405);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Method Not Allowed' });
  });
});
