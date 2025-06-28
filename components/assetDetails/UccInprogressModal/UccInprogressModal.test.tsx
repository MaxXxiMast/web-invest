import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UccInprogressModal from '../UccInprogressModal'; // Adjust path as needed
import { UccInProgressData } from '..';

// Mock the dependent components and utils
jest.mock('../../../utils/string', () => ({
  GRIP_INVEST_BUCKET_URL: 'https://mock-bucket/',
}));

jest.mock('../../primitives/Image', () => ({
  __esModule: true,
  default: ({ src, alt }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

jest.mock('../../primitives/MaterialModalPopup', () => {
  return function MockedMaterialModalPopup({ children, showModal }) {
    return showModal ? <div data-testid="modal">{children}</div> : null;
  };
});

jest.mock('../../primitives/Button', () => {
  const Button = ({ children, onClick, ...rest }: any) => (
    <button onClick={onClick} {...rest}>
      {children}
    </button>
  );
  return Object.assign(Button, {
    ButtonType: {
      Secondary: 'Secondary',
    },
  });
});

describe('UccInprogressModal', () => {
  const { title, amoTitle } = UccInProgressData;
  it('should not render modal when showModal is false', () => {
    const { queryByTestId } = render(<UccInprogressModal showModal={false} />);
    expect(queryByTestId('modal')).toBeNull();
  });

  it('should render modal when showModal is true', () => {
    render(<UccInprogressModal showModal={true} />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('should display default title when isAmoOrder is false', () => {
    render(<UccInprogressModal showModal={true} isAmoOrder={false} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(title); // adjust expected title based on real data
  });

  it('should display AMO title when isAmoOrder is true', () => {
    render(<UccInprogressModal showModal={true} isAmoOrder={true} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      amoTitle
    );
  });

  it('should call handleModalClose when button is clicked', () => {
    const handleClose = jest.fn();
    render(
      <UccInprogressModal showModal={true} handleModalClose={handleClose} />
    );
    fireEvent.click(screen.getByRole('button', { name: /okay, understood/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
