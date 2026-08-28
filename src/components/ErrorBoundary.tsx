import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  /** Optional fallback; defaults to a polite "something went wrong" card. */
  fallback?: ReactNode
}
interface State {
  error: Error | null
}

/**
 * Catches render-time errors anywhere in the tree below. Without this any
 * uncaught error in a child component would unmount the whole React tree
 * and leave a blank page.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[cms] render error caught by ErrorBoundary:', error, info)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex min-h-screen items-center justify-center bg-ice px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-8 text-center shadow-lift backdrop-blur-xl">
            <h1 className="font-display text-2xl font-bold text-ink">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-body">
              The page hit an unexpected error. Reload to try again.
            </p>
            <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-slate-50 p-3 text-left text-[11px] text-slate-body">
              {this.state.error.message}
            </pre>
            <button
              type="button"
              onClick={this.reset}
              className="mt-5 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-card hover:bg-brand-700"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
