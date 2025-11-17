import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service
    console.error('Error caught by boundary:', error, errorInfo)

    // In production, send to error tracking service like Sentry
    if (import.meta.env.PROD) {
      // TODO: Send to Sentry or other error tracking service
      // Sentry.captureException(error, { extra: errorInfo })
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100 p-3">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>

              <p className="text-gray-600 mb-6">
                An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <details className="text-left mb-6 bg-gray-50 p-4 rounded border border-gray-200">
                  <summary className="cursor-pointer font-medium text-sm text-gray-700 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="text-xs text-red-600 overflow-auto">
                    {this.state.error.toString()}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="flex gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="btn-secondary"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="btn-primary"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
