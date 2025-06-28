import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import FDKYCPending from './index';
import React from 'react';
import { handleQualificationPost, createDigilockerRequest } from '../../../../api/rfqKyc';
import { callErrorToast } from '../../../../api/strapi';
import { createFDOrder, fetchKycConfigStatus } from '../../../../redux/slices/user';
import { determineFDActionForKYC, isSeniorCitizen } from '../../../fd/FDButton/utils';
import { getFDCalculationData, setResettingModalValues } from '../../../../redux/slices/fd';

jest.mock('../../../../api/rfqKyc', () => ({
    handleQualificationPost: jest.fn(),
    createDigilockerRequest: jest.fn()
}));

jest.mock('../../../../redux/slices/fd', () => ({
    getFDCalculationData: jest.fn(),
    setFDKYCBehaviour: jest.fn(),
    setOpenFDStepperLoader: jest.fn(),
    setResettingModalValues: jest.fn()
}))

jest.mock('../../../fd/FDButton/utils', () => ({
    determineFDActionForKYC: jest.fn(),
    isSeniorCitizen: jest.fn()
}))

jest.mock('../../../../api/strapi', () => ({
    callErrorToast: jest.fn(),
}));

jest.mock('../../../../redux/slices/user', () => ({
    fetchKycConfigStatus: jest.fn(),
    createFDOrder: jest.fn()
}))

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: () => mockDispatch,
}));

const mockRouter = {
    push: jest.fn()
};

jest.mock('next/router', () => ({
    useRouter: () => mockRouter
}));

const createTestStore = (kycConfig: any, preloadedState = {}) => configureStore({
    reducer: {
        user: () => ({
            kycConfigStatus: {
                default: {
                    kycTypes: kycConfig,
                },
            },
        }),
        assets: () => ({
            selectedAsset: {
                assetID: '1',
                name: 'Test Asset',
                productSubcategory: 'Fixed Deposit',
            },
        }),
        fdConfig: () => ({
            ...preloadedState,
        }),
    },
});

describe('FDKYCPending Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    window.open = jest.fn();

    const renderComponent = (store: any) => {
        render(
            <Provider store={store}>
                <FDKYCPending setShowModal={jest.fn()} />
            </Provider>
        );
    };

    // Test case - 1
    test('renders component with Digilocker button when address verification is needed', async () => {
        const store = createTestStore([
            { name: 'address', isKYCComplete: false, isKYCPendingVerification: false },
            { name: 'other', fields: { qualification: '' } },
        ]);
      
        const mockDigilockerUrl = 'https://digilocker.example.com';
        (createDigilockerRequest as jest.Mock).mockResolvedValueOnce({ url: mockDigilockerUrl });
        (handleQualificationPost as jest.Mock).mockResolvedValueOnce({});
      
        jest.spyOn(React, 'useState')
            .mockImplementationOnce(() => ['Graduate', jest.fn()])  // qualification
            .mockImplementationOnce(() => [false, jest.fn()]); // isLoading
      
        renderComponent(store);

        const button = screen.getByRole('button', { name: /verify address via digilocker/i });
        expect(button).toBeInTheDocument();
        expect(screen.getByText('We do not store your Aadhaar')).toBeInTheDocument();

        fireEvent.click(button);
      
        await waitFor(() => {
            expect(handleQualificationPost).toHaveBeenCalledWith('Graduate');
            expect(createDigilockerRequest).toHaveBeenCalled();
            expect(mockRouter.push).toHaveBeenCalledWith(mockDigilockerUrl);
        }, { timeout: 2500 });
    });

    // Test case - 2
    test('renders component with Confirm button when address verification is not needed', () => {
        const store = createTestStore([
            { name: 'address', isKYCComplete: true, isKYCPendingVerification: false },
            { name: 'other', fields: { qualification: '' } },
        ]);

        renderComponent(store);

        const button = screen.getByRole('button', { name: /confirm/i });
        expect(button).toBeInTheDocument();
        expect(screen.queryByText('We do not store your Aadhaar')).not.toBeInTheDocument();
    });

    // Test case - 3
    test('handles API failure gracefully', async () => {
        const store = createTestStore([
            { name: 'address', isKYCComplete: false, isKYCPendingVerification: false },
            { name: 'other', fields: { qualification: '' } },
        ]);

        jest.spyOn(React, 'useState')
            .mockImplementationOnce(() => ['Graduate', jest.fn()]) // qualification
            .mockImplementationOnce(() => [false, jest.fn()]); // isLoading

        (handleQualificationPost as jest.Mock).mockRejectedValueOnce(new Error('API Failed'));

        renderComponent(store);

        const button = screen.getByRole('button', { name: /verify address via digilocker/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(handleQualificationPost).toHaveBeenCalled();
            expect(callErrorToast).toHaveBeenCalledWith('API Failed');
        });
    });

    // Test case - 4
    test('updates qualification value on selecting from GripSelect', () => {
        const store = createTestStore([
          { name: 'address', isKYCComplete: false, isKYCPendingVerification: false },
          { name: 'other', fields: { qualification: '' } }
        ]);
      
        const mockSetQualification = jest.fn();
        jest.spyOn(React, 'useState')
            .mockImplementationOnce(() => ['', mockSetQualification]) // qualification
            .mockImplementationOnce(() => [false, jest.fn()]); // isLoading
      
        renderComponent(store);
      
        const qualificationSelect = screen.getByLabelText('Your Qualification');
        expect(qualificationSelect).toBeInTheDocument();
      
        fireEvent.mouseDown(qualificationSelect);
        const option = screen.getByText('Post Graduate');
        fireEvent.click(option);
      
        expect(mockSetQualification).toHaveBeenCalled();
    });

    // Test case - 5
    test('button is disabled when qualification is required but not selected', () => {
        const store = createTestStore([
            { name: 'address', isKYCComplete: false, isKYCPendingVerification: false },
            { name: 'other', fields: { qualification: '' } },
        ]);

        jest.spyOn(React, 'useState')
            .mockImplementationOnce(() => ['', jest.fn()]) // qualification
            .mockImplementationOnce(() => [false, jest.fn()]); // isLoading

        renderComponent(store);

        const button = screen.getByRole('button', { name: /verify address via digilocker/i });
        expect(button).toBeDisabled();
    });

    // Test case - 6
    test('button is enabled when qualification is selected', () => {
        const store = createTestStore([
            { name: 'address', isKYCComplete: false, isKYCPendingVerification: false },
            { name: 'other', fields: { qualification: '' } },
        ]);

        jest.spyOn(React, 'useState')
            .mockImplementationOnce(() => ['Graduate', jest.fn()]) // qualification
            .mockImplementationOnce(() => [false, jest.fn()]); // isLoading

        renderComponent(store);

        const button = screen.getByRole('button', { name: /verify address via digilocker/i });
        expect(button).not.toBeDisabled();
    });
});