import React from 'react';
import { render, screen } from '@testing-library/react';
import InvestementNumberCard from './InvestementNumberCard';
import { fetchAPI } from '../../../api/strapi';

//Mocks
jest.mock('../../../api/strapi', () => ({
  fetchAPI: jest.fn(),
}));
jest.mock('../../primitives/Image', () => {
    const MockImage = (props) => {
      // eslint-disable-next-line @next/next/no-img-element
      return <img {...props} alt={props.alternativeText || props.alt || 'mocked-image'} />;
    };
    MockImage.displayName = 'MockImage';
    return MockImage;
  });
  
describe('InvestementNumberCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('TC1: should render InvestementNumberCard Properly', () => {
    render(<InvestementNumberCard transparencyData={{ name: 'Transparency', subLabel: 'Info' }} />);
    expect(screen.getByText('Transparency')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('TC2: should apply className when passed', () => {
    const { container } = render(
      <InvestementNumberCard className="custom-class" transparencyData={{}} />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('TC3: totalInvestment Amount needs to Render Properly', async () => {
    (fetchAPI as jest.Mock).mockResolvedValueOnce({ totalInvestmentAmount: 2500000 });

    render(<InvestementNumberCard transparencyData={{}} />);
    expect(await screen.findByText(/25\s*Lakhs/)).toBeInTheDocument();
  });

  it('TC4: should not crash if transparencyData is undefined', () => {
    const { container } = render(<InvestementNumberCard  transparencyData={undefined}/>);
    expect(container.querySelector('.InvestementNumberCard')).toBeInTheDocument();
  });

  it('TC5: should render PlaneIcon with alt text', () => {
    render(<InvestementNumberCard transparencyData={{}} />);
    expect(screen.getByAltText('PlaneIcon')).toBeInTheDocument();
  });
});
