import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('Caught by ErrorBoundary:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center gap-2 bg-surface-low text-center p-8 min-h-[300px]">
            <span className="material-symbols-outlined text-4xl text-outline">error</span>
            <p className="text-sm font-semibold text-on-surface">Something went wrong loading this section.</p>
            <p className="text-xs text-on-surface-variant">Please refresh the page to try again.</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
