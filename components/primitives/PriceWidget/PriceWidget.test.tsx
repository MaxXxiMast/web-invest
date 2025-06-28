import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PriceWidget from '.';
import { isHideCutOut } from '../AssetCard/utils';

jest.mock('../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(() => ({ selectedAsset: {} })),
}));

jest.mock('../../../utils/string', () => ({
  handleExtraProps: (className: string) => className,
}));

jest.mock('../AssetCard/utils', () => ({
  isHideCutOut: jest.fn(() => false),
}));

describe('PriceWidget Component', () => {
  test('renders original value correctly when campaign is disabled', () => {
    render(<PriceWidget originalValue="$100" cutoutValue="$80" />);
    const originalValueElement = screen.getByText('$100');
    expect(originalValueElement).toBeInTheDocument();
  });

  test('renders cutout value when campaign is enabled', () => {
    render(
      <PriceWidget originalValue="$100" cutoutValue="$80" isCampaignEnabled />
    );
    const cutoutValueElement = screen.getByText('$80');
    expect(cutoutValueElement).toBeInTheDocument();
  });

  test('hides cutout value when shouldHideCutOut is true and id is returns', () => {
    (isHideCutOut as jest.Mock).mockReturnValueOnce(true);

    render(
      <PriceWidget
        originalValue="$100"
        cutoutValue="$80"
        isCampaignEnabled
        id="returns"
      />
    );

    expect(screen.queryByText('$80')).toBeNull();
  });

  test('renders arrow when campaign is enabled and isNegative is false', () => {
    render(
      <PriceWidget originalValue="$100" cutoutValue="$80" isCampaignEnabled />
    );
    const arrowElement = screen.getByText((_content, element) =>
      element?.classList.contains('icon-arrow-up')
    );
    expect(arrowElement).toBeInTheDocument();
  });

  test('applies correct styling when isNegative is true', () => {
    render(
      <PriceWidget
        originalValue="$100"
        cutoutValue="$80"
        isCampaignEnabled
        isNegative
      />
    );
    const wrapperElement = screen.getByText((_content, element) =>
      element?.classList.contains('icon-arrow-up')
    )?.parentElement;

    expect(wrapperElement).toHaveClass('NegativeCutOut');
  });
});
