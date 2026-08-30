// frontend/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import { api } from '../services/auth.service';
import type { User } from '../types';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import ComposeEmailModal from '../components/email/ComposeEmailModal';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ scheduled: 0, sent: 0, failed: 0 });
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get user
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        
        // Get stats
        try {
          const scheduledRes = await api.get('/api/emails/scheduled?page=1&limit=1');
          const sentRes = await api.get('/api/emails/sent?page=1&limit=1');
          
          setStats({
            scheduled: scheduledRes.data.data.pagination?.total || 0,
            sent: sentRes.data.data.pagination?.total || 0,
            failed: 0
          });
        } catch (error) {
          console.log('Stats not available yet');
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return <Loading fullPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">📧 Email Scheduler</span>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    <span className="text-sm font-medium">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-700">{user.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              )}
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-500">Scheduled</p>
            <p className="text-3xl font-bold text-gray-900">{stats.scheduled}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-500">Sent</p>
            <p className="text-3xl font-bold text-gray-900">{stats.sent}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-500">Failed</p>
            <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/scheduled')}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900">📅 Scheduled</h3>
            <p className="text-sm text-gray-500 mt-1">View all scheduled emails</p>
          </button>
          <button
            onClick={() => navigate('/sent')}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900">📤 Sent</h3>
            <p className="text-sm text-gray-500 mt-1">View all sent emails</p>
          </button>
          <button
            onClick={() => setIsComposeModalOpen(true)}
            className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-200 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-blue-700">✏️ Compose</h3>
            <p className="text-sm text-blue-500 mt-1">Create a new email campaign</p>
          </button>
        </div>
      </main>

      {/* Compose Modal */}
      <ComposeEmailModal
        isOpen={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;