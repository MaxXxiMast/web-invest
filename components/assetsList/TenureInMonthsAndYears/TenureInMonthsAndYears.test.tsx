import React from 'react';
import { render, screen } from '@testing-library/react';
import TenureInMonthsAndYrs from './index';


describe('TenureInMonthsAndYrs Component', () => {
  it('TC 1: should render years and months when both values are provided', () => {
    const { container } = render(
        <TenureInMonthsAndYrs
          value={{ yearsValue: 2, yearsSuffix: 'Y', monthsValue: 6, monthsSuffix: 'M' }}
        />
      );
      expect(container.textContent).toContain('2');
      expect(container.textContent).toContain('Y');
      expect(container.textContent).toContain('6');
      expect(container.textContent).toContain('M');
  })  

  it('TC 2: should render only years when months are not provided', () => {
    render(
      <TenureInMonthsAndYrs
        value={{ yearsValue: 3, yearsSuffix: 'Y' }}
      />
    );
  
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Y')).toBeInTheDocument();
    expect(screen.queryByText('M')).not.toBeInTheDocument();
  });

  it('TC 3: should render only months when years are not provided', () => {
    render(
      <TenureInMonthsAndYrs
        value={{ monthsValue: 8, monthsSuffix: 'M' }}
      />
    );
  
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.queryByText('Y')).not.toBeInTheDocument();
  });
  
  it('TC 4: should not render the component if no value is passed (undefined)', () => {
    render(
      <TenureInMonthsAndYrs
        value={undefined}
        valueClassName={undefined}
      />
    );
  
    expect(screen.queryByText('Y')).not.toBeInTheDocument();
    expect(screen.queryByText('M')).not.toBeInTheDocument();
  });

});
