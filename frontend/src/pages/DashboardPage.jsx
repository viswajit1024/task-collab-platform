import React, { useEffect, useState, useCallback } from 'react';
import { useBoard } from '../hooks/useBoard';
import { useSocketConnection } from '../hooks/useSocket';
import BoardList from '../components/boards/BoardList';
import CreateBoardModal from '../components/boards/CreateBoardModal';
import SearchBar from '../components/common/SearchBar';
import Loader from '../components/common/Loader';
import './DashboardPage.css';

const DashboardPage = () => {
  const { boards, pagination, isLoading, fetchBoards } = useBoard();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize socket connection
  useSocketConnection();

  useEffect(() => {
    fetchBoards({ page: currentPage, search: searchQuery });
  }, [fetchBoards, currentPage, searchQuery]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Your Boards</h1>
            <p className="dashboard-subtitle">
              {pagination ? `${pagination.total} board${pagination.total !== 1 ? 's' : ''}` : ''}
            </p>
          </div>
          <div className="dashboard-actions">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search boards..."
            />
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              + Create Board
            </button>
          </div>
        </div>

        {isLoading && !boards.length ? (
          <Loader />
        ) : (
          <>
            <BoardList
              boards={boards}
              onCreateClick={() => setShowCreateModal(true)}
            />

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="dashboard-pagination">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  ← Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage >= pagination.pages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <CreateBoardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default DashboardPage;