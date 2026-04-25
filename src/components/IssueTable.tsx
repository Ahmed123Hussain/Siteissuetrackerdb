import React, { useState } from 'react';
import { Issue, ClosureModalState } from '../types/index';
import StatusBadge from './StatusBadge';
import ImagePreview from './ImagePreview';

interface IssueTableProps {
  issues: Issue[];
  onStatusChange: (issueId: string, newStatus: Issue['status'], solution?: string) => void;
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

  const handleClosureConfirm = (issueId: string) => {
    if (!solutionText.trim()) {
      alert('Please enter a solution description before closing');
      return;
    }
    onStatusChange(issueId, 'Closed', solutionText);
    setClosureModal({ isOpen: false });
    setSolutionText('');
  };

  const handleStatusChange = (issueId: string, newStatus: Issue['status']) => {
    if (newStatus === 'Closed') {
      setClosureModal({ isOpen: true, issueId });
    } else {
      onStatusChange(issueId, newStatus);
    }
  };


  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by location or description..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as Issue['status'] | 'All')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="Work Ongoing">Work Ongoing</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto shadow-soft rounded-xl">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
              <th
                className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-700"
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
                className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-700"
                onClick={() =>
                  setSortConfig({
                    key: 'location',
                    direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
                  })
                }
              >
                Location {sortConfig.key === 'location' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4 text-left font-semibold">Description</th>
              <th className="px-6 py-4 text-left font-semibold">Images</th>
              <th className="px-6 py-4 text-left font-semibold">Status</th>
              <th className="px-6 py-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedIssues.map(issue => (
              <tr
                key={issue.id}
                className={`hover:bg-gray-50 transition-colors ${
                  issue.status === 'Closed' ? 'bg-green-50' : ''
                }`}
              >
                <td className="px-6 py-4 font-semibold text-gray-800">#{issue.issueNumber}</td>
                <td className="px-6 py-4 text-gray-700">{issue.location}</td>
                <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{issue.description}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {issue.shopDrawing?.thumbnail && (
  <ImagePreview src={issue.shopDrawing.thumbnail} alt="Shop Drawing" />
)}
                    {issue.siteImage?.thumbnail && (
  <ImagePreview src={issue.siteImage.thumbnail} alt="Site Image" />
)}
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
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Open">Open</option>
                      <option value="Work Ongoing">Work Ongoing</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <button
                      onClick={() => onViewDetails(issue)}
                      className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => onDelete(issue.id)}
                      className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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
      <div className="md:hidden space-y-4">
        {filteredAndSortedIssues.map(issue => (
          <div
            key={issue.id}
            className={`p-4 rounded-xl border-2 border-gray-200 shadow-soft hover:shadow-soft-md transition-all ${
              issue.status === 'Closed' ? 'bg-green-50 border-green-300' : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-bold text-gray-800">Issue #{issue.issueNumber}</div>
                <div className="text-sm text-gray-600">{issue.location}</div>
              </div>
              <StatusBadge status={issue.status} />
            </div>

            <p className="text-gray-700 text-sm mb-3">{issue.description}</p>

            <div className="flex gap-2 mb-3">
              <ImagePreview src={issue.shopDrawing.thumbnail} alt="Shop Drawing" thumbnailSize="small" />
              {issue.siteImage && (
                <ImagePreview src={issue.siteImage.thumbnail} alt="Site Image" thumbnailSize="small" />
              )}
            </div>

            <div className="space-y-2">
              <select
                value={issue.status}
                onChange={e =>
                  handleStatusChange(issue.id, e.target.value as Issue['status'])
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Open">Open</option>
                <option value="Work Ongoing">Work Ongoing</option>
                <option value="Closed">Closed</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() => onViewDetails(issue)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Details
                </button>
                <button
                  onClick={() => onDelete(issue.id)}
                  className="flex-1 px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedIssues.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-600 font-semibold">No issues found</p>
        </div>
      )}

      {/* Closure Modal */}
      {closureModal.isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
          onClick={() => setClosureModal({ isOpen: false })}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Close Issue</h3>
            <p className="text-gray-600 mb-4">
              Please provide a solution description before marking this issue as closed.
            </p>
            <textarea
              value={solutionText}
              onChange={e => setSolutionText(e.target.value)}
              placeholder="Describe the solution..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setClosureModal({ isOpen: false })}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleClosureConfirm(closureModal.issueId!)}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Confirm Closure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueTable;
