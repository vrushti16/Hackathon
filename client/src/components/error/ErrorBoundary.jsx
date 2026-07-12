import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-brand-slate-50 dark:bg-brand-slate-950 p-4">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">⚠️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-brand-slate-900 dark:text-white mb-2">
                Something went wrong.
              </h2>
              <p className="mt-2 text-sm text-brand-slate-500 dark:text-brand-slate-400">
                {this.state.error ? this.state.error.toString() : "We're working on fixing this."}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full transition-btn py-2.5 px-4 bg-brand-blue text-white font-semibold rounded-xl"
              >
                Retry
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full transition-btn py-2.5 px-4 bg-brand-slate-100 dark:bg-brand-slate-800 text-brand-slate-700 dark:text-white font-semibold rounded-xl border border-brand-slate-200 dark:border-brand-slate-700"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
