import React from 'react';
import { Issue } from '../types/index';
import ImagePreview from './ImagePreview';
import StatusBadge from './StatusBadge';

interface IssueDetailsModalProps {
  issue: Issue | null;
  isOpen: boolean;
  onClose: () => void;
}

const IssueDetailsModal: React.FC<IssueDetailsModalProps> = ({ issue, isOpen, onClose }) => {
  if (!isOpen || !issue) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Issue #{issue.issueNumber}</h2>
            <p className="text-gray-600 text-sm mt-1">Created: {formatDate(issue.createdAt)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Status
            </h3>
            <StatusBadge status={issue.status} />
          </div>

          {/* Location */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Location
            </h3>
            <p className="text-lg text-gray-800 font-semibold">{issue.location}</p>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{issue.description}</p>
          </div>

          {/* Images */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
              Images
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Shop Drawing</p>
                <ImagePreview
                  src={issue.shopDrawing.thumbnail}
                  alt="Shop Drawing"
                  thumbnailSize="medium"
                />
              </div>
              {issue.siteImage && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Site Image</p>
                  <ImagePreview
                    src={issue.siteImage.thumbnail}
                    alt="Site Image"
                    thumbnailSize="medium"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Solution (if closed) */}
          {issue.status === 'Closed' && issue.solution && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-800 uppercase tracking-wide mb-3">
                Solution
              </h3>
              <p className="text-green-900 leading-relaxed whitespace-pre-wrap">{issue.solution}</p>
              {issue.closedAt && (
                <p className="text-sm text-green-700 mt-3">
                  Closed on: {formatDate(issue.closedAt)}
                </p>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-600">
            <div>
              <span className="font-semibold">Last Updated:</span> {formatDate(issue.updatedAt)}
            </div>
            <div>
              <span className="font-semibold">Issue ID:</span> {issue.id.substring(0, 8)}...
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailsModal;
