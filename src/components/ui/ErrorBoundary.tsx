import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  ar?: boolean;
  dark?: boolean;
  title?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error('[SciNexa] UI error boundary caught:', error);
  }

  private reset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (!this.state.hasError) return this.props.children;

    const { ar = false, dark = false, title } = this.props;

    return (
      <div
        className={`flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-[16px] border p-8 text-center ${
          dark ? 'border-white/10 bg-[#0b0d11] text-white' : 'border-[#e5e5e5] bg-[#fafafa] text-[#0a0a0a]'
        }`}
        role="alert"
      >
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            dark ? 'bg-white/10 text-white/80' : 'bg-[#fff1f2] text-[#be123c]'
          }`}
        >
          <AlertTriangle size={18} strokeWidth={1.7} />
        </span>
        <div className="text-[14px] font-medium">
          {title ?? (ar ? 'تعذّر تشغيل هذا المعمل' : 'This lab could not start')}
        </div>
        <p className={`max-w-[44ch] text-[12px] leading-relaxed ${dark ? 'text-white/50' : 'text-[#737373]'}`}>
          {ar
            ? 'قد يكون تسريع الرسومات (WebGL) معطّلًا في هذا المتصفح. أعد المحاولة أو افتح المنصة في Chrome أو Edge المحدّث.'
            : 'Hardware acceleration (WebGL) may be disabled in this browser. Retry, or open the platform in an up-to-date Chrome or Edge.'}
        </p>
        <button
          type="button"
          onClick={this.reset}
          className={`mt-1 inline-flex h-9 items-center gap-2 rounded-[10px] px-3 text-[12px] font-medium ${
            dark ? 'bg-white text-[#0a0a0a] hover:bg-white/90' : 'bg-[#0a0a0a] text-white hover:bg-[#171717]'
          }`}
        >
          <RotateCcw size={13} strokeWidth={1.8} />
          {ar ? 'إعادة المحاولة' : 'Try again'}
        </button>
        {import.meta.env.DEV && this.state.message && (
          <code className={`mt-2 max-w-full overflow-hidden text-ellipsis font-mono text-[9px] ${dark ? 'text-white/30' : 'text-[#a3a3a3]'}`}>
            {this.state.message}
          </code>
        )}
      </div>
    );
  }
}

export default ErrorBoundary;
