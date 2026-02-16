import React, { useState, useEffect, useCallback } from 'react';
import { activityApi } from '../../api/activityApi';
import Avatar from '../common/Avatar';
import { ACTION_LABELS } from '../../utils/constants';
import { timeAgo } from '../../utils/helpers';
import Loader from '../common/Loader';
import './ActivityFeed.css';

const ActivityFeed = ({ boardId, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = useCallback(async (pageNum) => {
    try {
      setIsLoading(true);
      const response = await activityApi.getActivities({
        boardId,
        page: pageNum,
        limit: 20
      });
      const data = response.data;
      if (pageNum === 1) {
        setActivities(data.data);
      } else {
        setActivities(prev => [...prev, ...data.data]);
      }
      setHasMore(data.pagination.page < data.pagination.pages);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchActivities(1);
  }, [fetchActivities]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchActivities(nextPage);
  };

  return (
    <div className="activity-sidebar">
      <div className="activity-header">
        <h3>Activity</h3>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
      </div>
      <div className="activity-list">
        {activities.map(activity => (
          <div key={activity._id} className="activity-item">
            <Avatar
              name={activity.user?.name}
              src={activity.user?.avatar}
              size={28}
            />
            <div className="activity-details">
              <p className="activity-text">
                <strong>{activity.user?.name}</strong>
                {' '}
                {ACTION_LABELS[activity.action] || activity.action}
                {activity.entityTitle && (
                  <span className="activity-entity"> "{activity.entityTitle}"</span>
                )}
              </p>
              <span className="activity-time">{timeAgo(activity.createdAt)}</span>
            </div>
          </div>
        ))}
        {isLoading && <Loader size={24} />}
        {hasMore && !isLoading && (
          <button className="btn btn-ghost activity-load-more" onClick={loadMore}>
            Load more
          </button>
        )}
        {!hasMore && activities.length > 0 && (
          <p className="text-sm text-muted text-center" style={{ padding: 12 }}>
            No more activities
          </p>
        )}
        {!isLoading && activities.length === 0 && (
          <p className="text-sm text-muted text-center" style={{ padding: 20 }}>
            No activities yet
          </p>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;