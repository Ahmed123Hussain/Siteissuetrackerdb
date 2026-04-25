import { useState } from 'react';
import './App.css';
import IssueTable from './components/IssueTable';
import AddIssueModal from './components/AddIssueModal';
import IssueDetailsModal from './components/IssueDetailsModal';
import { useIssueStorage } from './hooks/useIssueStorage';
import { Issue } from './types/index';
import logo from './assets/download.png';
import PasskeyGate from './components/PasskeyGate';

function App() {
  const { issues, addIssue, updateIssue, deleteIssue } = useIssueStorage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleStatusChange = (issueId: string, newStatus: Issue['status'], solution?: string) => {
    const updates: Partial<Issue> = { status: newStatus };
    if (newStatus === 'Closed' && solution) {
      updates.solution = solution;
      updates.closedAt = new Date().toISOString();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-soft sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
  <img
    src={logo}
    alt="ELV Logo"
    className="w-10 h-10 object-contain rounded-md"
  />

  <div>
    <h1 className="text-3xl font-bold text-gray-900 leading-tight">
      ELV Site Issue Tracker
    </h1>
    <p className="text-gray-600 text-sm mt-1">
      <b>ICAD Ocenarium Project<b>
    </p>
  </div>
</div>
             
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-soft hover:shadow-soft-md transition-all inline-flex items-center gap-2"
            >
              <span>+</span>
              <span>Add Issue</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-soft p-6 text-center">
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600 mt-2">Total Issues</div>
          </div>
          <div className="bg-white rounded-xl shadow-soft p-6 text-center border-l-4 border-red-500">
            <div className="text-3xl font-bold text-red-600">{stats.open}</div>
            <div className="text-sm text-gray-600 mt-2">Open</div>
          </div>
          <div className="bg-white rounded-xl shadow-soft p-6 text-center border-l-4 border-orange-500">
            <div className="text-3xl font-bold text-orange-600">{stats.ongoing}</div>
            <div className="text-sm text-gray-600 mt-2">In Progress</div>
          </div>
          <div className="bg-white rounded-xl shadow-soft p-6 text-center border-l-4 border-green-500">
            <div className="text-3xl font-bold text-green-600">{stats.closed}</div>
            <div className="text-sm text-gray-600 mt-2">Closed</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <IssueTable
            issues={issues}
            onStatusChange={handleStatusChange}
            onDelete={deleteIssue}
            onViewDetails={handleViewDetails}
          />
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
