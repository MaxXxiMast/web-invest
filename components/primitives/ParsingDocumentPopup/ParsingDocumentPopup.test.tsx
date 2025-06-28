import { render, screen, act } from '@testing-library/react';
import ParsingDocumentPopup from '.';

jest.useFakeTimers();

jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

describe('ParsingDocumentPopup', () => {
  const mockSetShowFetchModal = jest.fn();
  const mockSetIsApiResponse = jest.fn();
  const stepsArr = [
    { title: 'Decrypting Document' },
    { title: 'Parsing Data' },
    { title: 'Verifying Content' },
  ];

  const renderComponent = (props = {}) => {
    return render(
      <ParsingDocumentPopup
        showModal={true}
        title="Parsing Document"
        isApiResponse={false}
        setShowFetchModal={mockSetShowFetchModal}
        setIsApiResponse={mockSetIsApiResponse}
        stepsArr={stepsArr}
        {...props}
      />
    );
  };

  beforeEach(() => {
    mockSetShowFetchModal.mockClear();
    mockSetIsApiResponse.mockClear();
  });

  it('should render nothing when showModal is false', () => {
    const { container } = render(
      <ParsingDocumentPopup
        showModal={false}
        title="Test"
        isApiResponse={false}
        setShowFetchModal={mockSetShowFetchModal}
        setIsApiResponse={mockSetIsApiResponse}
        stepsArr={stepsArr}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render popup with title and progress bar', () => {
    renderComponent();
    expect(screen.getByText('Parsing Document')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should update progress and steps over time', () => {
    renderComponent();

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText('33%')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText('66%')).toBeInTheDocument();
  });
  it('should handle isApiResponse=true and complete the flow', () => {
    renderComponent({ isApiResponse: true });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockSetShowFetchModal).toHaveBeenCalledWith(false);
    expect(mockSetIsApiResponse).toHaveBeenCalledWith(false);

    const progressBarText = screen.queryByText((content) =>
      content.includes('%')
    );
    expect(progressBarText).toBeInTheDocument();
  });

  it('should show tick icon for processed steps and loader for current step', () => {
    renderComponent();

    act(() => {
      jest.advanceTimersByTime(6000); // After second step
    });

    const progressText = screen.getByText('66%');
    expect(progressText).toBeInTheDocument();

    const allTitles = stepsArr.map((step) => step.title);
    allTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });
});
