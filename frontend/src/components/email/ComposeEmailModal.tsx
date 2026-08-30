// frontend/src/components/email/ComposeEmailModal.tsx
import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import FileUpload from '../common/FileUpload';
import { parseCSVFile } from '../../utils/csvParser';
import type { ParsedCSVResult } from '../../utils/csvParser';

interface ComposeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  subject: string;
  body: string;
  startTime: string;
  delayBetweenEmails: number;
  hourlyLimit: number;
  sender: string;
}

const ComposeEmailModal: React.FC<ComposeEmailModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    subject: '',
    body: '',
    startTime: '',
    delayBetweenEmails: 2000,
    hourlyLimit: 5,
    sender: ''
  });

  const [emailFile, setEmailFile] = useState<File | null>(null);
  const [parsedEmails, setParsedEmails] = useState<ParsedCSVResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    console.log('📁 File selected:', file.name);
    setEmailFile(file);
    setUploadError(null);
    setParsedEmails(null);
    setLoading(true);

    parseCSVFile(file)
      .then((result) => {
        console.log('📊 Parse result:', result);
        setParsedEmails(result);
        
        if (result.valid.length === 0) {
          setUploadError('No valid email addresses found in the file');
        }
      })
      .catch((error) => {
        console.error('Error parsing file:', error);
        setUploadError('Failed to parse file. Please ensure it is a valid CSV or TXT file.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    // Validate form
    if (!formData.subject.trim()) {
      setSubmitError('Subject is required');
      setIsSubmitting(false);
      return;
    }

    if (!formData.body.trim()) {
      setSubmitError('Email body is required');
      setIsSubmitting(false);
      return;
    }

    if (!parsedEmails || parsedEmails.valid.length === 0) {
      setSubmitError('Please upload a file with valid email addresses');
      setIsSubmitting(false);
      return;
    }

    if (!formData.startTime) {
      setSubmitError('Please select a start time');
      setIsSubmitting(false);
      return;
    }

    if (!formData.sender.trim()) {
      setSubmitError('Please enter a sender email');
      setIsSubmitting(false);
      return;
    }

    try {
      // Construct the payload
      const payload = {
        subject: formData.subject,
        body: formData.body,
        recipients: parsedEmails.valid,
        startTime: formData.startTime,
        delayMs: formData.delayBetweenEmails,
        hourlyLimit: formData.hourlyLimit,
        senderId: formData.sender
      };

      console.log('📤 Sending payload:', payload);

      // Send to backend
      const response = await fetch('http://localhost:5006/api/emails/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to schedule emails');
      }

      const result = await response.json();
      console.log('✅ Scheduling result:', result);

      // Show success message
      setSuccessMessage(`✅ Scheduled ${parsedEmails.valid.length} emails successfully!`);
      
      // Reset form after 2 seconds and close
      setTimeout(() => {
        setIsSubmitting(false);
        setFormData({
          subject: '',
          body: '',
          startTime: '',
          delayBetweenEmails: 2000,
          hourlyLimit: 5,
          sender: ''
        });
        setEmailFile(null);
        setParsedEmails(null);
        setSuccessMessage(null);
        onClose();
      }, 1500);

    } catch (error) {
      console.error('❌ Scheduling error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to schedule emails');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitError(null);
    setSuccessMessage(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Compose New Email" maxWidth="2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Success Message */}
        {successMessage && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {/* Subject */}
        <Input
          label="Subject"
          type="text"
          placeholder="Enter email subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
        />

        {/* Body */}
        <Textarea
          label="Message Body"
          rows={4}
          placeholder="Write your email message..."
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          required
        />

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient List
          </label>
          <FileUpload
            onFileSelect={handleFileSelect}
            error={uploadError || undefined}
          />
          
          {loading && (
            <div className="mt-2 text-sm text-blue-600">
              Parsing file...
            </div>
          )}

          {parsedEmails && !loading && (
            <div className="mt-2 space-y-1">
              <div className="text-sm text-green-600">
                ✅ {parsedEmails.valid.length} valid email addresses detected
              </div>
              {parsedEmails.invalid.length > 0 && (
                <div className="text-sm text-red-600">
                  ⚠️ {parsedEmails.invalid.length} invalid email addresses detected
                </div>
              )}
              {parsedEmails.invalid.length > 0 && (
                <details className="text-xs text-gray-500">
                  <summary>View invalid addresses</summary>
                  <ul className="mt-1 list-disc pl-4">
                    {parsedEmails.invalid.map((email, index) => (
                      <li key={index}>{email}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Schedule Settings */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date & Time"
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
          />
          
          <Input
            label="Delay Between Emails (ms)"
            type="number"
            min="1000"
            step="1000"
            value={formData.delayBetweenEmails}
            onChange={(e) => setFormData({ 
              ...formData, 
              delayBetweenEmails: parseInt(e.target.value) || 0 
            })}
            helper="Minimum 1000ms (1 second)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Hourly Email Limit"
            type="number"
            min="1"
            max="100"
            value={formData.hourlyLimit}
            onChange={(e) => setFormData({ 
              ...formData, 
              hourlyLimit: parseInt(e.target.value) || 0 
            })}
            helper="Max emails per hour"
          />
          
          <Input
            label="Sender ID"
            type="text"
            placeholder="Enter sender ID"
            value={formData.sender}
            onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
            helper="Enter the sender ID from your database"
          />
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {submitError}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button 
            variant="secondary" 
            type="button" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={loading || !parsedEmails || parsedEmails.valid.length === 0 || isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Email'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ComposeEmailModal;