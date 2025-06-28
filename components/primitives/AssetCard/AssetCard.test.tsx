import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PubSub from 'pubsub-js';
import Cookies from 'js-cookie';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import { getSignedUrl } from '../../../api/details';
import { callErrorToast } from '../../../api/strapi';
import { downloadDocument } from '../../../utils/url';
import { trackEvent } from '../../../utils/gtm';
import AssetDocuments from '../../assetDetails/AssetDocument';

jest.mock('pubsub-js');
jest.mock('js-cookie');
jest.mock('../../../api/details');
jest.mock('../../../api/strapi');
jest.mock('../../../utils/url');
jest.mock('../../../utils/gtm');
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => <div data-testid="pdf-modal"></div>;
  return DynamicComponent;
});

const mockedGetSignedUrl = getSignedUrl as jest.MockedFunction<
  typeof getSignedUrl
>;
const mockedCallErrorToast = callErrorToast as jest.MockedFunction<
  typeof callErrorToast
>;
const mockedDownloadDocument = downloadDocument as jest.MockedFunction<
  typeof downloadDocument
>;
const mockedTrackEvent = trackEvent as jest.MockedFunction<typeof trackEvent>;
const mockedPubSubPublish = PubSub.publish as jest.MockedFunction<
  typeof PubSub.publish
>;

const createTestStore = () =>
  configureStore({
    reducer: {
      assets: (state = { selectedAsset: { assetID: 'test-asset-id' } }) =>
        state,
    },
  });

describe('AssetDocuments Component', () => {
  const mockDocuments = [
    {
      displayName: 'Test PDF Document',
      url: 'test-url-1',
      fileName: 'test-file.pdf',
      fullPath: '/path/to/test-file.pdf',
    },
    {
      displayName: 'Test Word Document',
      url: 'test-url-2',
      fileName: 'test-file.docx',
      fullPath: '/path/to/test-file.docx',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetSignedUrl.mockResolvedValue({ url: 'signed-url' });
    (Cookies.get as jest.Mock).mockImplementation(() => undefined);
  });

  test('renders all documents correctly', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <AssetDocuments documents={mockDocuments} />
      </Provider>
    );

    expect(screen.getByText('Test PDF Document')).toBeInTheDocument();
    expect(screen.getByText('Test Word Document')).toBeInTheDocument();
  });

  test('renders PDF with download button and non-PDF without download button', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <AssetDocuments documents={mockDocuments} />
      </Provider>
    );

    const downloadButtons = document.querySelectorAll('.icon-download');
    expect(downloadButtons.length).toBe(1);
  });

  test('handles document click for desktop view correctly', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <AssetDocuments documents={mockDocuments} />
      </Provider>
    );

    fireEvent.click(screen.getByText('Test PDF Document'));

    await waitFor(() => {
      expect(mockedGetSignedUrl).toHaveBeenCalledWith(mockDocuments[0]);
      expect(mockedPubSubPublish).toHaveBeenCalledWith('openFile', {
        url: 'signed-url',
        fullPath: '/path/to/test-file.pdf',
      });
      expect(mockedTrackEvent).toHaveBeenCalledWith('Assets Document Viewed', {
        assetID: 'test-asset-id',
        document: 'Test PDF Document',
      });
    });
  });

  test('handles document click for mobile view correctly', async () => {
    (Cookies.get as jest.Mock).mockImplementation((name: string) => {
      if (name === 'webViewRendered') return 'true';
      return undefined;
    });

    const store = createTestStore();
    render(
      <Provider store={store}>
        <AssetDocuments documents={mockDocuments} />
      </Provider>
    );

    fireEvent.click(screen.getByText('Test PDF Document'));

    await waitFor(() => {
      expect(mockedGetSignedUrl).toHaveBeenCalledWith(mockDocuments[0]);
      expect(mockedDownloadDocument).toHaveBeenCalledWith('signed-url');
      expect(mockedPubSubPublish).not.toHaveBeenCalled();
    });
  });

  test('handles download button click correctly for PDF', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <AssetDocuments documents={mockDocuments} />
      </Provider>
    );

    const downloadButtons = document.querySelectorAll('.icon-download');
    fireEvent.click(downloadButtons[0]);

    await waitFor(() => {
      expect(mockedGetSignedUrl).toHaveBeenCalledWith(mockDocuments[0]);
      expect(mockedDownloadDocument).toHaveBeenCalledWith('signed-url');
    });
  });

  test('handles error when signed URL is not available', async () => {
    mockedGetSignedUrl.mockResolvedValueOnce({ url: null });
    const store = createTestStore();

    render(
      <Provider store={store}>
        <AssetDocuments documents={mockDocuments} />
      </Provider>
    );

    fireEvent.click(screen.getByText('Test PDF Document'));

    await waitFor(() => {
      expect(mockedCallErrorToast).toHaveBeenCalledWith(
        'Cannot open the document, please try again in some time'
      );
      expect(mockedPubSubPublish).not.toHaveBeenCalled();
    });
  });

  test('renders empty state correctly', () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <AssetDocuments documents={[]} />
      </Provider>
    );

    const documentsContainer = document.querySelector(
      '.documentsCardContainer'
    );
    expect(documentsContainer?.children.length).toBe(0);
  });

  test('PDF modal is always rendered', () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <AssetDocuments documents={mockDocuments} />
      </Provider>
    );

    expect(screen.getByTestId('pdf-modal')).toBeInTheDocument();
  });

  test('displays document name fallback when displayName is missing', () => {
    const store = createTestStore();
    const documentsWithMissingNames = [
      {
        url: 'test-url-1',
        fileName: 'test-file.pdf',
        fullPath: '/path/to/test-file.pdf',
      },
    ];

    render(
      <Provider store={store}>
        <AssetDocuments documents={documentsWithMissingNames} />
      </Provider>
    );

    const documentTitle = document.querySelector('.documentTitle');
    expect(documentTitle?.textContent).toBe('');
  });
});
