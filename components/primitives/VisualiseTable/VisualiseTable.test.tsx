import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VisualiseTable from '.';

// Mock lodash/get to simply grab the property directly
jest.mock('lodash/get', () => jest.fn((obj, key) => obj[key]));

// Mock sub-components and assets
jest.mock('../../layout/Loading', () => {
  const MockLoading = () => <div data-testid="grip-loading">Loading...</div>;
  MockLoading.displayName = 'MockLoading';
  return MockLoading;
});
jest.mock('../../assets/static/assetList/RupeesIcon.svg', () => ({
  src: 'rupee-icon.svg',
}));
jest.mock('../../../utils/string', () => ({
  GRIP_INVEST_GI_STRAPI_BUCKET_URL: 'https://bucket.url/',
  handleExtraProps: (className: string) => `extra-${className}`,
}));

type Row = Record<string, unknown>;
type Header = {
  key: string;
  label: string;
  formatter?: (value: any) => string;
  customRow?: (item: Row) => React.ReactNode;
};

describe('VisualiseTable Component', () => {
  const baseData = {
    header: 'Test Header',
    headers: [
      { key: '#', label: 'Index' },
      { key: 'name', label: 'Name' },
      { key: 'value', label: 'Value', formatter: (v: any) => `$${v}` },
      {
        key: 'custom',
        label: 'Custom',
        customRow: (item: Row) => <span>{item.customText as string}</span>,
      },
    ] as Header[],
    rows: [
      { name: 'Alice', value: 10, customText: 'A' },
      { name: 'Bob', value: 20, customText: 'B' },
    ] as Row[],
  };

  it('renders loading state when loading is true', () => {
    render(
      <VisualiseTable showSchedule={false} data={baseData} loading={true} />
    );
    expect(screen.getByTestId('grip-loading')).toBeInTheDocument();
  });

  it('renders headers and rows correctly', () => {
    render(<VisualiseTable showSchedule={false} data={baseData} />);

    // Check header text
    expect(screen.getByText('Test Header')).toBeInTheDocument();

    // Check table headers
    ['Index', 'Name', 'Value', 'Custom'].forEach((label) => {
      expect(
        screen.getByRole('columnheader', { name: label })
      ).toBeInTheDocument();
    });

    // Check row data: Index
    expect(screen.getByRole('cell', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '2' })).toBeInTheDocument();

    // Check formatted value cell
    expect(screen.getByRole('cell', { name: '$10' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '$20' })).toBeInTheDocument();

    // Check custom row content
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('hides back arrow when showSchedule is true', () => {
    render(<VisualiseTable showSchedule={true} data={baseData} />);
    // Back arrow has aria-label from img alt, but entire span clickable, so ensure no arrow img
    const arrowImgs = screen.queryByAltText('ArrowRight');
    expect(arrowImgs).not.toBeInTheDocument();
  });

  it('calls handleBackEvent when arrow clicked', () => {
    const handleBack = jest.fn();
    render(
      <VisualiseTable
        showSchedule={false}
        data={baseData}
        handleBackEvent={handleBack}
      />
    );
    const arrow = screen.getByAltText('ArrowRight');
    fireEvent.click(arrow.parentElement!);
    expect(handleBack).toHaveBeenCalled();
  });

  it('calls handleCloseModal when Okay clicked', () => {
    const handleClose = jest.fn();
    render(
      <VisualiseTable
        showSchedule={false}
        data={baseData}
        handleCloseModal={handleClose}
      />
    );
    fireEvent.click(screen.getByText('Okay'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('applies extra props className correctly', () => {
    const { container } = render(
      <VisualiseTable
        showSchedule={false}
        data={baseData}
        className="my-class"
      />
    );
    expect(container.firstChild).toHaveClass('extra-my-class');
  });

  it('renders no rows when data.rows is empty or not array', () => {
    const emptyData = { ...baseData, rows: [] };
    const { container } = render(
      <VisualiseTable showSchedule={false} data={emptyData} />
    );
    // tbody should be empty
    const tbody = container.querySelector('tbody');
    expect(tbody).toBeEmptyDOMElement();
  });
});
