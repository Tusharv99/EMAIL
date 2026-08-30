// frontend/src/pages/ScheduledEmails.tsx
import React, { useState, useEffect } from 'react';
import Table from '../components/common/Table';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { api } from '../services/auth.service';

interface ScheduledEmail {
  id: string;
  subject: string;
  recipient: string;
  scheduledAt: string;
  status: 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'FAILED';
  sender: {
    name: string;
    email: string;
  };
  campaign: {
    name: string;
    id: string;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ScheduledEmails: React.FC = () => {
  const [emails, setEmails] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchScheduledEmails = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      console.log('📡 Fetching scheduled emails...');
      const response = await api.get(`/api/emails/scheduled?page=${page}&limit=10`);
      console.log('📡 Response:', response.data);
      
      if (response.data.status === 'success') {
        setEmails(response.data.data.emails);
        setPagination(response.data.data.pagination);
        console.log(`✅ Found ${response.data.data.emails.length} emails`);
      }
    } catch (error) {
      console.error('Failed to fetch scheduled emails:', error);
      setError('Failed to load scheduled emails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledEmails();
  }, []);

  const handleCancel = async (emailId: string) => {
    if (!confirm('Are you sure you want to cancel this email?')) return;
    
    try {
      await api.delete(`/api/emails/${emailId}/cancel`);
      fetchScheduledEmails(pagination.page);
    } catch (error) {
      console.error('Failed to cancel email:', error);
      alert('Failed to cancel email');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchScheduledEmails(newPage);
    }
  };

  const columns = [
    { key: 'subject', header: 'Subject' },
    { 
      key: 'recipient', 
      header: 'Recipient',
      render: (item: ScheduledEmail) => (
        <span className="text-sm">{item.recipient}</span>
      )
    },
    { 
      key: 'scheduledAt', 
      header: 'Scheduled At',
      render: (item: ScheduledEmail) => (
        <span className="text-sm">
          {new Date(item.scheduledAt).toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: ScheduledEmail) => <StatusBadge status={item.status} />,
    },
    {
      key: 'sender',
      header: 'Sender',
      render: (item: ScheduledEmail) => (
        <span className="text-sm">{item.sender?.email || 'N/A'}</span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: ScheduledEmail) => (
        <Button 
          variant="danger" 
          size="sm"
          onClick={() => handleCancel(item.id)}
        >
          Cancel
        </Button>
      ),
    },
  ];

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button variant="primary" onClick={() => fetchScheduledEmails()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Scheduled Emails</h2>
        <span className="text-sm text-gray-500">
          Total: {pagination.total} emails
        </span>
      </div>
      
      {emails.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No scheduled emails</h3>
          <p className="text-gray-500 mb-4">
            You haven't scheduled any emails yet.
          </p>
          <Button 
            variant="primary" 
            onClick={() => window.location.href = '/dashboard'}
          >
            Compose New Email
          </Button>
        </div>
      ) : (
        <>
          <Table 
            columns={columns} 
            data={emails} 
            emptyMessage="No scheduled emails found" 
          />

          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ScheduledEmails;