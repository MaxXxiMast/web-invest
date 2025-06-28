import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ArticleComponent from '.';
import { AuthorModel, ImageModel } from '../../../utils/blog';

const mockHandleClickEvent = jest.fn();
const mockHandleBadgeClick = jest.fn();

const mockProps = {
  link: 'test-article',
  title: '<b>Bold Title</b>',
  description: 'This is a test description to check read time.',
  image: {
    desktopUrl: '/test-image.jpg',
    altText: 'Test Image Alt',
  } as ImageModel,
  author: {
    name: 'John Doe',
    designation: 'Editor',
  } as AuthorModel,
  titleCharCount: 50,
  tagList: ['Tag1', 'Tag2'],
  className: 'custom-class',
  showReadTimeAuthor: true,
  handleClickEvent: mockHandleClickEvent,
  handleBadgeClick: mockHandleBadgeClick,
  titleClassName: 'custom-title',
};

describe('ArticleComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title, image, author, and tags correctly', () => {
    render(<ArticleComponent {...mockProps} />);
    expect(screen.getByText('Bold Title')).toBeInTheDocument();
    expect(screen.getByAltText('Test Image Alt')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Tag1')).toBeInTheDocument();
  });

  it('renders dangerouslySetInnerHTML correctly', () => {
    render(<ArticleComponent {...mockProps} />);
    const titleEl = screen.getByText('Bold Title');
    expect(titleEl.innerHTML).toBe('Bold Title');
  });

  it('does not render image when image object is empty', () => {
    const props = { ...mockProps, image: {} as ImageModel };
    render(<ArticleComponent {...props} />);
    expect(screen.queryByAltText('Test Image Alt')).toBeNull();
  });

  it('does not render title when title is missing', () => {
    const props = { ...mockProps, title: '' };
    render(<ArticleComponent {...props} />);
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('fires handleClickEvent when non-badge area is clicked', () => {
    render(<ArticleComponent {...mockProps} />);
    fireEvent.click(screen.getByRole('link'));
    expect(mockHandleClickEvent).toHaveBeenCalledTimes(1);
  });

  it('calls handleBadgeClick and prevents propagation on badge click', () => {
    render(<ArticleComponent {...mockProps} />);
    const badge = screen.getByText('Tag1');
    fireEvent.click(badge);
    expect(mockHandleBadgeClick).toHaveBeenCalledWith('Tag1');
    expect(mockHandleClickEvent).not.toHaveBeenCalled();
  });

  it('renders even with only required props', () => {
    render(<ArticleComponent link="minimal-article" />);
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('applies extra class name to container', () => {
    render(<ArticleComponent {...mockProps} />);
    const container = screen.getByRole('link').parentElement;
    expect(container?.className).toContain('custom-class');
  });
});
