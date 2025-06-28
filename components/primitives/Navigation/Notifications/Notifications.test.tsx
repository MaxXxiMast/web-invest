// Notifications.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Notifications from '.';
import classes from './Notifications.module.css';

// Mocks
jest.mock('../../../../utils/appHelpers', () => ({
  ...jest.requireActual('../../../../utils/appHelpers'),
  isRenderedInWebview: jest.fn(),
  postMessageToNativeOrFallback: jest.fn(),
}));

jest.mock('../../../../utils/gripConnect', () => ({
  isGCOrder: jest.fn(),
}));

jest.mock('../../../../redux/slices/hooks', () => ({
  useAppSelector: jest.fn(() => false),
}));

import { isRenderedInWebview, postMessageToNativeOrFallback } from '../../../../utils/appHelpers';
import { isGCOrder } from '../../../../utils/gripConnect';
import { useAppSelector } from '../../../../redux/slices/hooks';

describe('Notifications Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders the bell icon and applies the given id', () => {
    const { container } = render(<Notifications id="notif-123" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass(classes.Notifications);
    expect(wrapper).toHaveAttribute('id', 'notif-123');

    const iconSpan = wrapper.querySelector('span');
    expect(iconSpan).toBeInTheDocument();
    expect(iconSpan).toHaveClass('icon-bell', classes.Icon);
  });

  it('does NOT render the notification dot when noOfNotifications is falsy', () => {
    render(<Notifications noOfNotifications={0} />);
    const alertDot = screen.queryByTestId('notify-alert');
    expect(alertDot).not.toBeInTheDocument();
  });

  it('renders the notification dot when noOfNotifications is truthy', () => {
    const { container } = render(<Notifications noOfNotifications={5} />);
    const wrapper = container.firstChild as HTMLElement;
    const alertDot = wrapper.querySelector(`span.${classes.NotifyAlert}`);
    expect(alertDot).toBeInTheDocument();
  });

  it('renders the notification dot when localStorage value is truthy', () => {
    localStorage.setItem('appUnreadNotificationsCount', JSON.stringify({ appUnreadNotificationsCount: 3 }));
    const { container } = render(<Notifications />);
    const wrapper = container.firstChild as HTMLElement;
    const alertDot = wrapper.querySelector(`span.${classes.NotifyAlert}`);
    expect(alertDot).toBeInTheDocument();
  });

  it('handles missing or invalid localStorage entry gracefully', () => {
    localStorage.removeItem('appUnreadNotificationsCount');
    expect(() => render(<Notifications />)).not.toThrow();
  });

  it('calls handleNotifyClick when the bell is clicked and not in webview', () => {
    (isRenderedInWebview as jest.Mock).mockReturnValue(false);
    (isGCOrder as jest.Mock).mockReturnValue(false);

    const handleClick = jest.fn();
    const { container } = render(
      <Notifications handleNotifyClick={handleClick} />
    );
    const clickableDiv = container.firstChild!.firstChild as HTMLElement;
    fireEvent.click(clickableDiv);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls postMessageToNativeOrFallback when in webview and not GC or LLP user', () => {
    (isRenderedInWebview as jest.Mock).mockReturnValue(true);
    (isGCOrder as jest.Mock).mockReturnValue(false);
    (useAppSelector as jest.Mock).mockReturnValue(false); // not LLP

    const { container } = render(<Notifications />);
    const clickableDiv = container.firstChild!.firstChild as HTMLElement;
    fireEvent.click(clickableDiv);

    expect(postMessageToNativeOrFallback).toHaveBeenCalledWith('app_notification_screen_open', {});
  });

  it('does not call postMessageToNativeOrFallback if GC or LLP user', () => {
    (isRenderedInWebview as jest.Mock).mockReturnValue(true);
    (isGCOrder as jest.Mock).mockReturnValue(true); // GC user

    const handleClick = jest.fn();
    const { container } = render(<Notifications handleNotifyClick={handleClick} />);
    const clickableDiv = container.firstChild!.firstChild as HTMLElement;
    fireEvent.click(clickableDiv);

    expect(postMessageToNativeOrFallback).not.toHaveBeenCalled();
    expect(handleClick).toHaveBeenCalled();
  });
});
