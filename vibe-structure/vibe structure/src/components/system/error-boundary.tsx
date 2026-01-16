
import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { queryClient } from '@/lib/query-client';
import { fixRuntimeError } from '../../../app-gen-sdk/fix-runtime-error-util';

interface ErrorBoundaryProps {
  children: ReactNode;
  retryLabel?: string;
  showStack?: boolean; // force showing stack even in prod (for internal builds)
  resetQueryCache?: boolean;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  copied: boolean;
  isAutoReloading: boolean;
  isFixing: boolean;
}

const autoReloadAttempts = new Map<string, number>();
const AUTO_RELOAD_ERROR_MESSAGES = [
  // This is a best-effort attempt to recover from transient null property access errors. We are seeing this due to our custom handler
  // for HMR support. In cases where they detect a dependency change and try to trigger a full reload, we not handle it gracefully.
  // This code should be able to be removed once we can support the Vite HMR directly.
  // https://github.com/vitejs/vite/blob/3a92bc79b306a01b8aaf37f80b2239eaf6e488e7/packages/vite/src/node/optimizer/optimizer.ts#L485
  'Cannot read properties of null',
  // Add more error messages here in the future as needed
];

class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: undefined,
    errorInfo: undefined,
    copied: false,
    isAutoReloading: false,
    isFixing: false
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      copied: false,
      isAutoReloading: false,
      isFixing: false
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Store the error info (which contains componentStack) in state
    this.setState({ errorInfo });

    // Lightweight instrumentation hook.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[error-boundary] caught error:', error, errorInfo);
    }

    // Check if the error message matches any of the auto-reload triggers
    const shouldAutoReload = AUTO_RELOAD_ERROR_MESSAGES.some(message =>
      error.message.includes(message)
    );

    if (shouldAutoReload) {
      const currentLocation = window.location.href;
      const attempts = autoReloadAttempts.get(currentLocation) || 0;

      if (attempts === 0) {
        // Mark that we've attempted reload for this location
        autoReloadAttempts.set(currentLocation, 1);
        this.setState({ isAutoReloading: true });

        // Auto-reload the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    }
  }

  private reset = () => {
    const { resetQueryCache, onReset } = this.props;
    if (resetQueryCache) {
      try {
        queryClient.clear();
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn('[error-boundary] failed to clear query cache', e);
        }
      }
    }
    onReset?.();
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      copied: false,
      isAutoReloading: false,
      isFixing: false
    });

    // Perform a full page reload to recover from the error
    window.location.reload();
  };

  private copyDetails = async () => {
    if (!this.state.error) return;
    try {
      const componentStack = this.state.errorInfo?.componentStack || '';
      const errorStack = this.state.error.stack || '';
      const fullDetails = `Error: ${this.state.error.message}

Component Stack:
${componentStack}

Error Stack:
${errorStack}`.trim();

      await navigator.clipboard.writeText(fullDetails);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    } catch {
      /* ignore */
    }
  };

  private fixError = async () => {
    if (!this.state.error) return;

    this.setState({ isFixing: true });

    try {
      await fixRuntimeError({
        message: this.state.error.message,
        componentStack: this.state.errorInfo?.componentStack || '',
        errorStack: this.state.error.stack || '',
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[error-boundary] failed to fix error', error);
      }
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { retryLabel = 'Retry', showStack } = this.props;
    const { error, errorInfo, copied, isAutoReloading, isFixing } = this.state;
    const isDev = process.env.NODE_ENV !== 'production';
    const shouldShowStacks = isDev || showStack;

    // Show nothing when auto-reloading
    if (isAutoReloading) {
      return null;
    }

    return (
      <div
        role="alert"
        className="m-6 max-w-xl rounded-md border p-6 text-sm space-y-4 bg-background/60 backdrop-blur"
      >
        <div className="space-y-1">
          <div className="font-semibold">Something went wrong rendering this view.</div>
          {error?.message && (
            <div className="text-muted-foreground break-words">
              {error.message}
            </div>
          )}
        </div>

        {shouldShowStacks && (
          <div className="space-y-3">
            {errorInfo?.componentStack && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Component Stack:</div>
                <pre className="max-h-32 overflow-auto rounded bg-muted p-3 text-xs leading-snug">
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}
            {error?.stack && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Error Stack:</div>
                <pre className="max-h-32 overflow-auto rounded bg-muted p-3 text-xs leading-snug">
                  {error.stack}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={this.reset}
            className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {retryLabel}
          </button>
          {error && (navigator?.clipboard) && (
            <button
              type="button"
              onClick={this.copyDetails}
              className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {copied ? 'Copied!' : 'Copy error'}
            </button>
          )}
          {error && process.env.NODE_ENV !== 'production' && (
            <button
              type="button"
              onClick={this.fixError}
              disabled={isFixing}
              className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFixing ? 'Fixing...' : 'Fix it'}
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
