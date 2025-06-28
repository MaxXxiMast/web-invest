import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MfCalculatorChips from './MfCalculatorChips';
import styles from './MfCalculatorChips.module.css';

describe('MfCalculatorChips', () => {
  const chipArr = [1000, 2000, 3000];
  const selectedChip = 2000;
  const popularChipIndex = 1;
  const handleChipClick = jest.fn();

  it('renders the component with chips', () => {
    render(
      <MfCalculatorChips
        chipArr={chipArr}
        selectedChip={selectedChip}
        handleChipClick={handleChipClick}
        popularChipIndex={popularChipIndex}
      />
    );

    chipArr.forEach((value) => {
      expect(screen.getByTestId(`₹${value}`)).toBeInTheDocument();
    });
  });

  it('handles chip click', () => {
    render(
      <MfCalculatorChips
        chipArr={chipArr}
        selectedChip={selectedChip}
        handleChipClick={handleChipClick}
        popularChipIndex={popularChipIndex}
      />
    );

    const chip = screen.getByTestId(`₹${chipArr[0]}`);
    fireEvent.click(chip);
    expect(handleChipClick).toHaveBeenCalledWith(chipArr[0]);
  });

  it('displays selected chip', () => {
    render(
      <MfCalculatorChips
        chipArr={chipArr}
        selectedChip={selectedChip}
        handleChipClick={handleChipClick}
        popularChipIndex={popularChipIndex}
      />
    );

    const selectedChipElement = screen.getByTestId(`₹${selectedChip}`);
    expect(selectedChipElement).toHaveClass(styles.selectedChip);
  });

  it('displays popular chip', () => {
    render(
      <MfCalculatorChips
        chipArr={chipArr}
        selectedChip={selectedChip}
        handleChipClick={handleChipClick}
        popularChipIndex={popularChipIndex}
      />
    );

    const popularChipElement = screen.getByText('Popular');
    expect(popularChipElement).toBeInTheDocument();
    expect(popularChipElement).toHaveClass(styles.popularTag);
  });

  it('does not render when chipArr is empty', () => {
    const { container } = render(
      <MfCalculatorChips
        chipArr={[]}
        selectedChip={selectedChip}
        handleChipClick={handleChipClick}
        popularChipIndex={popularChipIndex}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
