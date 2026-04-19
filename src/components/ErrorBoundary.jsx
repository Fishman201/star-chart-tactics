import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("FATAL RENDERING ERROR CAUGHT BY BOUNDARY:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Emergency Error UI matching the retro aesthetic
      return (
        <div style={{
          height: '100vh', width: '100vw', background: '#200000',
          color: '#ff4444', fontFamily: "'Press Start 2P', monospace",
          padding: '40px', overflow: 'auto', boxSizing: 'border-box',
          border: '4px solid #ff4444'
        }}>
          <h1 style={{ fontSize: '24px', letterSpacing: '2px', borderBottom: '2px solid #ff4444', paddingBottom: '10px' }}>
            [CRITICAL ERROR] UI SUBSYSTEM FAILURE
          </h1>
          <p style={{ fontSize: '12px', lineHeight: '1.6', marginTop: '20px', color: '#ffaaaa' }}>
            A fatal exception occurred during the React rendering cycle. The application tree was unmounted to prevent a completely black screen.
          </p>
          <div style={{ background: '#000', padding: '20px', marginTop: '20px', border: '1px solid #ff4444', overflow: 'auto' }}>
            <h2 style={{ fontSize: '14px', marginBottom: '10px' }}>ERROR MESSAGE:</h2>
            <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#fff', whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
            </p>
          </div>
          <div style={{ background: '#000', padding: '20px', marginTop: '20px', border: '1px solid #ff4444', overflow: 'auto' }}>
            <h2 style={{ fontSize: '14px', marginBottom: '10px' }}>COMPONENT STACK TRACE:</h2>
            <pre style={{ fontSize: '11px', fontFamily: 'monospace', color: '#aaa', whiteSpace: 'pre-wrap' }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '30px', background: 'transparent', color: '#ff4444',
              border: '2px solid #ff4444', padding: '12px 24px',
              fontFamily: "'Press Start 2P', monospace", fontSize: '12px',
              cursor: 'pointer'
            }}>
            REBOOT SYSTEM
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}