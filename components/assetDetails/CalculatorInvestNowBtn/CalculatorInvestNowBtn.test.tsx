import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CalculatorInvestNowBtn from '../CalculatorInvestNowBtn';
import * as reduxHooks from '../../../redux/slices/hooks';
import * as gtm from '../../../utils/gtm';
import * as numberUtils from '../../../utils/number';
import * as investmentUtils from '../../../utils/investment';
import * as assetUtils from '../../../utils/asset';
import * as kycUtils from '../../../utils/discovery';
import * as strapi from '../../../api/strapi';

// Mock styles
jest.mock('../CalculatorInvestNowBtn.module.css', () => ({
  NotifyMeButtonExperiment: 'mockNotifyMeButtonExperiment',
  BtnNoMessage: 'mockBtnNoMessage',
  BtnMessage: 'mockBtnMessage',
  StatusWidget: 'mockStatusWidget',
}));

// Mock NotifyMeButton
jest.mock('../NotifyMeButton', () => ({
  __esModule: true,
  default: ({ handleSubmitClick, disabled }: any) => (
    <button onClick={() => handleSubmitClick(false)} disabled={disabled}>
      Invest Now
    </button>
  ),
}));

describe('CalculatorInvestNowBtn', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useAppSelector
    jest.spyOn(reduxHooks, 'useAppSelector').mockImplementation((cb: any) =>
      cb({
        monthlyCard: {
          singleLotCalculation: {
            investmentAmount: 1000,
            stampDuty: 10,
            maxInvestment: 20000,
            preTaxReturns: 100,
            minLots: 1,
          },
          units: 1,
          disableBondsInvestBtn: false,
          notifyMeButtonStatus: {
            message: '',
          },
        },
        user: {
          uccStatus: {
            NSE: { status: 'active' },
          },
          kycConfigStatus: {
            default: {
              isFilteredKYCComplete: true,
            },
          },
        },
        assets: {
          selectedAsset: {
            isRfq: true,
            preTaxTotalMaxAmount: 10000,
            collectedAmount: 5000,
            irr: '8%',
            desc: 'Bond description',
            partnerLogo: 'logo.png',
            productCategory: 'Bonds',
            productSubcategory: 'Corporate',
            financeProductType: 'Fixed Income',
            maturityDate: '2025-05-09',
          },
        },
      })
    );

    // Mock helpers
    jest.spyOn(investmentUtils, 'getTotalAmountPaybale').mockReturnValue(1000);
    jest
      .spyOn(numberUtils, 'numberToIndianCurrencyWithDecimals')
      .mockReturnValue('₹10,000.00');
    jest
      .spyOn(numberUtils, 'toCurrecyStringWithDecimals')
      .mockReturnValue('10,000');
    jest.spyOn(assetUtils, 'getMaturityDate').mockReturnValue(new Date());
    jest.spyOn(assetUtils, 'getMaturityMonths').mockReturnValue(12);
    jest
      .spyOn(kycUtils, 'getOverallDefaultKycStatus')
      .mockReturnValue('verified');
    jest.spyOn(strapi, 'callErrorToast').mockImplementation(jest.fn());
    jest.spyOn(gtm, 'trackEvent').mockImplementation(jest.fn());
  });

  it('renders and button is enabled', () => {
    render(
      <CalculatorInvestNowBtn
        handleKycContinue={jest.fn()}
        handleInvestNowBtnClick={jest.fn()}
      />
    );
    const button = screen.getByRole('button', { name: /Invest Now/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  it('calls trackEvent and handleInvestNowBtnClick when clicked (happy path)', () => {
    const handleInvestNowBtnClick = jest.fn();

    render(
      <CalculatorInvestNowBtn
        handleKycContinue={jest.fn()}
        handleInvestNowBtnClick={handleInvestNowBtnClick}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Invest Now/i }));

    expect(gtm.trackEvent).toHaveBeenCalledWith(
      'Invest Now Button Clicked',
      expect.objectContaining({
        investment_amount: 1000,
        total_returns: '₹10,000.00',
        ['quantities selected']: 1,
        amo: false,
      })
    );

    expect(handleInvestNowBtnClick).toHaveBeenCalledWith(false);
  });

  it('shows error toast if investment > pending amount', () => {
    // Pending = 10000 - 5000 = 5000
    jest.spyOn(investmentUtils, 'getTotalAmountPaybale').mockReturnValue(6000); // over the pending amount

    render(
      <CalculatorInvestNowBtn
        handleKycContinue={jest.fn()}
        handleInvestNowBtnClick={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Invest Now/i }));

    expect(strapi.callErrorToast).toHaveBeenCalledWith(
      'You can not invest more than ₹10,000'
    );
  });

  it('disables button when lot size < minLots', () => {
    // mock lot size to be less
    jest.spyOn(reduxHooks, 'useAppSelector').mockImplementation((cb: any) =>
      cb({
        monthlyCard: {
          singleLotCalculation: {
            investmentAmount: 1000,
            stampDuty: 10,
            maxInvestment: 20000,
            preTaxReturns: 100,
            minLots: 2,
          },
          units: 1, // less than minLots
          disableBondsInvestBtn: false,
          notifyMeButtonStatus: {
            message: '',
          },
        },
        user: {
          uccStatus: {
            NSE: { status: 'active' },
          },
          kycConfigStatus: {
            default: {
              isFilteredKYCComplete: true,
            },
          },
        },
        assets: { selectedAsset: {} },
      })
    );

    render(
      <CalculatorInvestNowBtn
        handleKycContinue={jest.fn()}
        handleInvestNowBtnClick={jest.fn()}
      />
    );

    const button = screen.getByRole('button', { name: /Invest Now/i });
    expect(button).toBeDisabled();
  });
});
