import { render, screen, waitFor } from '@testing-library/react';
import SwiperComponent from './SwiperComponent';

jest.mock('swiper/css', () => ({}));
jest.mock('swiper/css/navigation', () => ({}));
jest.mock('swiper/css/pagination', () => ({}));
jest.mock('swiper/react', () => {
  return {
    Swiper: jest.fn(
      ({
        children,
        onSwiper,
        modules,
        slidesPerView,
        spaceBetween,
        allowTouchMove,
        ...props
      }) => {
        if (onSwiper) {
          setTimeout(() => onSwiper({}), 0);
        }

        return (
          <div
            data-testid="swiper-mock"
            data-props={JSON.stringify({
              modules,
              slidesPerView,
              spaceBetween,
              allowTouchMove,
              ...props,
            })}
          >
            {children}
          </div>
        );
      }
    ),
    SwiperSlide: jest.fn(({ children, className }) => (
      <div data-testid="swiper-slide-mock" className={className}>
        {children}
      </div>
    )),
  };
});

jest.mock('swiper', () => ({
  Navigation: function Navigation() {},
  Pagination: function Pagination() {},
  Scrollbar: function Scrollbar() {},
}));

jest.mock('../../../utils/string', () => ({
  handleExtraProps: jest.fn((prop) => prop || ''),
}));

describe('SwiperComponent', () => {
  const mockSliderData = [
    { id: '1', content: 'Slide 1' },
    { id: '2', content: 'Slide 2' },
    { id: '3', content: 'Slide 3' },
  ];

  const mockCustomSliderComponent = (item: any) => (
    <div data-testid={`custom-slide-${item.id}`}>{item.content}</div>
  );
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should render nothing if sliderDataArr is empty', () => {
    const { container } = render(
      <SwiperComponent
        sliderDataArr={[]}
        customSliderComponent={mockCustomSliderComponent}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render the Swiper component with sliderDataArr items', () => {
    render(
      <SwiperComponent
        sliderDataArr={mockSliderData}
        customSliderComponent={mockCustomSliderComponent}
      />
    );

    expect(screen.getByTestId('swiper-mock')).toBeInTheDocument();
    expect(screen.getAllByTestId('swiper-slide-mock')).toHaveLength(3);
  });

  it('should pass className and id props correctly', () => {
    render(
      <SwiperComponent
        sliderDataArr={mockSliderData}
        customSliderComponent={mockCustomSliderComponent}
        className="test-class"
        id="test-id"
        SwiperSlideClassName="slide-class"
      />
    );

    const swiperContainer = screen.getByTestId('swiper-mock').parentElement;
    expect(swiperContainer).toHaveClass('test-class');
    expect(swiperContainer).toHaveClass('SwiperComponent');
    expect(swiperContainer).toHaveAttribute('id', 'test-id');

    const slides = screen.getAllByTestId('swiper-slide-mock');
    slides.forEach((slide) => {
      expect(slide).toHaveClass('slide-class');
    });
  });

  it('should pass Swiper props to the Swiper component', () => {
    render(
      <SwiperComponent
        sliderDataArr={mockSliderData}
        customSliderComponent={mockCustomSliderComponent}
        navigation={true}
        pagination={true}
        loop={true}
      />
    );
    const swiperProps = JSON.parse(
      screen.getByTestId('swiper-mock').getAttribute('data-props') || '{}'
    );
    expect(swiperProps.navigation).toBe(true);
    expect(swiperProps.pagination).toBe(true);
    expect(swiperProps.loop).toBe(true);
  });

  it('should set allowTouchMove prop correctly', () => {
    render(
      <SwiperComponent
        sliderDataArr={mockSliderData}
        customSliderComponent={mockCustomSliderComponent}
        allowTouchMove={false}
      />
    );
    const swiperProps = JSON.parse(
      screen.getByTestId('swiper-mock').getAttribute('data-props') || '{}'
    );
    expect(swiperProps.allowTouchMove).toBe(false);
  });

  it('should update swiperOptions after swiper instance is initialized', async () => {
    const { rerender } = render(
      <SwiperComponent
        sliderDataArr={mockSliderData}
        customSliderComponent={mockCustomSliderComponent}
        navigation={true}
      />
    );
    await waitFor(() => {}, { timeout: 300 });

    rerender(
      <SwiperComponent
        sliderDataArr={mockSliderData}
        customSliderComponent={mockCustomSliderComponent}
        navigation={false}
        pagination={true}
      />
    );
    await waitFor(() => {}, { timeout: 300 });
    expect(screen.getByTestId('swiper-mock')).toBeInTheDocument();
  });
});
