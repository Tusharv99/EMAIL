// frontend/src/components/common/FileUpload.tsx
import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  label?: string;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = '.csv,.txt',
  maxSize = 5 * 1024 * 1024,
  label = 'Upload CSV or TXT file',
  error
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 File input changed');
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    console.log('📄 File selected:', file.name, file.size);

    // Validate file size
    if (file.size > maxSize) {
      setFileError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
      return;
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'txt'].includes(fileExtension || '')) {
      setFileError('Please upload a CSV or TXT file');
      return;
    }

    setFileError('');
    setFileName(file.name);
    onFileSelect(file);
  };

  const handleClick = () => {
    console.log('🖱️ File upload clicked');
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          error || fileError
            ? 'border-red-300 bg-red-50'
            : fileName
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-blue-400'
        }`}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        
        {fileName ? (
          <div className="space-y-2">
            <div className="text-green-600 text-3xl">✅</div>
            <p className="text-sm font-medium text-gray-900">{fileName}</p>
            <p className="text-xs text-gray-500">Click to upload a different file</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFileName('');
                setFileError('');
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-gray-400 text-3xl">📁</div>
            <p className="text-sm font-medium text-gray-700">{label}</p>
            <p className="text-xs text-gray-500">Click to browse</p>
            <p className="text-xs text-gray-400">Supported: CSV, TXT (max {maxSize / (1024 * 1024)}MB)</p>
          </div>
        )}
      </div>
      {(error || fileError) && (
        <p className="mt-1 text-sm text-red-600">{error || fileError}</p>
      )}
    </div>
  );
};

export default FileUpload;