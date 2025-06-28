import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RMCard from './index';
import { useAppDispatch, useAppSelector } from '../../../redux/slices/hooks';
import { fetchLeadOwnerDetails } from '../../../api/user';
import * as calendlyUtils from '../../../utils/ThirdParty/calendly';
import {
  removeCalendlyScript,
} from '../../../utils/ThirdParty/calendly';

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/test-path',
  }),
}));

jest.mock('../../../redux/slices/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('../../../api/user', () => ({
  fetchLeadOwnerDetails: jest.fn(),
}));

jest.mock('../../../utils/gtm', () => ({
  trackEvent: jest.fn(),
}));

jest.mock('../../../utils/ThirdParty/calendly', () => ({
  importCalendlyScript: jest.fn(() => Promise.resolve()),
  removeCalendlyScript: jest.fn(),
}));

jest.mock('../../../utils/customHooks/useCopyToClipBoard', () => ({
  copy: jest.fn(),
}));

Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn(),
});

describe('RMCard Component', () => {

  const mockLeadOwner = {
    firstName: 'Rohit',
    lastName: 'Jain',
    mobileNo: '1234567890',
    email: 'rohit.jain@gripinvest.in',
    imageUrl: '/path/to/image.jpg',
    designation: 'Relationship Manager',
    yoe: 5,
    investments: 10,
  };

  const mockUserData = {
    firstName: 'Rajesh',
    lastName: 'Naik',
    emailID: 'rajesh.naik@gripinvest.in',
    userID: 'GRIP28022005',
  };

  const mockUccStatus = {
    status: 'active',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.open = jest.fn();
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn());
    (useAppSelector as jest.Mock).mockImplementation((selectorFn) =>
      selectorFn({
        portfolioSummary: {
          leadOwner: {
            firstName: 'Rohit',
            lastName: 'Jain',
            mobileNo: '9016380385',
            email: 'rohit.jain@gripinvest.in',
            imageUrl: '/image.png',
            designation: 'RM',
            yoe: 2,
            investments: 5,
          },
        },
        user: {
          userData: {},
          uccStatus: { NSE: { status: 'active' } },
        },
      })
    );
  });

  it('load the skeleton when data is loading', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector.name === 'portfolioSummary') {
        return { leadOwner: null };
      }
      return {};
    });

    render(<RMCard />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('renders profile view when isProfile is true', () => {
    
    (useAppSelector as jest.Mock).mockImplementation((selectorFn) => {
      return selectorFn({
        portfolioSummary: { leadOwner: mockLeadOwner },
        user: {
          userData: mockUserData,
          uccStatus: { NSE: mockUccStatus },
        },
      });
    });
  
    render(<RMCard isProfile={true} />);
  
    expect(screen.getByText(/your relationship manager/i)).toBeInTheDocument();
    expect(screen.getByText(/start a chat/i)).toBeInTheDocument();
  });


  it('Renders the leadOwner details Properly', async () => {
    (fetchLeadOwnerDetails as jest.Mock).mockResolvedValue(mockLeadOwner);

    render(<RMCard />);

    const headingElements = await screen.findAllByText('YOUR RELATIONSHIP MANAGER');
    expect(headingElements.length).toBeGreaterThanOrEqual(1);
    
  });

  it('renders Start a Chat button after loading', async () => {
    render(<RMCard />);
    const button = await screen.findByText(/Start a Chat/i);
    expect(button).toBeInTheDocument();
  });

  it('removes Calendly script on unmount', () => {
    const { unmount } = render(<RMCard />);
    unmount();
    expect(removeCalendlyScript).toHaveBeenCalled();
  });

  it('opens WhatsApp chat link in new tab when Start a Chat is clicked', async () => {
    render(<RMCard />);
  
    const chatButton = await screen.findByText(/Start a Chat/i);
    expect(chatButton).toBeInTheDocument();
  
    fireEvent.click(chatButton);
  
    expect(window.open).toHaveBeenCalledWith(
      'https://api.whatsapp.com/send?phone=919016380385',
      '_blank','noopener'
    );
  });

  it('opens Contact Details Properly when clicking chat button', async () => {
    render(<RMCard />);
  
    const chatButton = await screen.findByText(/Contact Details/i);
    expect(chatButton).toBeInTheDocument();
  
    fireEvent.click(chatButton);
    const ScheduleCall = await screen.findByText(/Schedule a Call/i);
    expect(ScheduleCall).toBeInTheDocument();
  
  });

  it('calls fetchLeadOwnerDetails if leadOwner is missing', () => {
    (useAppSelector as jest.Mock).mockReturnValueOnce({
      portfolioSummary: { leadOwner: null },
      user: { userData: { userId: '123' } },
    });
  
    render(<RMCard isProfile={true} />);
    expect(fetchLeadOwnerDetails).toHaveBeenCalled();
  });

  it('renders non-profile view when isProfile is false', () => {
    render(<RMCard isProfile={false} />);
    expect(screen.getByText(/contact details/i)).toBeInTheDocument(); // or any non-profile content
  });

  it('renders lead Owner Name', () => {
    render(<RMCard isProfile={true} />);
    expect(screen.getByText(/Rohit Jain/i)).toBeInTheDocument();
  });

  it('logs error if Calendly script fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    jest
      .spyOn(calendlyUtils, 'importCalendlyScript')
      .mockRejectedValueOnce(new Error('Script failed'));

    render(
        <RMCard />
    );

    await waitFor(() =>
      expect(screen.getByText('Schedule a Call')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText('Schedule a Call'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load Calendly script:',
        expect.any(Error)
      );
    });
  });

});
  
