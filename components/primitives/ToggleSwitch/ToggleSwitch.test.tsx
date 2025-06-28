import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ToggleSwitch from './ToggleSwitch';
import styles from './ToggleSwitch.module.css';

describe('ToggleSwitch Component', () => {
  it('TC 1: should render ToggleSwitch without crashing', () => {
    render(<ToggleSwitch />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('TC 2: should call handleChange when toggled', () => {
    const handleChange = jest.fn();
    
    render(<ToggleSwitch handleChange={handleChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('TC 3: should render with left and right labels', () => {
    render(<ToggleSwitch leftLabel="Left" rightLabel="Right" />);
    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
  });

  it('TC 4: should be checked when "checked" prop is true', () => {
    render(<ToggleSwitch checked={true} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('TC 5: should be disabled when "disabled" prop is true', () => {
    render(<ToggleSwitch disabled={true} />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('TC 6: Check whether fieldName prop is rendered as an empty string', () => {
    render(<ToggleSwitch fieldName="" />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('name', ''); // Check if the name attribute is empty
  });

  it('TC 7: should handle empty and undefined className prop', () => {
    // for Empty
    const { container: containerWithEmptyClass } = render(
      <ToggleSwitch className="" />
    );
    const switchContainerEmpty = containerWithEmptyClass.querySelector('div');
    expect(switchContainerEmpty).toHaveClass(styles.SwitchContainer);
  
    // for Undefined
    const { container: containerWithUndefinedClass } = render(
      <ToggleSwitch className={undefined} />
    );
    const switchContainerUndefined = containerWithUndefinedClass.querySelector('div');
    expect(switchContainerUndefined).toHaveClass(styles.SwitchContainer);
  });
  
});
