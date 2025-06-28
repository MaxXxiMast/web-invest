import React from 'react';
import { render, screen } from '@testing-library/react';
import RatingScale from './index';
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';
import { fetchAPI } from '../../../api/strapi';

// Mocks
jest.mock('../../../redux/slices/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));
jest.mock('../../../api/strapi', () => ({
  fetchAPI: jest.fn(),
}));
jest.mock('../../../utils/string', () => ({
  GRIP_INVEST_BUCKET_URL: 'https://test-bucket/',
  handleExtraProps: (val: string) => val,
}));

describe('RatingScale Component', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  it('should return null when no riskLevel or elevationAngle = -1', () => {
    (useAppSelector as jest.Mock).mockReturnValue({});
    const { container } = render(<RatingScale rating="AAA" />);
    expect(container.firstChild).toBeNull();
  });

  it('should fetch rating scale data if store is empty', () => {
    (useAppSelector as jest.Mock).mockReturnValue({});
    render(<RatingScale rating="AAA" />);
    expect(fetchAPI).toHaveBeenCalledWith(
      '/inner-pages-data',
      expect.any(Object)
    );
  });

  it('should render rating with riskLevel and elevationAngle', () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      AAA: {
        riskLevel: 'Low Risk',
        elevationAngle: 30,
      },
    });

    render(<RatingScale rating="AAA" ratedBy="CRISIL" />);
    expect(screen.getByText('CRISIL AAA')).toBeInTheDocument();
    expect(screen.getByText('Low Risk')).toBeInTheDocument();

    const needleImg = screen.getByAltText('needle');
    expect(needleImg).toHaveStyle('transform: rotate(30deg)');
  });

  it('should hide the risk level label if isShowLevel is false', () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      AAA: {
        riskLevel: 'Low Risk',
        elevationAngle: 45,
      },
    });

    render(<RatingScale rating="AAA" isShowLevel={false} />);
    expect(screen.queryByText('Low Risk')).not.toBeInTheDocument();
  });

  it('should apply extra classes to container and rating', () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      AAA: {
        riskLevel: 'Low Risk',
        elevationAngle: 20,
      },
    });

    const { container } = render(
      <RatingScale
        rating="AAA"
        className="custom-rating"
        containerClass="custom-container"
      />
    );

    expect(container.querySelector('.custom-rating')).toBeInTheDocument();
    expect(container.querySelector('.custom-container')).toBeInTheDocument();
  });
  it('should handle ratings with agency prefix like "CRISIL AAA"', () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      AAA: {
        riskLevel: 'Low Risk',
        elevationAngle: 25,
      },
    });

    render(<RatingScale rating="CRISIL AAA" ratedBy="ICRA" />);
    expect(screen.getByText('ICRA CRISIL AAA')).toBeInTheDocument();
  });
});
