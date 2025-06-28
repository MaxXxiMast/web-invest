import { renderHook } from '@testing-library/react';
import { useScript } from './hooks';

describe('useScript', () => {
  const url = 'https://example.com/script.js';

  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('should append a script tag with the given URL', () => {
    renderHook(() => useScript(url, jest.fn()));
    const script = document.querySelector(
      `script[src="${url}"]`
    ) as HTMLScriptElement;
    expect(script).not.toBeNull();
    expect(script.src).toBe(url);
  });

  it('should call onload when the script loads', () => {
    const onloadMock = jest.fn();
    renderHook(() => useScript(url, onloadMock));
    const script = document.querySelector(
      `script[src="${url}"]`
    ) as HTMLScriptElement;
    script.onload?.(new Event('load'));
    expect(onloadMock).toHaveBeenCalled();
  });

  it('should remove the script tag on unmount', () => {
    const { unmount } = renderHook(() => useScript(url, jest.fn()));
    expect(document.querySelector(`script[src="${url}"]`)).not.toBeNull();
    unmount();
    expect(document.querySelector(`script[src="${url}"]`)).toBeNull();
  });
});
