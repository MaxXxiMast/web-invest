import { handleElementFocus } from './htmlHelpers';

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  document.body.innerHTML = '';
});

test('should focus element and call callback after timeout', () => {
  const focusMock = jest.fn();
  const callbackMock = jest.fn();

  const input = document.createElement('input');
  input.setAttribute('id', 'myInput');
  input.focus = focusMock;

  document.body.appendChild(input);

  handleElementFocus('#myInput', callbackMock, 200);

  expect(focusMock).not.toHaveBeenCalled();
  expect(callbackMock).not.toHaveBeenCalled();

  jest.advanceTimersByTime(200);

  expect(focusMock).toHaveBeenCalled();
  expect(callbackMock).toHaveBeenCalled();
});

test('should only focus element if no callback provided', () => {
  const focusMock = jest.fn();
  const input = document.createElement('input');
  input.setAttribute('id', 'input2');
  input.focus = focusMock;

  document.body.appendChild(input);

  handleElementFocus('#input2');

  jest.advanceTimersByTime(100);

  expect(focusMock).toHaveBeenCalled();
});
