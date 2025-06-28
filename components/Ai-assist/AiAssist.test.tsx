import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AiAssist from './AiAssist';
import { useAppSelector } from '../../redux/slices/hooks';
import * as api from './api';
import * as strapiAPI from '../../api/strapi';

jest.mock('./DealAssist/Dealassist', () => {
  const MockDealAssist = ({ setShowAiPopup }) => (
    <div data-testid="dealassist" onClick={() => setShowAiPopup(true)}>
      Dealassist Mock
    </div>
  );
  MockDealAssist.displayName = 'MockDealAssist';
  return MockDealAssist;
});

jest.mock('./AiAssist/AiAssistPopup', () => {
  const MockAiAssistPopup = (props) => (
    <div data-testid="aiassist-popup">
      <button onClick={() => props.onSendMessage('test query')}>Send</button>
      <button onClick={props.onClose}>Close</button>
      {props.aiResponse && <p>{props.aiResponse}</p>}
    </div>
  );
  MockAiAssistPopup.displayName = 'MockAiAssistPopup';
  return MockAiAssistPopup;
});

jest.mock(
  './FeedbackPopup/FeedbackPopup',
  () => {
    const FeedbackPopup = (props) =>
      props.isOpen ? (
        <div data-testid="feedback-popup" onClick={props.onClose}>
          Feedback Popup
        </div>
      ) : null;
    FeedbackPopup.displayName = 'FeedbackPopup';
    return FeedbackPopup;
  }
);

jest.mock('../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('./api', () => ({
  fetchAIResponse: jest.fn(),
}));

jest.mock('../../api/strapi', () => ({
  fetchAPI: jest.fn(),
}));

jest.mock('../../utils/asset', () => ({
  assetStatus: jest.fn(() => 'active'),
}));

describe('AiAssist Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useAppSelector as jest.Mock).mockImplementation((cb) =>
      cb({
        assets: { selectedAsset: { assetID: 123 } },
        user: { userData: { userID: 'user123' } },
      })
    );

    (strapiAPI.fetchAPI as jest.Mock).mockResolvedValue({
      data: [
        {
          attributes: {
            pageData: [
              {
                objectData: {
                  aiAssistUserIds: ['user123'],
                },
              },
            ],
          },
        },
      ],
    });
  });

  it('renders Dealassist if asset is active and user is allowed', async () => {
    render(<AiAssist />);
    await waitFor(() =>
      expect(screen.getByTestId('dealassist')).toBeInTheDocument()
    );
  });

  it('opens AiAssistPopup on Dealassist click', async () => {
    render(<AiAssist />);
    const dealassist = await screen.findByTestId('dealassist');
    fireEvent.click(dealassist);
    await waitFor(() =>
      expect(screen.getByTestId('aiassist-popup')).toBeInTheDocument()
    );
  });

  it('handles AI response on message send', async () => {
    (api.fetchAIResponse as jest.Mock).mockResolvedValue({
      response: 'AI says hello',
    });
    render(<AiAssist />);
    fireEvent.click(await screen.findByTestId('dealassist'));
    fireEvent.click(screen.getByText('Send'));
    await waitFor(() =>
      expect(screen.getByText('AI says hello')).toBeInTheDocument()
    );
  });

  it('handles empty API response', async () => {
    (api.fetchAIResponse as jest.Mock).mockResolvedValue(null);
    render(<AiAssist />);
    fireEvent.click(await screen.findByTestId('dealassist'));
    fireEvent.click(screen.getByText('Send'));
    await waitFor(() =>
      expect(screen.getByText('No response from AI')).toBeInTheDocument()
    );
  });

  it('handles API error', async () => {
    (api.fetchAIResponse as jest.Mock).mockRejectedValue(
      new Error('API failed')
    );
    render(<AiAssist />);
    fireEvent.click(await screen.findByTestId('dealassist'));
    fireEvent.click(screen.getByText('Send'));
    await waitFor(() =>
      expect(
        screen.getByText('Failed to retrieve AI response.')
      ).toBeInTheDocument()
    );
  });

  it('displays FeedbackPopup on close', async () => {
    render(<AiAssist />);
    fireEvent.click(await screen.findByTestId('dealassist'));
    fireEvent.click(screen.getByText('Close'));
    await waitFor(() =>
      expect(screen.getByTestId('feedback-popup')).toBeInTheDocument()
    );
  });

  it('handles abort and reset', async () => {
    (api.fetchAIResponse as jest.Mock).mockImplementation((_, __, signal) => {
      const err = new Error('AbortError');
      (err as any).name = 'AbortError';
      return Promise.reject(err);
    });

    render(<AiAssist />);
    fireEvent.click(await screen.findByTestId('dealassist'));
    fireEvent.click(screen.getByText('Send'));
    await waitFor(() =>
      expect(screen.getByText('Request was aborted')).toBeInTheDocument()
    );
  });
});
