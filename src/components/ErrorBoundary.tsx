import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Globe, Compass } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AeroGlobe uncaught application error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleResetState = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <main
          id="aeroglobe-error-boundary"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-6 text-slate-100 font-sans select-none"
        >
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/95 border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.15)] flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl font-bold tracking-tight text-white mb-2">
              Flight Navigation Interrupted
            </h1>

            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              A temporary display or graphics error occurred. You can restore your flight deck and continue exploring global destinations.
            </p>

            {this.state.error && (
              <div className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-left font-mono text-[11px] text-rose-300/80 mb-6 overflow-x-auto max-h-28">
                {this.state.error.message || 'Unknown WebGL / rendering exception'}
              </div>
            )}

            <div className="flex items-center gap-3 w-full">
              <button
                id="reset-navigation-btn"
                onClick={this.handleResetState}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Compass className="w-4 h-4 text-sky-400" />
                Resume
              </button>
              <button
                id="reload-aeroglobe-btn"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Map
              </button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
