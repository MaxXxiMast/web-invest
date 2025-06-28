import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterGroup from './FilterGroup';

// Mock TooltipComponent
jest.mock('../../../primitives/TooltipCompoent/TooltipCompoent', () => ({
  __esModule: true,
  default: ({ toolTipText, children }: any) => (
    <div>
      <span data-testid="tooltip">{toolTipText}</span>
      {children}
    </div>
  ),
}));

// Mock CSS module
jest.mock('./FilterGroup.module.css', () => ({
  filterContainer: 'mock-filter-container',
  filterLabel: 'mock-filter-label',
  optionsContainer: 'mock-options-container',
  option: 'mock-option',
  selectedOption: 'mock-selected-option',
}));

describe('FilterGroup Component', () => {
  const mockOptions = [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
  ];

  it('renders label and options correctly', () => {
    render(
      <FilterGroup
        label="Test Label"
        options={mockOptions}
        value={[]}
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('toggles selection on click and calls onChange', () => {
    const onChangeMock = jest.fn();

    render(
      <FilterGroup
        label="Label"
        tooltipContent=""
        options={mockOptions}
        value={['opt1']}
        onChange={onChangeMock}
      />
    );

    // Clicking selected option should deselect
    fireEvent.click(screen.getByText('Option 1'));
    expect(onChangeMock).toHaveBeenCalledWith([]);

    // Clicking unselected option should select
    fireEvent.click(screen.getByText('Option 2'));
    expect(onChangeMock).toHaveBeenCalledWith(['opt1', 'opt2']);
  });

  it('shows tick icon for selected options', () => {
    render(
      <FilterGroup
        label="Label"
        tooltipContent=""
        options={mockOptions}
        value={['opt1']}
      />
    );

    // Find the container of Option 1 and check for tick icon inside
    const optionContainer = screen.getByText('Option 1').closest('div');
    const tickIcon = optionContainer?.querySelector('.icon-tick');

    expect(tickIcon).toBeInTheDocument();
  });

  it('renders and works correctly even if onChange is not passed', () => {
    const mockOptions = [{ value: 'opt1', label: 'Option 1' }];

    render(
      <FilterGroup
        label="Label"
        tooltipContent=""
        options={mockOptions}
        value={[]}
        // onChange not passed, so default noop should be used
      />
    );

    // Click option should not throw error even if onChange is default noop
    fireEvent.click(screen.getByText('Option 1'));
  });
});
