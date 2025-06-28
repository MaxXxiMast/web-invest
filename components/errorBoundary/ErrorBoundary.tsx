import React, { Component, ReactNode } from 'react';
import FallbackComponent from './FallBackComponent';
import ComponentError from './ComponentError';

interface Props {
  children: ReactNode;
  showComponentLevelError?: boolean;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.showComponentLevelError) {
        return <ComponentError />;
      }
      return <FallbackComponent />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
