import { useState, useCallback, useMemo } from 'react';

// TODO: Replace with actual API endpoints when available in backend
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'trip_assigned',
      title: 'New Trip Assigned',
      description: 'You have been assigned to trip TRP-2023-01.',
      time: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
      isRead: false,
      category: 'Trips'
    },
    {
      id: '2',
      type: 'vehicle_maintenance',
      title: 'Maintenance Due',
      description: 'Vehicle GJ01AB1234 is due for regular maintenance.',
      time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      isRead: false,
      category: 'Maintenance'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const fetchNotifications = useCallback(async () => {
    // TODO: Implement actual API call
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const markAsRead = useCallback(async (id) => {
    // TODO: Implement actual API call
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }, []);

  const markAsUnread = useCallback(async (id) => {
    // TODO: Implement actual API call
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: false } : n)
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    // TODO: Implement actual API call
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchesSearch = search === '' || n.title.toLowerCase().includes(search.toLowerCase()) || n.description.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'All' || 
                           (filter === 'Unread' && !n.isRead) ||
                           n.category === filter;
      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, filter]);

  return {
    notifications: filteredNotifications,
    loading,
    unreadCount,
    filter,
    setFilter,
    search,
    setSearch,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead
  };
};
