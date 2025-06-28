import React from 'react';
import { render } from '@testing-library/react';
import GCExternalUI from './index';
import { useDispatch } from 'react-redux';
import * as reduxHooks from '../../../redux/slices/hooks';
import * as gcSlice from '../../../redux/slices/gc';
import * as userSlice from '../../../redux/slices/user';
import * as gtmUtils from '../../../utils/gtm';
import * as appHelpers from '../../../utils/appHelpers';

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
}));
jest.mock('../../../redux/slices/hooks', () => ({
    useAppSelector: jest.fn(),
}));
jest.mock('../../../redux/slices/gc', () => ({
    getGCCredentials: jest.fn(),
}));
jest.mock('../../../redux/slices/user', () => ({
    fetchUserInfo: jest.fn(),
}));
jest.mock('../../../utils/gtm', () => ({
    newRelicErrLogs: jest.fn(),
    trackEvent: jest.fn(),
}));
jest.mock('../../../utils/appHelpers', () => ({
    postMessageToNativeOrFallback: jest.fn(),
}));

describe('GCExternalUI Component', () => {
    const dispatchMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useDispatch as jest.Mock).mockReturnValue(dispatchMock);
        (reduxHooks.useAppSelector as jest.Mock).mockReturnValue({
            redirectUrlToGc: '/mock-redirect',
        });
        window.sessionStorage.setItem('gcloginIdVal', 'test-token');
    });

    it('should render without crashing', () => {
        const { getByText } = render(<GCExternalUI urlToken="test-token" />);
        expect(getByText(/Your redirect is in progress/i)).toBeInTheDocument();
        expect(getByText(/Please do not hit back or refresh/i)).toBeInTheDocument();
    });

    it('should call tracking and error logs on load', () => {
        render(<GCExternalUI urlToken="test-token" />);
        expect(gtmUtils.newRelicErrLogs).toHaveBeenCalledWith(
            'GC_user_external_page_landing',
            'info',
            expect.objectContaining({ loadUrl: 'test-token' })
        );
        expect(gtmUtils.trackEvent).toHaveBeenCalledWith(
            'GC_user_external_page_landing',
            expect.objectContaining({ loadUrl: 'test-token' })
        );
    });

    it('should handle onSuccessCBAuth and trigger user fetch', () => {
        jest.useFakeTimers();

        const mockUserData = { userID: '123' };
        const mockData = {
            redirectUrl: '/assets/123',
            userData: mockUserData,
        };

        // Mock fetchUserInfo to call the success callback
        (userSlice.fetchUserInfo as jest.Mock).mockImplementation(
            (_userId, successCb) => {
                successCb({ name: 'Test User', userID: '123' });
                return jest.fn(); // To satisfy dispatch call
            }
        );

        render(<GCExternalUI urlToken="another-token" />);
        const onSuccess = (gcSlice.getGCCredentials as jest.Mock).mock.calls[0][1];

        onSuccess(mockData);

        jest.runAllTimers();

        expect(gtmUtils.trackEvent).toHaveBeenCalledWith(
            'GC_user_success_redirect_to_page',
            expect.objectContaining({
                redirectUrl: '/assets/123',
                userID: '123',
            })
        );

        expect(gtmUtils.newRelicErrLogs).toHaveBeenCalledWith(
            'GC_user_success_redirect_to_page',
            'info',
            expect.objectContaining({
                redirectUrl: '/assets/123',
                userID: '123',
            })
        );

        jest.useRealTimers();
    });
});