import React from 'react';
class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
  
    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true };
    }
  
    componentDidCatch(error, errorInfo) {
      // You can also log the error to an error reporting service
      console.error(error)
      if (window.appInsights) {
        window.appInsights.trackException({exception: error});
      } 
      console.log(errorInfo)
      //logErrorToMyService(error, errorInfo);
    }
  
    render() {
      if (this.state.hasError) {
        // You can render any custom fallback UI
        return <h1>Her gikk noe galt knytt til denne vurderingen på denne fanen - kontakt fremmedartsbase-teamet....</h1>;
      }
  
      return this.props.children; 
    }
  }

export default ErrorBoundary  