import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Ocorreu um erro inesperado.";
      let errorDetails = "";

      if (this.state.error) {
        try {
          // Try to parse as FirestoreErrorInfo
          const parsedError = JSON.parse(this.state.error.message);
          if (parsedError.error && parsedError.operationType) {
            errorMessage = "Erro de permissão ou acesso ao banco de dados.";
            errorDetails = `Operação: ${parsedError.operationType} | Caminho: ${parsedError.path || 'N/A'} | Detalhe: ${parsedError.error}`;
          } else {
            errorDetails = this.state.error.message;
          }
        } catch (e) {
          errorDetails = this.state.error.message;
        }
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-red-100">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Ops! Algo deu errado.</h2>
            <p className="text-center text-gray-600 mb-6">
              {errorMessage}
            </p>
            {errorDetails && (
              <div className="bg-red-50 p-4 rounded-lg mb-6 overflow-auto max-h-40">
                <p className="text-xs text-red-800 font-mono break-words">
                  {errorDetails}
                </p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
