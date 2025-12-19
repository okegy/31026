import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleGoogleCallback } from '@/lib/googleAuth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setStatus('error');
      setError('Authentication was cancelled or failed');
      setTimeout(() => navigate('/auth'), 3000);
      return;
    }

    if (!code) {
      setStatus('error');
      setError('No authorization code received');
      setTimeout(() => navigate('/auth'), 3000);
      return;
    }

    handleGoogleCallback(code)
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 2000);
      })
      .catch((err) => {
        setStatus('error');
        setError(err.message || 'Failed to authenticate with Google');
        setTimeout(() => navigate('/auth'), 3000);
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border-purple-500/30">
        <CardContent className="p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-purple-400 animate-spin" />
              <h2 className="text-2xl font-bold text-white mb-2">Connecting to Google</h2>
              <p className="text-gray-400">Please wait while we authenticate...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
              <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
              <p className="text-gray-400">Redirecting to dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h2 className="text-2xl font-bold text-white mb-2">Authentication Failed</h2>
              <p className="text-gray-400">{error}</p>
              <p className="text-sm text-gray-500 mt-2">Redirecting back...</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
