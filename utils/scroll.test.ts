import { scrollIntoViewByScrollId, setActiveClass } from './scroll';

describe('scrollIntoViewByScrollId', () => {
  test('should call scrollIntoView on the element if it exists', () => {
    const scrollMock = jest.fn();
    const mockElement = document.createElement('div');
    mockElement.id = 'testId';
    mockElement.scrollIntoView = scrollMock;

    document.body.appendChild(mockElement);

    const scrollOptions = { behavior: 'smooth' };
    scrollIntoViewByScrollId('testId', scrollOptions);

    expect(scrollMock).toHaveBeenCalledWith(scrollOptions);

    document.body.removeChild(mockElement);
  });
});

describe('setActiveClass', () => {
  test('should default to class name "active"', () => {
    const mockElement = document.createElement('div');
    const toggleSpy = jest.spyOn(mockElement.classList, 'toggle');

    setActiveClass(mockElement, true);

    expect(toggleSpy).toHaveBeenCalledWith('active', true);
  });

  test('should handle undefined element gracefully', () => {
    expect(() => {
      setActiveClass(null as unknown as Element, true);
    }).not.toThrow();
  });
});
