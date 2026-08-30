// frontend/src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import Button from '../components/common/Button';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.login();
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-3xl font-bold text-gray-900">Email Scheduler</h1>
          <p className="text-gray-600 mt-2">Schedule and manage your emails efficiently</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          onClick={handleLogin}
        >
          Continue to Dashboard
        </Button>

        <div className="mt-6 text-sm text-gray-500 text-center border-t pt-4">
          <p>🔧 Development Mode</p>
          <p className="text-xs mt-1">
            Uses local demo account • No Google OAuth required
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;