import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import ActionMenu from './index';

const openMenu = () => {
  const verticalDots = screen.getByAltText('vertical-dots');
  fireEvent.click(verticalDots);
};

jest.mock('../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));

jest.mock('../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(),
}));

describe('ActionMenu Component', () => {
  test('when type is "transactions", only "More Info" menu item is displayed', async () => {
    render(<ActionMenu type="transactions" />);

    openMenu();

    await waitFor(() => {
      expect(screen.getByText('More Info')).toBeInTheDocument();
    });

    expect(screen.queryByText('Sell Units')).not.toBeInTheDocument();
  });

  test('when type is not "transactions", all menu items are displayed', async () => {
    render(<ActionMenu type="other" />);
    openMenu();

    await waitFor(() => {
      expect(screen.getByText('More Info')).toBeInTheDocument();
      expect(
        screen.getByText('Sell Units', { exact: false })
      ).toBeInTheDocument();
    });
  });

  test('clicking "More Info" menu item opens the MoreInfo modal', async () => {
    render(<ActionMenu type="transactions" />);

    openMenu();

    const moreInfoOption = screen.getByText('More Info');
    fireEvent.click(moreInfoOption);
    await waitFor(() => {
      expect(screen.getByText('More Info')).toBeInTheDocument();
    });
  });

  test('clicking "Sell Units" opens the SellOrder modal when type is not "transactions"', async () => {
    render(<ActionMenu type="other" />);
    const menuTrigger = screen.getByAltText('vertical-dots');
    fireEvent.click(menuTrigger);
  });
});
