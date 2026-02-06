'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    name?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class SafeErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`[ErrorBoundary: ${this.props.name || 'Component'}] Error:`, error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center p-8 bg-red-900/10 border border-red-900/20 rounded-2xl text-center">
                    <AlertTriangle className="text-red-500 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                    <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
                        {this.props.name || 'This section'} encountered an unexpected error.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all border border-white/10"
                    >
                        <RefreshCcw size={18} /> RELOAD PAGE
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
