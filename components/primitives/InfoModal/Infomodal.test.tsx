import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InfoModal from './Infomodal';

jest.mock('./Infomodal.module.css', () => ({
    CardHeader: 'CardHeader',
    CardHeaderLeft: 'CardHeaderLeft',
    ImageIcon: 'ImageIcon',
    Icon: 'Icon',
    Label: 'Label',
    CardBody: 'CardBody',
    CardFooter: 'CardFooter',
  }));
  
jest.mock('../../../utils/customHooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));
  
describe('InfoModal Component', () => {
  const defaultProps = {
    showModal: true,
    modalTitle: 'Test Title',
    modalContent: '<p>Some <strong>content</strong></p>',
    handleModalClose: jest.fn(),
    isModalDrawer: true,
    className: 'custom-class',
    isHTML: true,
    iconName: 'icon-info',
  };

  it('TC 1: should render modal with title and HTML content', () => {
    render(<InfoModal {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Some')).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('TC 2: should call handleModalClose when OKAY button is clicked', () => {
    render(<InfoModal {...defaultProps} />);
    fireEvent.click(screen.getByText('OKAY'));
    expect(defaultProps.handleModalClose).toHaveBeenCalledTimes(1);
  });

  it('TC 3: should not render title if modalTitle is empty', () => {
    render(<InfoModal {...defaultProps} modalTitle="" />);
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('TC 4: should render raw content if isHTML is false', () => {
    render(<InfoModal {...defaultProps} isHTML={false} modalContent="Plain Content" />);
    expect(screen.getByText('Plain Content')).toBeInTheDocument();
  });

  it('TC 5: should not show modal if showModal is false', () => {
    const { container } = render(<InfoModal {...defaultProps} showModal={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('TC 6: should render with correct icon class', () => {
    render(<InfoModal {...defaultProps} />);
    expect(document.querySelector('.icon-info')).toBeInTheDocument();
  });

  it('TC 7: should use default prop values when none are provided', async () => {
    render(<InfoModal showModal={true} />);

    const okayBtn = await screen.findByText('OKAY');// Wait for OKAY button to confirm modal is rendered
    expect(okayBtn).toBeInTheDocument();

    const icon = document.querySelector('.icon-question');
    expect(icon).toBeInTheDocument();
  });
});
