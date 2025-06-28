import { render, screen, fireEvent } from '@testing-library/react';
import InvestmentDetails from './InvestmentDetails';
import * as customHooks from '../../utils/customHooks/useMediaQuery';
import { WHY_POST_TAX_DETAILS } from '../../utils/feeStructure';
import { numberToCurrency } from '../../utils/number';
import React from 'react';

jest.mock('@mui/material/CircularProgress', () => {
  const CircularProgress = () => <div>Loading...</div>;
  CircularProgress.displayName = 'CircularProgress';
  return CircularProgress;
});
jest.mock('../primitives/TooltipCompoent/TooltipCompoent', () => {
  const TooltipComponent = ({ children }: any) => <div>{children}</div>;
  TooltipComponent.displayName = 'TooltipComponent';
  return TooltipComponent;
});
jest.mock('../common/Popup', () => {
  const Popup = ({ heading, data, handleOnSubmit }: any) => (
    <div>
      <div>{heading}</div>
      <div>{data}</div>
      <button onClick={handleOnSubmit}>Close Popup</button>
    </div>
  );
  Popup.displayName = 'Popup';
  return Popup;
});
jest.mock('../assetsList/AssetInfo', () => {
  const AssetInfo = () => <div>AssetInfo Component</div>;
  AssetInfo.displayName = 'AssetInfo';
  return AssetInfo;
});

describe('InvestmentDetails Component', () => {
  const mockProps = {
    asset: {
      spv: { spvLogo: 'https://logo.png' },
      fundingDetails: { fundingRound: 'Series A' },
      financeProductType: 'Startup Equity',
    },
    feeDetails: [
      {
        id: 'fee1',
        label: 'Management Fee',
        feeValue: 2,
        suffix: '%',
        value: 1000,
        tooltip: 'Management fee tooltip',
        labelTooltip: 'This is a label tooltip',
      },
    ],
    amount: 10000,
  };

  beforeEach(() => {
    jest.spyOn(customHooks, 'useMediaQuery').mockReturnValue(false);
  });

  it('renders all core sections on desktop', () => {
    render(<InvestmentDetails {...mockProps} />);
    expect(screen.getByText('AssetInfo Component')).toBeInTheDocument();
    expect(screen.getByText('Funding Round')).toBeInTheDocument();
    expect(screen.getByText('Series A')).toBeInTheDocument();
    expect(screen.getByText('Management Fee (2%)')).toBeInTheDocument();
    expect(screen.getByText('₹ 1,000')).toBeInTheDocument();
    expect(screen.getByText('Total Payable')).toBeInTheDocument();
    expect(screen.getByText(`₹ ${numberToCurrency(1000)}`)).toBeInTheDocument();
  });

  it('shows AIF Partner logo when available', () => {
    render(<InvestmentDetails {...mockProps} />);
    expect(screen.getByAltText('spvLogo')).toHaveAttribute('src', mockProps.asset.spv.spvLogo);
  });

  it('shows CircularProgress when spvLogo is missing', () => {
    const propsWithNoLogo = {
      ...mockProps,
      asset: { ...mockProps.asset, spv: {} },
    };
    render(<InvestmentDetails {...propsWithNoLogo} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('does not show funding round section if not startup equity', () => {
    const propsNonStartup = {
      ...mockProps,
      asset: {
        ...mockProps.asset,
        financeProductType: 'Bond',
        fundingDetails: {},
      },
    };
    render(<InvestmentDetails {...propsNonStartup} />);
    expect(screen.queryByText('Funding Round')).not.toBeInTheDocument();
  });

it('shows and closes the post-tax popup', () => {
  jest.spyOn(React, 'useState').mockImplementationOnce(() => [true, jest.fn()]);
  render(<InvestmentDetails {...mockProps} />);
  
  expect(screen.getByText(WHY_POST_TAX_DETAILS.WHY_POST_TAX_HEADING)).toBeInTheDocument();
  
  expect(
    screen.getByText(/Grip creates a LLP on behalf of investors/i)
  ).toBeInTheDocument();
});

  it('renders correctly in mobile view', () => {
    jest.spyOn(customHooks, 'useMediaQuery').mockReturnValue(true);
    render(<InvestmentDetails {...mockProps} />);
    expect(screen.getByText('AssetInfo Component')).toBeInTheDocument();
    expect(screen.getByAltText('spvLogo')).toBeInTheDocument(); // AIF
  });
});


describe('InvestmentDetails Component - Internal State Change', () => {
  const mockProps = {
    amount: 10000,
    asset: {
      spv: {
        spvLogo: 'https://logo.png',
      },
      fundingDetails: {
        fundingRound: 'Series A',
      },
    },
    feeDetails: [
      {
        id: '1',
        label: 'Management Fee',
        feeValue: 2,
        suffix: '%',
        value: 1000,
      },
      {
        id: '2',
        label: 'Platform Fee',
        feeValue: 0, //Triger the feeValue to 0
        suffix: '%',
        value: 10000,
      },
    ],
  };

  it('renders and closes the post-tax popup via handleOnSubmit and onCloseModal', () => {
    render(<InvestmentDetails {...mockProps} />);
    const setStateMock = jest.fn();
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => [true, setStateMock]);

    render(<InvestmentDetails {...mockProps} />);

    expect(
      screen.getByText(WHY_POST_TAX_DETAILS.WHY_POST_TAX_HEADING)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Close Popup/i));
    expect(setStateMock).toHaveBeenCalledWith(false);

    const submitButton = screen.getByRole('button', { name: /Close Popup/i });
    fireEvent.click(submitButton);
    expect(setStateMock).toHaveBeenCalledWith(false);
  });

  it('formats fee label correctly when feeValue is 0', () => {
  render(<InvestmentDetails {...mockProps} />);
  expect(screen.getByText(/Management Fee \(2%\)/)).toBeInTheDocument();
  expect(screen.getByText(/Platform Fee \(0.00%\)/)).toBeInTheDocument();
});
});
