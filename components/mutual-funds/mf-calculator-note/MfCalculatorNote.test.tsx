import React from 'react';
import { render, screen } from '@testing-library/react';
import MfCalculatorNote from './MfCalculatorNote';
import styles from './MfCalculatorNote.module.css';

describe('MfCalculatorNote', () => {
  it('renders the component correctly', () => {
    render(<MfCalculatorNote />);

    // Check if the main text is rendered
    expect(
      screen.getByText(
        /By Continuing, I consent to sharing my Personal Information with the chosen AMC, and agree to/
      )
    ).toBeInTheDocument();

    // Check if the T&Cs link is rendered
    const termsLink = screen.getByText('T&Cs');
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', '/legal#termsAndConditions');
    expect(termsLink).toHaveAttribute('target', '_blank');

    // Check if the Privacy Policy link is rendered
    const privacyLink = screen.getByText('Privacy Policy');
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/legal#privacy');
    expect(privacyLink).toHaveAttribute('target', '_blank');
  });

  it('applies correct styles', () => {
    render(<MfCalculatorNote />);

    // Check if the main container has the correct class
    const container = screen.getByTestId('mf-calculator-note');
    expect(container).toHaveClass(styles.TandC);

    // Check if the links have the correct styles
    const redirectionLinks = screen.getAllByTestId('redirection-link');
    // Check each link individually
    redirectionLinks.forEach((link) => {
      expect(link).toHaveClass(styles.linkStyle);
    });
  });
});
