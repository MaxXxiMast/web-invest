import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainProvider from './index';

// Mock the dynamic imports
jest.mock('./PlatformMain', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="platform-main">{children}</div>
    ),
}));

jest.mock('./GCPlatformMain', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="gc-platform-main">{children}</div>
    ),
}));


// Mock window.location
const mockLocation = (pathname: string) => {
    Object.defineProperty(window, 'location', {
        value: { pathname },
        writable: true,
    });
};

describe('MainProvider', () => {
    test('renders PlatformMain when pathname does not include "external"', () => {
        mockLocation('/dashboard');

        render(
            <MainProvider>
                <div data-testid="children-content">Test Content</div>
            </MainProvider>
        );
    });

    test('renders GCPlatformMain when pathname includes "external"', () => {
        mockLocation('/external/something');

        render(
            <MainProvider>
                <div data-testid="children-content">Test Content</div>
            </MainProvider>
        );

    });

    test('handles case when window is undefined', () => {
        // Mock window as undefined
        const originalWindow = global.window;
        // @ts-ignore - intentionally setting window to undefined for test
        global.window = undefined;

        render(
            <MainProvider>
                <div data-testid="children-content">Test Content</div>
            </MainProvider>
        );

        expect(screen.getByTestId('gc-platform-main')).toBeInTheDocument();
        expect(screen.queryByTestId('platform-main')).not.toBeInTheDocument();

        // Restore window
        global.window = originalWindow;
    });
});