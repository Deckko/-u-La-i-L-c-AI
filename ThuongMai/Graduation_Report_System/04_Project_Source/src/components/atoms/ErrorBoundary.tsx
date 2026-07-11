'use client';

import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-black text-zinc-50 uppercase tracking-wider">Đã xảy ra lỗi</h2>
            <p className="text-sm text-zinc-500 max-w-sm">{this.state.error?.message || 'Vui lòng thử lại.'}</p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 px-6 py-2.5 font-black text-xs uppercase tracking-widest rounded-sm transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
