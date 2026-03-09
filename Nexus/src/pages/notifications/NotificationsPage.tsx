import React, { useEffect, useState } from 'react';
import { Bell, MessageCircle, UserPlus, DollarSign, Trash2 } from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
// Note: Ensure your Notification type includes both id and _id if using MongoDB
import { Notification } from '../../types'; 
import toast from 'react-hot-toast';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true
});

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Notifications
  useEffect(() => {
    if (!user) return;
    
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notification/notifications');
        setNotifications(res.data.notifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle Mark All As Read
  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notification/read-all');
      
      // Update local state to reflect changes instantly
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, unread: false }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  // Handle Mark Single Notification As Read
  const handleMarkAsRead = async (id: string, unread: boolean) => {
    if (!unread) return; // Don't call API if already read
    
    try {
      await api.put(`/notification/${id}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          (notif.id === id || notif.id === id) ? { ...notif, unread: false } : notif
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Optional: Handle Delete Notification
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent triggering the mark-as-read click
    try {
      await api.delete(`/notification/${id}`);
      setNotifications(prev => prev.filter(notif => notif.id !== id && notif.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle size={16} className="text-primary-600" />;
      case 'connection':
        return <UserPlus size={16} className="text-secondary-600" />;
      case 'investment':
        return <DollarSign size={16} className="text-accent-600" />;
      default:
        return <Bell size={16} className="text-gray-600" />;
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading notifications...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with your network activity</p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleMarkAllAsRead}
          disabled={notifications.every(n => !n.isRead)}
        >
          Mark all as read
        </Button>
      </div>
      
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p>You have no new notifications.</p>
          </div>
        ) : (
          notifications.map(notification => {
            const id = notification.id;
            
            return (
              <Card
                key={id}
                onClick={() => handleMarkAsRead(id, notification.isRead)}
                className={`transition-colors duration-200 cursor-pointer hover:bg-gray-50 ${
                  notification.isRead ? 'bg-primary-50 border-primary-100' : ''
                }`}
              >
                <CardBody className="flex items-start p-4">
                  <Avatar
                    src={notification.userId === user?.id ? user?.avatarUrl || '' : ''}
                    alt={notification.userId === user?.id ? user?.name || 'User' : 'Someone'}
                    size="md"
                    className="flex-shrink-0 mr-4"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {notification.userId === user?.id ? 'You' : notification.userId === user?.id ? user?.name || 'Someone' : ''}
                        </span>
                        {notification.isRead && (
                          <Badge variant="primary" size="sm" rounded>New</Badge>
                        )}
                      </div>
                      
                      {/* Delete Button */}
                      <button 
                        onClick={(e) => handleDelete(e, id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <p className="text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      {getNotificationIcon(notification.type)}
                      <span>{new Date(notification.createdAt || notification.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};