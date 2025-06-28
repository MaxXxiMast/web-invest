import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterCard from './index';
import * as hooks from '../../../../redux/slices/hooks';
import * as utils from '../utils';
import { useRouter } from 'next/router';

jest.mock('../FilterCardUI', () => ({
  __esModule: true,
  default: jest.fn(({ heading, subHeading, buttons }) => (
    <div>
      <h1>{heading}</h1>
      <p>{subHeading}</p>
      {buttons.map((btn: any, index: number) => (
        <button key={index} onClick={btn.onClick}>
          {btn.label}
        </button>
      ))}
    </div>
  )),
}));

jest.mock('../../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../utils', () => ({
  getProductTypeFromTitle: jest.fn(),
}));

describe('FilterCard Component', () => {
  const mockDispatch = jest.fn();
  const pushMock = jest.fn();

  beforeEach(() => {
    (hooks.useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useRouter as jest.Mock).mockReturnValue({
      pathname: '/assets',
      query: {},
      push: pushMock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct heading for non-SDI productType', () => {
    (utils.getProductTypeFromTitle as jest.Mock).mockReturnValue('Bond');
    (hooks.useAppSelector as jest.Mock).mockReturnValue([
      { financeProductType: 'Bond' },
      { financeProductType: 'Bond' },
      { financeProductType: 'FD' },
    ]);

    render(
      <FilterCard
        productTypeTitle="Bond"
        totalAssetsLen={10}
        filteredAssetsLen={2}
      />
    );

    expect(
      screen.getByText('2 of 10 Bond match your filters!')
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Try adjusting filters to discover more investment opportunities'
      )
    ).toBeInTheDocument();

    expect(screen.getByText('Reset Filter')).toBeInTheDocument();
    expect(screen.getByText('Change Filter')).toBeInTheDocument();
  });

  it('renders with "Filter(s) Applied" for SDI Secondary', () => {
    (utils.getProductTypeFromTitle as jest.Mock).mockReturnValue(
      'SDI Secondary'
    );
    (hooks.useAppSelector as jest.Mock).mockReturnValue([
      { financeProductType: 'SDI Secondary' },
    ]);

    render(
      <FilterCard
        productTypeTitle="SDI"
        totalAssetsLen={5}
        filteredAssetsLen={3}
      />
    );

    expect(screen.getByText('Filter(s) Applied')).toBeInTheDocument();
  });

  it('clicking Reset Filter dispatches reset and pushes router', () => {
    (utils.getProductTypeFromTitle as jest.Mock).mockReturnValue('Bond');
    (hooks.useAppSelector as jest.Mock).mockReturnValue([
      { financeProductType: 'Bond' },
    ]);

    render(
      <FilterCard
        productTypeTitle="Bond"
        totalAssetsLen={3}
        filteredAssetsLen={1}
      />
    );

    fireEvent.click(screen.getByText('Reset Filter'));

    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
    expect(pushMock).toHaveBeenCalledWith(
      {
        pathname: '/assets',
        query: {},
      },
      '/assets#active#bond',
      { shallow: true }
    );
  });

  it('clicking Change Filter dispatches setShowFilterModal(true)', () => {
    (utils.getProductTypeFromTitle as jest.Mock).mockReturnValue('FD');
    (hooks.useAppSelector as jest.Mock).mockReturnValue([
      { financeProductType: 'FD' },
    ]);

    render(
      <FilterCard
        productTypeTitle="FD"
        totalAssetsLen={1}
        filteredAssetsLen={1}
      />
    );

    fireEvent.click(screen.getByText('Change Filter'));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'assetFilters/setShowFilterModal',
      payload: true,
    });
  });
});
