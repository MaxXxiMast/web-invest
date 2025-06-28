import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useRouter } from 'next/router';
import CommentBox from '.';
import { handleKycStatus } from '../../../api/rfqKyc';
import { delay } from '../../../utils/timer';
import { isGCOrder } from '../../../utils/gripConnect';
import { trackEvent } from '../../../utils/gtm';
import { handleRedirection } from '../utils';
import { configureStore } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { act } from 'react-dom/test-utils';

// Mocks
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('../../../api/rfqKyc', () => ({
  handleKycStatus: jest.fn(),
}));
jest.mock('../../../utils/timer', () => ({
  delay: jest.fn(),
}));
jest.mock('../../../utils/gripConnect', () => ({
  isGCOrder: jest.fn(),
}));
jest.mock('../../../utils/gtm', () => ({
  trackEvent: jest.fn(),
}));
jest.mock('../utils', () => ({
  handleRedirection: jest.fn(),
  sortingEntryBannerArr: jest.fn((arr) => arr),
}));
jest.mock('../CommentBoxForm', () => {
  return function DummyCommentBoxForm({ onSuccessSubmit }) {
    return (
      <div data-testid="comment-box-form">
        <button
          data-testid="submit-button"
          onClick={() =>
            onSuccessSubmit({ comment: 'Test comment', type: 'address' })
          }
        >
          Submit
        </button>
      </div>
    );
  };
});
jest.mock('../../primitives/MaterialModalPopup', () => {
  return function DummyMaterialModalPopup({
    children,
    showModal,
    handleModalClose,
  }) {
    return showModal ? (
      <div data-testid="material-modal">
        {children}
        <button data-testid="close-button" onClick={handleModalClose}>
          Close
        </button>
      </div>
    ) : null;
  };
});
jest.mock('../../user-kyc/common/GenericModal', () => {
  return function DummyGenericModal({ showModal, handleBtnClick }) {
    return showModal ? (
      <div data-testid="success-modal">
        <button data-testid="ok-button" onClick={handleBtnClick}>
          Okay
        </button>
      </div>
    ) : null;
  };
});
jest.mock('../../primitives/PoweredByGrip', () => {
  return function DummyPoweredByGrip() {
    return <div data-testid="powered-by-grip">Powered by Grip</div>;
  };
});
jest.mock('@mui/material/Skeleton', () => {
  return function DummySkeleton() {
    return <div data-testid="skeleton">Loading...</div>;
  };
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: {
      userID: 'test-user-123',
    },
  },
  reducers: {},
});

const gcConfigSlice = createSlice({
  name: 'gcConfig',
  initialState: {
    gcData: {
      gcCallbackUrl: '/callback-url',
    },
  },
  reducers: {},
});

const rfqSlice = createSlice({
  name: 'rfq',
  initialState: {
    openCommentBox: true,
  },
  reducers: {
    setOpenCommentBox: (state, action) => {
      state.openCommentBox = action.payload;
    },
  },
});

const configureTestStore = () => {
  return configureStore({
    reducer: {
      user: userSlice.reducer,
      gcConfig: gcConfigSlice.reducer,
      rfq: rfqSlice.reducer,
    },
  });
};

describe('CommentBox Component', () => {
  const mockPush = jest.fn();
  let store;

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      pathname: '/example-path',
    });

    (delay as jest.Mock).mockResolvedValue(undefined);
    store = configureTestStore();
  });

  it('should render loading state initially', async () => {
    (handleKycStatus as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(
      <Provider store={store}>
        <CommentBox />
      </Provider>
    );

    expect(screen.getByText('Need help with KYC?')).toBeInTheDocument();
    expect(screen.getAllByTestId('skeleton')).toHaveLength(4);
  });

  it('should fetch KYC data and set type correctly', async () => {
    const mockKycData = {
      kycTypes: [
        { name: 'address', status: 0 },
        { name: 'pan', status: 1 },
      ],
    };

    (handleKycStatus as jest.Mock).mockResolvedValue(mockKycData);

    await act(async () => {
      render(
        <Provider store={store}>
          <CommentBox />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(handleKycStatus).toHaveBeenCalled();
      expect(screen.getByTestId('comment-box-form')).toBeInTheDocument();
    });
  });

  it('should handle form submission correctly for non-GC orders', async () => {
    (handleKycStatus as jest.Mock).mockResolvedValue({
      kycTypes: [{ name: 'address', status: 0 }],
    });

    (isGCOrder as jest.Mock).mockReturnValue(false);

    await act(async () => {
      render(
        <Provider store={store}>
          <CommentBox />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('comment-box-form')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('submit-button'));

    expect(screen.getByTestId('success-modal')).toBeInTheDocument();

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should show "Powered by Grip" for GC orders', async () => {
    (handleKycStatus as jest.Mock).mockResolvedValue({
      kycTypes: [{ name: 'address', status: 0 }],
    });

    (isGCOrder as jest.Mock).mockReturnValue(true);

    await act(async () => {
      render(
        <Provider store={store}>
          <CommentBox />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('powered-by-grip')).toBeInTheDocument();
    });
  });

  it('should not show "Powered by Grip" for non-GC orders', async () => {
    (handleKycStatus as jest.Mock).mockResolvedValue({
      kycTypes: [{ name: 'address', status: 0 }],
    });

    (isGCOrder as jest.Mock).mockReturnValue(false);

    await act(async () => {
      render(
        <Provider store={store}>
          <CommentBox />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.queryByTestId('powered-by-grip')).not.toBeInTheDocument();
    });
  });

  it('should handle success modal close button with tracking', async () => {
    (handleKycStatus as jest.Mock).mockResolvedValue({
      kycTypes: [{ name: 'address', status: 0 }],
    });

    (isGCOrder as jest.Mock).mockReturnValue(false);

    await act(async () => {
      render(
        <Provider store={store}>
          <CommentBox />
        </Provider>
      );
    });


    fireEvent.click(screen.getByTestId('submit-button'));

    fireEvent.click(screen.getByTestId('ok-button'));

    expect(trackEvent).toHaveBeenCalledWith(
      'KYC_HELP_CLOSE',
      expect.objectContaining({
        cta_clicked: 'Okay',
        userID: 'test-user-123',
      })
    );

    await waitFor(() => {
      expect(delay).toHaveBeenCalledWith(500);
    });
  });


  it('should set default type to "address" when no KYC status with status 0 is found', async () => {
    (handleKycStatus as jest.Mock).mockResolvedValue({
      kycTypes: [
        { name: 'address', status: 1 },
        { name: 'pan', status: 1 },
      ],
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <CommentBox />
        </Provider>
      );
    });

    // Form should be rendered with default type
    await waitFor(() => {
      expect(screen.getByTestId('comment-box-form')).toBeInTheDocument();
    });
  });

  it('should redirect from user-kyc page after success modal close', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      pathname: '/user-kyc',
    });

    (handleKycStatus as jest.Mock).mockResolvedValue({
      kycTypes: [{ name: 'address', status: 0 }],
    });

    (isGCOrder as jest.Mock).mockReturnValue(false);
    (handleRedirection as jest.Mock).mockReturnValue('/redirected-url');

    await act(async () => {
      render(
        <Provider store={store}>
          <CommentBox />
        </Provider>
      );
    });

    fireEvent.click(screen.getByTestId('submit-button'));
    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(delay).toHaveBeenCalledWith(500);
    });
    expect(mockPush).toHaveBeenCalledWith('/redirected-url');
  });
});
