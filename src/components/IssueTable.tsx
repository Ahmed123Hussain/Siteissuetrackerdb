import React, { useState } from 'react';
import { processImage } from '../utils/imageHandling';
import { Issue, ClosureModalState } from '../types/index';
import StatusBadge from './StatusBadge';
import ImagePreview from './ImagePreview';
import LoadingSpinner from './LoadingSpinner';

interface IssueTableProps {
  issues: Issue[];
  onStatusChange: (issueId: string, newStatus: Issue['status'], solution?: string, solutionImage?: { data: string; filename: string; thumbnail: string } | undefined) => void;
  onDelete: (issueId: string) => void;
  onViewDetails: (issue: Issue) => void;
}

const IssueTable: React.FC<IssueTableProps> = ({
  issues,
  onStatusChange,
  onDelete,
  onViewDetails,
}) => {
  const [closureModal, setClosureModal] = useState<ClosureModalState>({ isOpen: false });
  const [solutionText, setSolutionText] = useState('');
  const [closureImage, setClosureImage] = useState<{ data: string; filename: string; thumbnail: string } | null>(null);
  const [isProcessingClosureImage, setIsProcessingClosureImage] = useState(false);
  const [isConfirmingClosure, setIsConfirmingClosure] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Issue; direction: 'asc' | 'desc' }>({
    key: 'issueNumber',
    direction: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<Issue['status'] | 'All'>('All');

  // Filter and sort issues
  const filteredAndSortedIssues = issues
    .filter(issue => {
      const matchesSearch =
        issue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || issue.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

  const handleClosureConfirm = async (issueId: string) => {
    if (!solutionText.trim()) {
      alert('Please enter a solution description before closing');
      return;
    }
    setIsConfirmingClosure(true);
    try {
      onStatusChange(issueId, 'Closed', solutionText, closureImage || undefined);
      setClosureModal({ isOpen: false });
      setSolutionText('');
      setClosureImage(null);
    } finally {
      setIsConfirmingClosure(false);
    }
  };

  const handleClosureImage = async (file?: File | null) => {
    if (!file) return;
    try {
      setIsProcessingClosureImage(true);
      const { data, thumbnail } = await processImage(file);
      setClosureImage({ data, thumbnail, filename: file.name });
    } catch (e) {
      console.error('Failed to process closure image', e);
    } finally {
      setIsProcessingClosureImage(false);
    }
  };

  const handleStatusChange = (issueId: string, newStatus: Issue['status']) => {
    if (newStatus === 'Closed') {
      setClosureModal({ isOpen: true, issueId });
    } else {
      onStatusChange(issueId, newStatus);
    }
  };


  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by location or description..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as Issue['status'] | 'All')}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm font-medium transition-all cursor-pointer"
        >
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="Work Ongoing">Work Ongoing</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th
                className="px-6 py-4 text-left font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors text-sm"
                onClick={() =>
                  setSortConfig({
                    key: 'issueNumber',
                    direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
                  })
                }
              >
                # {sortConfig.key === 'issueNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-6 py-4 text-left font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors text-sm"
                onClick={() =>
                  setSortConfig({
                    key: 'location',
                    direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
                  })
                }
              >
                Location {sortConfig.key === 'location' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">Description</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">Images</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">Status</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedIssues.map(issue => (
              <tr
                key={issue.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 font-semibold text-gray-800 text-sm">#{issue.issueNumber}</td>
                <td className="px-6 py-4 text-gray-700">{issue.location}</td>
                <td className="px-6 py-4 text-gray-700 text-sm max-w-xs truncate">{issue.description}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {issue.shopDrawing?.thumbnail ? (
                      <ImagePreview thumbnail={issue.shopDrawing.thumbnail} fullSrc={issue.shopDrawing.data} alt="Shop Drawing" />
                    ) : (
                      <div className="w-16 h-12 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-500">
                        No image
                      </div>
                    )}
                    {issue.siteImage?.thumbnail ? (
                      <ImagePreview thumbnail={issue.siteImage.thumbnail} fullSrc={issue.siteImage.data} alt="Site Image" />
                    ) : null}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={issue.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <select
                      value={issue.status}
                      onChange={e =>
                        handleStatusChange(issue.id, e.target.value as Issue['status'])
                      }
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Open">Open</option>
                      <option value="Work Ongoing">Work Ongoing</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <button
                      onClick={() => onViewDetails(issue)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => onDelete(issue.id)}
                      className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredAndSortedIssues.map(issue => (
          <div
            key={issue.id}
            className="p-5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors bg-white"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-semibold text-gray-900 text-sm">Issue #{issue.issueNumber}</div>
                <div className="text-gray-600 text-sm mt-1">{issue.location}</div>
              </div>
              <StatusBadge status={issue.status} />
            </div>

            <p className="text-gray-700 text-sm mb-4">{issue.description}</p>

            <div className="flex gap-2 mb-4">
              {issue.shopDrawing?.thumbnail ? (
                <ImagePreview thumbnail={issue.shopDrawing.thumbnail} fullSrc={issue.shopDrawing.data} alt="Shop Drawing" thumbnailSize="small" />
              ) : (
                <div className="w-20 h-16 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-500">
                  No image
                </div>
              )}
              {issue.siteImage?.thumbnail ? (
                <ImagePreview thumbnail={issue.siteImage.thumbnail} fullSrc={issue.siteImage.data} alt="Site Image" thumbnailSize="small" />
              ) : null}
            </div>

            <div className="space-y-2">
              <select
                value={issue.status}
                onChange={e =>
                  handleStatusChange(issue.id, e.target.value as Issue['status'])
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Open">Open</option>
                <option value="Work Ongoing">Work Ongoing</option>
                <option value="Closed">Closed</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() => onViewDetails(issue)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Details
                </button>
                <button
                  onClick={() => onDelete(issue.id)}
                  className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedIssues.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-gray-500 font-medium text-sm">No issues found</p>
        </div>
      )}

      {/* Closure Modal */}
      {closureModal.isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
          onClick={() => !isConfirmingClosure && !isProcessingClosureImage && setClosureModal({ isOpen: false })}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Close Issue</h3>
            <p className="text-gray-600 text-sm mb-5">
              Provide a solution description before marking this issue as closed.
            </p>
            <textarea
              value={solutionText}
              onChange={e => setSolutionText(e.target.value)}
              placeholder="Describe the solution..."
              rows={4}
              disabled={isConfirmingClosure || isProcessingClosureImage}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none mb-4 text-sm disabled:opacity-50"
            />
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attach image <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => handleClosureImage(e.target.files?.[0] ?? null)}
                disabled={isProcessingClosureImage || isConfirmingClosure}
                className="w-full text-sm disabled:opacity-50"
              />
              {isProcessingClosureImage && (
                <div className="mt-3 flex justify-center">
                  <LoadingSpinner size="small" text="Processing..." />
                </div>
              )}
              {closureImage && !isProcessingClosureImage && (
                <div className="mt-3 flex items-center gap-3">
                  <img src={closureImage.thumbnail} alt="closure" className="w-16 h-12 object-cover rounded-md border border-gray-200" />
                  <div className="text-xs text-gray-600">{closureImage.filename}</div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setClosureModal({ isOpen: false })}
                disabled={isConfirmingClosure || isProcessingClosureImage}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleClosureConfirm(closureModal.issueId!)}
                disabled={isConfirmingClosure || isProcessingClosureImage}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
              >
                {isConfirmingClosure ? (
                  <>
                    <LoadingSpinner size="small" text="" />
                    <span>Closing...</span>
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueTable;
