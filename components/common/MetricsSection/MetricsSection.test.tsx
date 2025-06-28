import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MetricsSection from './index';
import { useRouter } from 'next/router';
import { fetchAPI } from '../../../api/strapi';

// Mocks
jest.mock('../../primitives/Image', () => {
  const MockImage = (props: any) => (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...props} alt={props.alt || 'mocked-image'} />
    </>
  );
  MockImage.displayName = 'MockImage';
  return MockImage;
});

jest.mock('../../primitives/Button', () => {
    const Button = ({ onClick, children }: any) => <button onClick={onClick}>{children}</button>;
    Button.displayName = 'MockButton';
    return {
      __esModule: true,
      default: Button,
      ButtonType: {
        Primary: 'primary',
        Secondary: 'secondary',
      },
    };
  });
  
jest.mock('../../../utils/discovery', () => ({
  getMetrics: jest.fn(() => [
    { label: 'Investments', value: '1000+', unit: '', prefix: '₹' },
    { label: 'Users', value: '5000+', unit: '', prefix: '' },
  ]),
  getSectionFromHomePage: jest.fn(() => ({
    keyFigures: {
      figures: [
        { label: 'Investments', value: 1000000 },
        { label: 'Users', value: 5000 },
      ],
    },
  })),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../api/strapi', () => ({
    fetchAPI: jest.fn(),
  }));
  
describe('MetricsSection Component', () => {
  const push = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  it('TC1: should render heading and subheading', async () => {
    render(<MetricsSection />);
    expect(await screen.findByText('Grip at a glance')).toBeInTheDocument();
    expect(screen.getByText(/strengthen trust/i)).toBeInTheDocument();
  });

  it('TC2: should render MetricCards based on metrics data', async () => {
    render(<MetricsSection />);
    await waitFor(() => {
      expect(screen.getByText(/Investments/)).toBeInTheDocument();
      expect(screen.getByText(/Users/)).toBeInTheDocument();
    });
  });

  it('TC3: should call router.push when button is clicked', async () => {
    render(<MetricsSection />);
    const button = await screen.findByRole('button', { name: /view our numbers/i });
    button.click();
    expect(push).toHaveBeenCalledWith('/transparency');
  });

  it('TC4: should render Grip vector image', async () => {
    render(<MetricsSection />);
    const image = await screen.findByAltText('gripvector');
    expect(image).toBeInTheDocument();
  });

  it('TC5: should render container layout structure', async () => {
    const { container } = render(<MetricsSection />);
    expect(await screen.findByText('Grip at a glance')).toBeInTheDocument();
    expect(container.querySelector('.containerNew')).toBeInTheDocument();
  });

  it('TC6: should call fetchAPI and set finalData properly', async () => {
    (fetchAPI as jest.Mock)
      .mockResolvedValueOnce({
        data: {
          heading: 'Grip at a glance',
          subHeading:
            'We aim to strengthen trust among our customers by making our numbers accessible to all',
        },
      }) // homepageResult
      .mockResolvedValueOnce([{ title: 'Metric 1' }, { title: 'Metric 2' }]); // keyMetrics
  
    render(<MetricsSection />);
  
    expect(await screen.findByText('Grip at a glance')).toBeInTheDocument();
    expect(await screen.findByText(/trust among our customers/)).toBeInTheDocument();
  });
  
});
