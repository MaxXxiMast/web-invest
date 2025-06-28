import { setupChatPopupScrollLock, getRatingLabel} from './utils';

describe('getRatingLabel', () => {
  it('returns correct label for rating 1', () => {
    expect(getRatingLabel(1)).toBe('Very Poor');
  });

  it('returns correct label for rating 2', () => {
    expect(getRatingLabel(2)).toBe('Poor');
  });

  it('returns correct label for rating 3', () => {
    expect(getRatingLabel(3)).toBe('Neutral');
  });

  it('returns correct label for rating 4', () => {
    expect(getRatingLabel(4)).toBe('Good');
  });

  it('returns correct label for rating 5', () => {
    expect(getRatingLabel(5)).toBe('Excellent');
  });

  it('returns empty string for null rating', () => {
    expect(getRatingLabel(null)).toBe('');
  });
});

describe('setupChatPopupScrollLock', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  it('should not change overflow if not mobile', () => {
    const cleanup = setupChatPopupScrollLock(false);
    expect(document.body.style.overflow).toBe('');
    cleanup();
    expect(document.body.style.overflow).toBe('');
  });
});
describe('setupChatPopupScrollLock - mobile', () => {
  let chatWindow: HTMLDivElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="chat-popup"></div>';
    chatWindow = document.getElementById('chat-popup') as HTMLDivElement;
    chatWindow.style.height = '100px';
    chatWindow.style.width = '100px';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should lock scroll on click inside chat window', () => {
    const cleanup = setupChatPopupScrollLock(true);
    const event = new MouseEvent('click', { bubbles: true });
    chatWindow.dispatchEvent(event);
    expect(document.body.style.overflow).toBe('hidden');
    cleanup();
  });

  it('should unlock scroll on click outside chat window', () => {
    const cleanup = setupChatPopupScrollLock(true);
    const event = new MouseEvent('click', { bubbles: true });
    document.body.dispatchEvent(event);
    expect(document.body.style.overflow).toBe('unset');
    cleanup();
  });
});
