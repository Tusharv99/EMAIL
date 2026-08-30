// frontend/src/pages/SentEmails.tsx
import React, { useState, useEffect } from 'react';
import Table from '../components/common/Table';
import StatusBadge from '../components/common/StatusBadge';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import { api } from '../services/auth.service';

interface SentEmail {
  id: string;
  subject: string;
  recipient: string;
  sentAt: string | null;
  status: 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'FAILED';
  sender: {
    name: string;
    email: string;
  };
  campaign: {
    name: string;
    id: string;
  };
  errorMessage: string | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const SentEmails: React.FC = () => {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchSentEmails = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      console.log('📡 Fetching sent emails...');
      const response = await api.get(`/api/emails/sent?page=${page}&limit=10`);
      console.log('📡 Response:', response.data);
      
      if (response.data.status === 'success') {
        setEmails(response.data.data.emails);
        setPagination(response.data.data.pagination);
        console.log(`✅ Found ${response.data.data.emails.length} emails`);
      }
    } catch (error) {
      console.error('Failed to fetch sent emails:', error);
      setError('Failed to load sent emails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentEmails();
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchSentEmails(newPage);
    }
  };

  const columns = [
    { key: 'subject', header: 'Subject' },
    { 
      key: 'recipient', 
      header: 'Recipient',
      render: (item: SentEmail) => (
        <span className="text-sm">{item.recipient}</span>
      )
    },
    { 
      key: 'sentAt', 
      header: 'Sent At',
      render: (item: SentEmail) => (
        <span className="text-sm">
          {item.sentAt ? new Date(item.sentAt).toLocaleString() : 'Not sent yet'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: SentEmail) => <StatusBadge status={item.status} />,
    },
    {
      key: 'sender',
      header: 'Sender',
      render: (item: SentEmail) => (
        <span className="text-sm">{item.sender?.email || 'N/A'}</span>
      )
    },
    {
      key: 'errorMessage',
      header: 'Error',
      render: (item: SentEmail) => (
        <span className="text-sm text-red-600">
          {item.errorMessage || '-'}
        </span>
      )
    },
  ];

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button variant="primary" onClick={() => fetchSentEmails()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Sent Emails</h2>
        <span className="text-sm text-gray-500">
          Total: {pagination.total} emails
        </span>
      </div>
      
      {emails.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No sent emails yet</h3>
          <p className="text-gray-500 mb-4">
            Emails will appear here after they are sent.
            {pagination.total === 0 && (
              <span className="block mt-2 text-sm">
                You have no emails in SENT or FAILED status.
              </span>
            )}
          </p>
          {pagination.total === 0 && (
            <Button 
              variant="primary" 
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Dashboard
            </Button>
          )}
        </div>
      ) : (
        <>
          <Table 
            columns={columns} 
            data={emails} 
            emptyMessage="No sent emails found" 
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

export default SentEmails;