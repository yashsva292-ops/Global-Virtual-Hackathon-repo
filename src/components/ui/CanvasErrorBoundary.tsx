import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class CanvasErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Canvas 3D context error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#07090e] p-6 text-center">
          <div className="mb-2 h-3 w-3 rounded-full bg-cyan-400 animate-pulse" />
          <h4 className="font-mono text-xs font-semibold text-slate-300">
            {this.props.fallbackTitle || 'Interactive 3D Engine'}
          </h4>
          <p className="mt-1 max-w-xs text-[11px] text-slate-500 font-mono">
            Hardware acceleration fallback mode active.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
