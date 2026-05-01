import { useState } from 'react';
import './App.css';
import IssueTable from './components/IssueTable';
import AddIssueModal from './components/AddIssueModal';
import IssueDetailsModal from './components/IssueDetailsModal';
import LoadingSpinner from './components/LoadingSpinner';
import { useIssueStorage } from './hooks/useIssueStorage';
import { Issue } from './types/index';
import logo from './assets/download.png';
import PasskeyGate from './components/PasskeyGate';

function App() {
  const { issues, isLoading, addIssue, updateIssue, deleteIssue } = useIssueStorage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleStatusChange = (issueId: string, newStatus: Issue['status'], solution?: string, solutionImage?: { data: string; filename: string; thumbnail: string } | undefined) => {
    const updates: Partial<Issue> = { status: newStatus };
    if (newStatus === 'Closed' && solution) {
      updates.solution = solution;
      updates.closedAt = new Date().toISOString();
      if (solutionImage) updates.solutionImage = solutionImage;
    }
    updateIssue(issueId, updates);
  };

  const handleViewDetails = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsDetailsModalOpen(true);
  };

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'Open').length,
    ongoing: issues.filter(i => i.status === 'Work Ongoing').length,
    closed: issues.filter(i => i.status === 'Closed').length,
  };

  if (!isAuthenticated) {
    return <PasskeyGate onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 z-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="ELV Logo"
                className="w-9 h-9 object-contain"
              />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  ELV Site Issue Tracker
                </h1>
                <p className="text-gray-500 text-xs mt-0.5">
                  ICAD Ocenarium Project
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
            >
              + Add Issue
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="text-3xl font-semibold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-2 font-medium">Total Issues</div>
          </div>
          <div className="bg-red-50 rounded-xl p-6 text-center border border-red-100 hover:border-red-200 transition-colors">
            <div className="text-3xl font-semibold text-red-600">{stats.open}</div>
            <div className="text-xs text-red-600 mt-2 font-medium">Open</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-6 text-center border border-amber-100 hover:border-amber-200 transition-colors">
            <div className="text-3xl font-semibold text-amber-600">{stats.ongoing}</div>
            <div className="text-xs text-amber-600 mt-2 font-medium">In Progress</div>
          </div>
          <div className="bg-green-50 rounded-xl p-6 text-center border border-green-100 hover:border-green-200 transition-colors">
            <div className="text-3xl font-semibold text-green-600">{stats.closed}</div>
            <div className="text-xs text-green-600 mt-2 font-medium">Closed</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner size="large" message="Loading issues..." />
            </div>
          ) : (
            <IssueTable
              issues={issues}
              onStatusChange={handleStatusChange}
              onDelete={deleteIssue}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <AddIssueModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addIssue}
      />

      <IssueDetailsModal
        issue={selectedIssue}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedIssue(null);
        }}
      />
    </div>
  );
}

export default App;
