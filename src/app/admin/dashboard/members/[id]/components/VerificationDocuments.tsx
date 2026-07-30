// app/member/dashboard/components/VerificationDocuments.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Download,
  AlertCircle,
  RefreshCw
} from "lucide-react";

interface VerificationDocumentsProps {
  memberId: string;
  adminActions: {
    caste_verification_status: string;
    caste_verification_document_path: string | null;
    caste_verification_document_name: string | null;
    caste_verification_submitted_at: string | null;
    caste_verification_verified_at: string | null;
    caste_verification_rejected_at: string | null;
    caste_verification_rejection_reason: string | null;
    caste_verification_flag_sent_at: string | null;
    document_verification_status: string;
    document_verification_document_path: string | null;
    document_verification_document_name: string | null;
    document_verification_submitted_at: string | null;
    document_verification_verified_at: string | null;
    document_verification_rejected_at: string | null;
    document_verification_rejection_reason: string | null;
    document_verification_flag_sent_at: string | null;
  };
  onUpdate: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
const MEDIA_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_PLAIN;

export default function VerificationDocuments({ memberId, adminActions, onUpdate }: VerificationDocumentsProps) {
  const [uploadingCaste, setUploadingCaste] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'caste' | 'document' | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>('');

  const casteStatus = adminActions?.caste_verification_status || 'not_submitted';
  const documentStatus = adminActions?.document_verification_status || 'not_submitted';
  const hasCasteDocument = adminActions?.caste_verification_document_path;
  const hasDocument = adminActions?.document_verification_document_path;
  const isCasteFlagSent = adminActions?.caste_verification_flag_sent_at;
  const isDocumentFlagSent = adminActions?.document_verification_flag_sent_at;

  const canUploadCaste = casteStatus === 'pending' || casteStatus === 'rejected' || (isCasteFlagSent && casteStatus === 'not_submitted');
  const canUploadDocument = documentStatus === 'pending' || documentStatus === 'rejected' || (isDocumentFlagSent && documentStatus === 'not_submitted');
  const isCasteVerified = casteStatus === 'verified';
  const isDocumentVerified = documentStatus === 'verified';
  const isCasteRejected = casteStatus === 'rejected';
  const isDocumentRejected = documentStatus === 'rejected';
  const isCastePending = casteStatus === 'pending';
  const isDocumentPending = documentStatus === 'pending';

  const handleFileSelect = (type: 'caste' | 'document', file: File) => {
    setUploadType(type);
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadType) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('member_id', memberId);
    formData.append('document_type', uploadType);

    if (uploadType === 'caste') {
      setUploadingCaste(true);
    } else {
      setUploadingDocument(true);
    }

    try {
      const endpoint = uploadType === 'caste' 
        ? `${API_URL}/member-admin/upload-caste-document`
        : `${API_URL}/member-admin/upload-document`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        alert(`${uploadType === 'caste' ? 'Caste' : 'Verification'} document uploaded successfully!`);
        setSelectedFile(null);
        setUploadType(null);
        onUpdate();
      } else {
        alert(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('An error occurred while uploading');
    } finally {
      setUploadingCaste(false);
      setUploadingDocument(false);
    }
  };

  const handleViewDocument = (url: string, name: string) => {
    const fullUrl = `${MEDIA_URL}${url}`;
    setPreviewUrl(fullUrl);
    setPreviewName(name);
    setShowPreview(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle className="h-3 w-3 mr-1" /> Verified</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"><Clock className="h-3 w-3 mr-1" /> Pending Review</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><XCircle className="h-3 w-3 mr-1" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">Not Submitted</span>;
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Verification Documents</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Upload your caste certificate and verification documents for admin review. 
          Once verified, these will be displayed on your profile.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Caste Verification Section */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Caste Verification</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload your caste certificate</p>
              </div>
              {getStatusBadge(casteStatus)}
            </div>

            {/* Request Info */}
            {isCasteFlagSent && casteStatus === 'not_submitted' && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Verification Requested</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Admin has requested caste verification. Please upload your document.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Reason */}
            {isCasteRejected && adminActions?.caste_verification_rejection_reason && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-700 dark:text-red-300">Rejection Reason:</p>
                    <p className="text-xs text-red-600 dark:text-red-400">{adminActions.caste_verification_rejection_reason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Section */}
            {(canUploadCaste || isCasteRejected) && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Caste Certificate (PDF or Image)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect('caste', e.target.files[0]);
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/30 dark:file:text-purple-400"
                  />
                  {uploadType === 'caste' && selectedFile && (
                    <button
                      onClick={handleUpload}
                      disabled={uploadingCaste}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {uploadingCaste ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Allowed formats: JPG, PNG, PDF (Max 5MB)</p>
              </div>
            )}

            {/* View Uploaded Document */}
            {hasCasteDocument && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {adminActions?.caste_verification_document_name || 'Caste Document'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDocument(adminActions.caste_verification_document_path!, adminActions.caste_verification_document_name || 'Caste Document')}
                      className="p-1 text-purple-600 hover:text-purple-700"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => window.open(`${MEDIA_URL}${adminActions.caste_verification_document_path}`, '_blank')}
                      className="p-1 text-blue-600 hover:text-blue-700"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {adminActions?.caste_verification_submitted_at && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Submitted: {new Date(adminActions.caste_verification_submitted_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Verification Info */}
            {isCasteVerified && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    Verified on {adminActions?.caste_verification_verified_at && new Date(adminActions.caste_verification_verified_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            {isCastePending && hasCasteDocument && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">
                    Under review by admin
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Document Verification Section */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Document Verification</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload your verification documents</p>
              </div>
              {getStatusBadge(documentStatus)}
            </div>

            {/* Request Info */}
            {isDocumentFlagSent && documentStatus === 'not_submitted' && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Verification Requested</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Admin has requested document verification. Please upload your documents.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Reason */}
            {isDocumentRejected && adminActions?.document_verification_rejection_reason && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-700 dark:text-red-300">Rejection Reason:</p>
                    <p className="text-xs text-red-600 dark:text-red-400">{adminActions.document_verification_rejection_reason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Section */}
            {(canUploadDocument || isDocumentRejected) && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Verification Documents (PDF or Image)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect('document', e.target.files[0]);
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/30 dark:file:text-purple-400"
                  />
                  {uploadType === 'document' && selectedFile && (
                    <button
                      onClick={handleUpload}
                      disabled={uploadingDocument}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {uploadingDocument ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Allowed formats: JPG, PNG, PDF (Max 5MB)</p>
              </div>
            )}

            {/* View Uploaded Document */}
            {hasDocument && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {adminActions?.document_verification_document_name || 'Verification Document'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDocument(adminActions.document_verification_document_path!, adminActions.document_verification_document_name || 'Verification Document')}
                      className="p-1 text-purple-600 hover:text-purple-700"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => window.open(`${MEDIA_URL}${adminActions.document_verification_document_path}`, '_blank')}
                      className="p-1 text-blue-600 hover:text-blue-700"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {adminActions?.document_verification_submitted_at && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Submitted: {new Date(adminActions.document_verification_submitted_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Verification Info */}
            {isDocumentVerified && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    Verified on {adminActions?.document_verification_verified_at && new Date(adminActions.document_verification_verified_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            {isDocumentPending && hasDocument && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700 dark:text-yellow-300">
                    Under review by admin
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Document Preview: {previewName}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
              {previewUrl.match(/\.(jpg|jpeg|png)$/i) ? (
                <img src={previewUrl} alt="Document Preview" className="max-w-full h-auto mx-auto" />
              ) : (
                <iframe src={previewUrl} className="w-full h-[60vh] rounded-lg" title="Document Preview" />
              )}
            </div>
            <div className="mt-4 flex gap-3 justify-end">
              <button
                onClick={() => window.open(previewUrl, '_blank')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                <Download className="h-4 w-4 inline mr-2" />
                Open in New Window
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}