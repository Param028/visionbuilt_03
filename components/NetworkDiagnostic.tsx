import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertTriangle, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import { Card } from './ui/Components';
import { Button } from './ui/Components';

export const NetworkDiagnostic: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
    const [details, setDetails] = useState<string>('');
    const [latency, setLatency] = useState<number | null>(null);

    const checkConnection = async () => {
        setStatus('checking');
        setDetails('');
        setLatency(null);
        
        const start = performance.now();
        try {
            // 1. Check if Supabase URL is configured
            const url = (supabase as any).supabaseUrl;
            if (!url || url.includes('placeholder')) {
                throw new Error('Supabase URL is not configured or is using placeholder.');
            }

            // 2. Attempt a simple fetch to the health endpoint or root
            // We use a timeout to fail fast
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${url}/rest/v1/`, {
                method: 'HEAD',
                headers: {
                    'apikey': (supabase as any).supabaseKey || ''
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const end = performance.now();
            setLatency(Math.round(end - start));

            if (response.ok || response.status === 401 || response.status === 404) {
                // 401/404 means we reached the server, so connection is good
                setStatus('success');
                setDetails(`Connected to ${url} (${response.status})`);
            } else {
                throw new Error(`Server responded with status: ${response.status}`);
            }
        } catch (error: any) {
            setStatus('error');
            setDetails(error.message || 'Unknown error');
            if (error.name === 'AbortError') {
                setDetails('Connection timed out (5s limit)');
            }
        }
    };

    // Auto-check on mount if we suspect issues
    useEffect(() => {
        // Optional: auto-check
    }, []);

    if (status === 'idle') {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <Button size="sm" variant="outline" onClick={checkConnection} className="bg-black/80 text-xs border-white/10 backdrop-blur-md">
                    <AlertTriangle size={12} className="mr-2 text-yellow-500" />
                    Test Connection
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-bottom-4">
            <Card className="bg-black/90 border-white/10 backdrop-blur-md shadow-2xl p-4">
                <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {status === 'checking' && <RefreshCw size={14} className="animate-spin text-blue-400" />}
                        {status === 'success' && <CheckCircle size={14} className="text-green-400" />}
                        {status === 'error' && <XCircle size={14} className="text-red-400" />}
                        Network Diagnostic
                    </h4>
                    <button onClick={() => setStatus('idle')} className="text-gray-500 hover:text-white">
                        <XCircle size={14} />
                    </button>
                </div>
                
                <div className="space-y-2">
                    <div className="text-xs text-gray-300 font-mono bg-black/50 p-2 rounded border border-white/5 break-all">
                        {details || 'Initializing...'}
                    </div>
                    
                    {latency !== null && (
                        <div className="text-xs text-gray-400 flex justify-between">
                            <span>Latency:</span>
                            <span className={latency > 1000 ? 'text-yellow-400' : 'text-green-400'}>{latency}ms</span>
                        </div>
                    )}

                    <Button size="sm" className="w-full mt-2" onClick={checkConnection} disabled={status === 'checking'}>
                        {status === 'checking' ? 'Testing...' : 'Retry Test'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};
