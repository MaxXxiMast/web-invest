import React from 'react';
import { render } from '@testing-library/react';
import SwiperNavigation from './SwiperNavigation';
import { handleExtraProps } from '../../../utils/string';

jest.mock('../../../utils/string', () => ({
  handleExtraProps: jest.fn((input) => input || ''),
}));

jest.useFakeTimers();

describe('SwiperNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with default props', () => {
    const { container } = render(<SwiperNavigation />);
    expect(container.querySelectorAll('.SwiperNavArrow')).toHaveLength(2);
    expect(container.querySelector('.SwiperNavProgress')).toBeNull();
  });

  test('renders with custom class names', () => {
    const { container } = render(
      <SwiperNavigation className="custom-class" stylingClass="styling-class" />
    );

    const navigationContainer = container.firstChild;
    expect(navigationContainer).toHaveClass('custom-class');
    expect(navigationContainer).toHaveClass('styling-class');
  });

  test('renders with custom IDs', () => {
    const { container } = render(
      <SwiperNavigation
        id="nav-container"
        prevBtnId="prev-btn"
        nextBtnId="next-btn"
      />
    );

    expect(container.querySelector('#nav-container')).toBeInTheDocument();
    expect(container.querySelector('#prev-btn')).toBeInTheDocument();
    expect(container.querySelector('#next-btn')).toBeInTheDocument();
  });

  test('handles navigation visibility', () => {
    const { container: hiddenNav } = render(
      <SwiperNavigation showNavigation={false} />
    );
    expect(hiddenNav.querySelectorAll('.SwiperNavArrow')).toHaveLength(0);

    const { container: visibleNav } = render(
      <SwiperNavigation showNavigation={true} />
    );
    expect(visibleNav.querySelectorAll('.SwiperNavArrow')).toHaveLength(2);
  });

  test('handles scrollbar visibility', () => {
    const { container: hiddenScrollbar } = render(
      <SwiperNavigation showScrollbar={false} />
    );
    expect(hiddenScrollbar.querySelector('.SwiperNavProgress')).toBeNull();

    const { container: visibleScrollbar } = render(
      <SwiperNavigation showScrollbar={true} />
    );
    expect(
      visibleScrollbar.querySelector('.SwiperNavProgress')
    ).toBeInTheDocument();
  });

  test('handles first slide state', () => {
    const { container } = render(<SwiperNavigation isFirstSlide={true} />);

    const prevArrowIcon = container.querySelector(
      '.SwiperNavArrow:first-child span'
    );
    expect(prevArrowIcon).not.toHaveClass('icon-caret-left');
    expect(prevArrowIcon).not.toHaveClass('Arrow');
  });

  test('handles last slide state', () => {
    const { container } = render(<SwiperNavigation isLastSlide={true} />);

    const nextArrowIcon = container.querySelector(
      '.SwiperNavArrow:last-child span'
    );
    expect(nextArrowIcon).not.toHaveClass('icon-caret-right');
    expect(nextArrowIcon).not.toHaveClass('Arrow');
  });

  test('applies colored class correctly', () => {
    const { container: coloredNav } = render(
      <SwiperNavigation colored={true} />
    );
    const coloredPrevArrow = coloredNav.querySelector(
      '.SwiperNavArrow:first-child span'
    );
    expect(coloredPrevArrow).not.toHaveClass('colored');

    const { container: defaultNav } = render(
      <SwiperNavigation colored={false} />
    );
    const defaultPrevArrow = defaultNav.querySelector(
      '.SwiperNavArrow:first-child span'
    );
    expect(defaultPrevArrow).toHaveClass('colored');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  test('hides navigation when scrollbar is locked', () => {
    const mockScrollbarElement = document.createElement('div');
    mockScrollbarElement.classList.add('swiper-scrollbar-lock');

    jest
      .spyOn(document, 'getElementById')
      .mockImplementation(() => mockScrollbarElement);

    const { container } = render(
      <SwiperNavigation progressBarId="progress-bar" />
    );
    jest.runAllTimers();

    expect(container.firstChild).toHaveClass('HideNaV');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  test('shows navigation when scrollbar is not locked', () => {
    const mockScrollbarElement = document.createElement('div');

    jest
      .spyOn(document, 'getElementById')
      .mockImplementation(() => mockScrollbarElement);

    const { container } = render(
      <SwiperNavigation progressBarId="progress-bar" />
    );
    jest.runAllTimers();

    expect(container.firstChild).not.toHaveClass('HideNaV');
  });

  test('handles case when progressBarId element is not found', () => {
    jest.spyOn(document, 'getElementById').mockImplementation(() => null);

    const mockAdd = jest.fn();
    const mockRemove = jest.fn();
    const mockRef = {
      current: {
        classList: {
          add: mockAdd,
          remove: mockRemove,
        },
      },
    };

    jest.spyOn(React, 'useRef').mockReturnValue(mockRef as any);

    expect(() => {
      render(<SwiperNavigation progressBarId="non-existent" />);
    }).not.toThrow();

    expect(mockAdd).not.toHaveBeenCalled();
    expect(mockRemove).not.toHaveBeenCalled();
  });

  test('calls handleExtraProps with correct parameters', () => {
    render(
      <SwiperNavigation
        id="container-id"
        className="class-name"
        prevBtnId="prev-btn"
        nextBtnId="next-btn"
        progressBarId="progress-bar"
      />
    );

    expect(handleExtraProps).toHaveBeenCalledWith('container-id');
    expect(handleExtraProps).toHaveBeenCalledWith('class-name');
    expect(handleExtraProps).toHaveBeenCalledWith('prev-btn');
    expect(handleExtraProps).toHaveBeenCalledWith('next-btn');
    expect(handleExtraProps).toHaveBeenCalledWith('progress-bar');
  });
});
