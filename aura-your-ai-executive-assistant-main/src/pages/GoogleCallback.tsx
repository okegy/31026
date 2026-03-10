import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { handleGoogleCallback, handleImplicitCallback } from '@/lib/googleAuth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Check for implicit flow (token in hash fragment)
        if (location.hash && location.hash.includes('access_token')) {
          const user = await handleImplicitCallback(location.hash);
          console.log('Google auth success (implicit):', user.email);
          setStatus('success');
          setTimeout(() => navigate('/dashboard'), 1500);
          return;
        }

        // Check for authorization code flow
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setStatus('error');
          setError('Authentication was cancelled or failed');
          setTimeout(() => navigate('/dashboard'), 3000);
          return;
        }

        if (code) {
          const user = await handleGoogleCallback(code);
          console.log('Google auth success (code):', user.email);
          setStatus('success');
          setTimeout(() => navigate('/dashboard'), 1500);
          return;
        }

        // No token or code found
        setStatus('error');
        setError('No authorization data received from Google');
        setTimeout(() => navigate('/dashboard'), 3000);
      } catch (err: any) {
        console.error('Google auth error:', err);
        setStatus('error');
        setError(err.message || 'Failed to authenticate with Google');
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    };

    processAuth();
  }, [searchParams, location.hash, navigate]);

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
              <h2 className="text-2xl font-bold text-white mb-2">Connected!</h2>
              <p className="text-gray-400">Google account linked. Redirecting to dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h2 className="text-2xl font-bold text-white mb-2">Connection Failed</h2>
              <p className="text-gray-400">{error}</p>
              <p className="text-sm text-gray-500 mt-2">Redirecting back to dashboard...</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
