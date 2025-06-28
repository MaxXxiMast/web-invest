import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';
import ZeroState from '.';
import { useAppSelector } from '../../../redux/slices/hooks';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(),
}));

describe('ZeroState Component', () => {
  const push = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders title and "Proceed to KYC" when KYC is pending', () => {
    (useAppSelector as jest.Mock).mockReturnValue(false); // isFilteredKYCComplete = false

    render(<ZeroState />);

    expect(
      screen.getByText('Start Your Investment Journey!')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Proceed to KYC/i })
    ).toBeInTheDocument();
  });

  test('navigates to /user-kyc when button is clicked and KYC is pending', () => {
    (useAppSelector as jest.Mock).mockReturnValue(false);

    render(<ZeroState />);

    fireEvent.click(screen.getByRole('button', { name: /Proceed to KYC/i }));
    expect(push).toHaveBeenCalledWith('/user-kyc');
  });

  test('renders title and "Explore Deals" when KYC is complete', () => {
    (useAppSelector as jest.Mock).mockReturnValue(true); // isFilteredKYCComplete = true

    render(<ZeroState />);

    expect(
      screen.getByText('Start Your Investment Journey!')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Explore Deals/i })
    ).toBeInTheDocument();
  });

  test('navigates to /assets when button is clicked and KYC is complete', () => {
    (useAppSelector as jest.Mock).mockReturnValue(true);

    render(<ZeroState />);

    fireEvent.click(screen.getByRole('button', { name: /Explore Deals/i }));
    expect(push).toHaveBeenCalledWith('/assets');
  });
});
