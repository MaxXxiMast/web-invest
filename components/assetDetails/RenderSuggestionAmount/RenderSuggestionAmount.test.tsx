import { render, screen, fireEvent } from '@testing-library/react';
import RenderSuggestionAmount from './index';
  
describe('RenderSuggestionAmount Component', () => {
  const mockOnClick = jest.fn();
  const defaultSuggestions = [100, 200, 500];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render suggestions with +₹ prefix by default', () => {
    render(
      <RenderSuggestionAmount
        suggestionList={defaultSuggestions}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('+₹ 100')).toBeInTheDocument();
    expect(screen.getByText('+₹ 200')).toBeInTheDocument();
    expect(screen.getByText('+₹ 500')).toBeInTheDocument();
  });

  it('should render suggestions with ₹ prefix and min label when showFixedSuggestion is true', () => {
    render(
      <RenderSuggestionAmount
        suggestionList={defaultSuggestions}
        onClick={mockOnClick}
        showFixedSuggestion={true}
      />
    );

    expect(screen.getByText('₹ 100 (min)')).toBeInTheDocument();
    expect(screen.getByText('₹ 200')).toBeInTheDocument();
    expect(screen.getByText('₹ 500')).toBeInTheDocument();
  });

  it('should call onClick with the correct value when a suggestion is clicked', () => {
    render(
      <RenderSuggestionAmount
        suggestionList={defaultSuggestions}
        onClick={mockOnClick}
      />
    );

    fireEvent.click(screen.getByText('+₹ 200'));
    expect(mockOnClick).toHaveBeenCalledWith(200);
  });

  it('should handle undefined suggestionList ', () => {
    render(
        <RenderSuggestionAmount suggestionList={undefined as any} onClick={jest.fn()} />
    );
    expect(screen.queryAllByTestId('suggestion-span')).toHaveLength(0);
  })

  it('should not render min label for suggestions other than the first one when showFixedSuggestion is true', () => {
     render(
      <RenderSuggestionAmount
        suggestionList={defaultSuggestions}
        onClick={jest.fn()}
        showFixedSuggestion={true}
      />
    );
  
    // Verifying that the second and third suggestions don't have the "(min)" label
    expect(screen.getByText('₹ 200')).toBeInTheDocument();
    expect(screen.getByText('₹ 500')).toBeInTheDocument();
    expect(screen.queryByText('₹ 200 (min)')).toBeNull();
    expect(screen.queryByText('₹ 500 (min)')).toBeNull();
  });
  
});
