import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MaterialModalPopup from './index';
import { useMediaQuery } from '../../../utils/customHooks/useMediaQuery';

// Mock the external dependencies
jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn()
}));

jest.mock('../../assets/CloseLineIcon', () => ({
  __esModule: true,
  default: () => <div data-testid="close-icon" />
}));

// Mock the MUI components
jest.mock('@mui/material/Drawer', () => ({
  __esModule: true,
  default: (props) => (
    <div data-testid="mui-drawer" onClick={props.onClose}>
      {props.open && props.children}
    </div>
  )
}));

jest.mock('@mui/material/Dialog', () => ({
  __esModule: true,
  default: (props) => (
    <div data-testid="mui-dialog" onClick={(e) => props.onClose(e, 'backdropClick')}>
      {props.open && props.children}
    </div>
  )
}));


describe('MaterialModalPopup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test case 1
  test('renders nothing when showModal is false', () => {
    render(
      <MaterialModalPopup showModal={false}>
        <div>Test Content</div>
      </MaterialModalPopup>
    );
    
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
  });

  // Test case 2
  test('renders Dialog when showModal is true and not in mobile mode', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    
    render(
      <MaterialModalPopup showModal={true}>
        <div>Test Content</div>
      </MaterialModalPopup>
    );
    
    expect(screen.getByTestId('mui-dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
  });

  // Test case 3
  test('renders Drawer when showModal is true, in mobile mode, and isModalDrawer is true', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    
    render(
      <MaterialModalPopup showModal={true} isModalDrawer={true}>
        <div>Test Content</div>
      </MaterialModalPopup>
    );
    
    expect(screen.getByTestId('mui-drawer')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  // Test case 4
  test('does not render close button when showCloseBtn is false', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    
    render(
      <MaterialModalPopup showModal={true} showCloseBtn={false}>
        <div>Test Content</div>
      </MaterialModalPopup>
    );
    
    expect(screen.queryByTestId('close-icon')).not.toBeInTheDocument();
  });

  // Test case 5
  test('does not render close button when hideClose is true', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    
    render(
      <MaterialModalPopup showModal={true} hideClose={true}>
        <div>Test Content</div>
      </MaterialModalPopup>
    );
    
    expect(screen.queryByTestId('close-icon')).not.toBeInTheDocument();
  });

  // Test case 6
  test('calls handleModalClose when close button is clicked', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    const handleModalClose = jest.fn();
    
    render(
      <MaterialModalPopup showModal={true} handleModalClose={handleModalClose}>
        <div>Test Content</div>
      </MaterialModalPopup>
    );
    
    fireEvent.click(screen.getByTestId('close-icon'));
    expect(handleModalClose).toHaveBeenCalledWith(false);
  });

  // Test case 7
  test('calls handleModalClose when Dialog backdrop is clicked and closeOnOutsideClick is true', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    const handleModalClose = jest.fn();
    
    render(
      <MaterialModalPopup showModal={true} handleModalClose={handleModalClose} closeOnOutsideClick={true}>
        <div>Test Content</div>
      </MaterialModalPopup>
    );
    
    fireEvent.click(screen.getByTestId('mui-dialog'));
    expect(handleModalClose).toHaveBeenCalledWith(false);
  });

  // Test case 8
  test('does not call handleModalClose when Dialog backdrop is clicked and closeOnOutsideClick is false', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    const handleModalClose = jest.fn();
    
    render(
      <MaterialModalPopup showModal={true} handleModalClose={handleModalClose} closeOnOutsideClick={false}>
        <div>Test Content</div>
      </MaterialModalPopup>
    );
    
    fireEvent.click(screen.getByTestId('mui-dialog'));
    expect(handleModalClose).not.toHaveBeenCalled();
  });

  // Test case 9
  test('applies custom classes and styles correctly', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    
    render(
      <MaterialModalPopup 
        showModal={true}
        className="custom-class"
        cardClass="custom-card"
        bodyClass="custom-body"
        backgroundColor="red"
        cardStyles={{ padding: '20px' }}
      >
        <div>Test Content</div>
      </MaterialModalPopup>
    );
    
    const innerElement = screen.getByText('Test Content').parentElement;
    expect(innerElement).toHaveClass('custom-body');
    const cardElement = innerElement?.parentElement;
    expect(cardElement).toHaveClass('custom-card');
  });
});