import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomCheckbox from './index';

describe('CustomCheckbox Component-Women Label', () => {
  const onChangeMock = jest.fn();

  const baseProps = {
    id: 'checkbox-women',
    value: false,
    onChange: onChangeMock,
    key: 'key-women',
  };

  const labelText = 'Women';

  beforeEach(() => {
    onChangeMock.mockClear();
  });

  it('renders checkbox with label: "Women"', () => {
    render(<CustomCheckbox {...baseProps} label={labelText} />);
    const checkbox = screen.getByLabelText(labelText);
    expect(checkbox).toBeInTheDocument();
  });

  it('calls onChange when checkbox "Women" is clicked', () => {
    render(<CustomCheckbox {...baseProps} label={labelText} />);
    const checkbox = screen.getByLabelText(labelText);
    fireEvent.click(checkbox);
    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });

  it('checkbox "Women" is checked when checked is true', () => {
    render(<CustomCheckbox {...baseProps} label={labelText} value={true} />);
    const checkbox = screen.getByLabelText(labelText) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('checkbox "Women" is disabled when disabled is true', () => {
    render(<CustomCheckbox {...baseProps} label={labelText} disabled={true} />);
    const checkbox = screen.getByLabelText(labelText);
    expect(checkbox).toBeDisabled();
  });

  it('renders without label if not provided', () => {
    render(<CustomCheckbox {...baseProps} label="" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });
});
