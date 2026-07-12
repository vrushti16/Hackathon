import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Widget Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[200px] border border-brand-red/20 bg-brand-red/5">
          <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-slate-900 dark:text-white">Widget Failed to Load</h3>
            <p className="text-xs text-brand-slate-500 mt-1 max-w-[200px] mx-auto">
              {this.props.fallbackMessage || 'An unexpected error occurred while rendering this component.'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onRetry) {
                this.props.onRetry();
              }
            }}
            className="text-brand-slate-600 border-brand-slate-200 hover:bg-brand-slate-100"
          >
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
