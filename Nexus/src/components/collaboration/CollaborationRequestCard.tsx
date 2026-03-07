import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, MessageCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

import { Card, CardBody, CardFooter } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

// Setup axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true
});

interface CollaborationRequestCardProps {
  request: any; // Using any for now to match MongoDB's populated structure
  onStatusUpdate?: (requestId: string, status: 'accepted' | 'rejected') => void;
}

export const CollaborationRequestCard: React.FC<CollaborationRequestCardProps> = ({
  request,
  onStatusUpdate
}) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);

  // In a real backend, 'investorId' is often populated into an object
  const investor = request.otherUser;
  
  if (!investor) return null;

  const handleUpdateStatus = async (newStatus: 'accepted' | 'rejected') => {
    try {
      setIsUpdating(true);
      // 1. Hit your real backend endpoint
      const response = await api.patch(`/collab/${request._id}/update-status`, { 
        status: newStatus 
      });

      if (response.data.success && onStatusUpdate) {
        onStatusUpdate(request._id, newStatus);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Could not update request status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = () => {
    switch (request.status) {
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'accepted': return <Badge variant="success">Accepted</Badge>;
      case 'rejected': return <Badge variant="error">Declined</Badge>;
      default: return null;
    }
  };

  return (
    <Card className={`transition-all duration-300 ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
      <CardBody className="flex flex-col">
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <Avatar
              src={investor.avatarUrl}
              alt={investor.name}
              size="md"
              status={investor.isOnline ? 'online' : 'offline'}
              className="mr-3"
            />
            <div>
              <h3 className="text-md font-semibold text-gray-900">{investor.name}</h3>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge()}
            {isUpdating && <Loader2 size={16} className="animate-spin text-primary-600" />}
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600">{request.message}</p>
        </div>
      </CardBody>
      
      <CardFooter className="border-t border-gray-100 bg-gray-50">
        <div className="flex justify-between w-full">
          {request.status === 'pending' ? (
            <>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<X size={16} />}
                  onClick={() => handleUpdateStatus('rejected')}
                >
                  Decline
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  leftIcon={<Check size={16} />}
                  onClick={() => handleUpdateStatus('accepted')}
                >
                  Accept
                </Button>
              </div>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<MessageCircle size={16} />}
                onClick={() => navigate(`/chat/${investor.id || investor._id}`)}
              >
                Message
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<MessageCircle size={16} />}
                onClick={() => navigate(`/chat/${investor.id || investor._id}`)}
              >
                Message
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/profile/investor/${investor.id || investor._id}`)}
              >
                View Profile
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};