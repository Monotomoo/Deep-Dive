import { Component, type ReactNode } from 'react';

/* View-level error boundary. Wraps the active view so that a crash in one view
   shows a graceful fallback instead of white-screening the whole app — the
   sidebar/menu stay live, so you can just navigate away. Keyed by activeView in
   App, so switching views clears a crashed one. */

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('[Deep Dive] a view crashed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="max-w-[520px] mx-auto mt-[14vh] text-center px-6">
          <div className="display-italic text-[30px] text-[color:var(--color-on-paper)] leading-tight">This view hit a snag.</div>
          <p className="prose-body italic text-[13px] text-[color:var(--color-on-paper-muted)] mt-2">
            The rest of the app is fine — pick another view from the menu, or reload.
          </p>
          <pre className="text-left text-[11px] text-[color:var(--color-coral)] bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3 mt-4 overflow-auto max-h-[160px] whitespace-pre-wrap">
            {this.state.error.message}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[12px] hover:bg-[color:var(--color-brass-deep)] transition-colors"
          >
            reload the app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
