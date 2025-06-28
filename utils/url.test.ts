import { extractFilenameFromURL, downloadDocument } from './url';

jest.mock('./appHelpers', () => ({
  postMessageToNativeOrFallback: jest.fn((_, __, fallback) => fallback?.()),
}));

beforeEach(() => {
  document.body.innerHTML = '';
  jest.clearAllMocks();

  global.fetch = jest.fn(() =>
    Promise.resolve({
      blob: () =>
        Promise.resolve(
          new Blob(['mock content'], { type: 'application/pdf' })
        ),
    })
  ) as jest.Mock;

  global.URL.createObjectURL = jest.fn(() => 'blob:mock');
  HTMLAnchorElement.prototype.click = jest.fn();
});

describe('extractFilenameFromURL', () => {
  it('should extract filename from a valid URL', () => {
    const result = extractFilenameFromURL(
      'https://example.com/docs/sample.pdf'
    );
    expect(result).toBe('sample.pdf');
  });

  it('should return empty string for undefined URL', () => {
    const result = extractFilenameFromURL(undefined as any);
    expect(result).toBe('');
  });

  it('should return empty string for non-string input', () => {
    const result = extractFilenameFromURL(123 as any);
    expect(result).toBe('');
  });

  it('should handle URL with encoded characters', () => {
    const result = extractFilenameFromURL(
      'https://example.com/files/report%202024.pdf'
    );
    expect(result).toBe('report 2024.pdf');
  });

  it('should return empty string on invalid URL format', () => {
    const result = extractFilenameFromURL('not-a-url');
    expect(result).toBe('');
  });
});

describe('downloadDocument', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        blob: () =>
          Promise.resolve(
            new Blob(['file content'], { type: 'application/pdf' })
          ),
      })
    ) as jest.Mock;

    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  it('should trigger download when given a valid URL', async () => {
    const createElementSpy = jest.spyOn(document, 'createElement');
    const appendSpy = jest.spyOn(document.body, 'appendChild');
    const removeSpy = jest.spyOn(document.body, 'removeChild');

    await downloadDocument('https://example.com/sample.pdf');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });

  it('should not attempt download for invalid URL', () => {
    const result = downloadDocument(null as any);
    expect(result).toBeUndefined();
  });
});
