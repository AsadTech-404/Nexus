import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, MessageCircle, Video, Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

import { Card, CardBody, CardFooter } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true
});

interface MeetingCardProps {
  meeting: any;
  onStatusUpdate?: (meetingId: string, status: 'accepted' | 'rejected') => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  onStatusUpdate
}) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);

  // Assuming your backend populates the investor's details into investorId
  const otherUser = meeting.investorId; 
  
  if (!otherUser) return null;

  const handleUpdateStatus = async (newStatus: 'accepted' | 'rejected') => {
    try {
      setIsUpdating(true);
      // Ensure this endpoint matches your actual backend route for updating meeting status
      const response = await api.patch(`/meeting/${meeting._id}/update-status`, { 
        status: newStatus 
      });

      if (response.data.success && onStatusUpdate) {
        onStatusUpdate(meeting._id, newStatus);
      }
    } catch (error) {
      console.error("Failed to update meeting status:", error);
      alert("Could not update meeting status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = () => {
    switch (meeting.status) {
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'accepted': return <Badge variant="success">Scheduled</Badge>;
      case 'rejected': return <Badge variant="error">Declined</Badge>;
      case 'completed': return <Badge variant="primary">Completed</Badge>;
      default: return null;
    }
  };

  // Format the date nicely
  const meetingDate = new Date(meeting.scheduledTime);
  const formattedDate = format(meetingDate, 'MMM d, yyyy');
  const formattedTime = format(meetingDate, 'h:mm a');

  return (
    <Card className={`transition-all duration-300 ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
      <CardBody className="flex flex-col">
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <Avatar
              src={otherUser.avatarUrl}
              alt={otherUser.name}
              size="md"
              status={otherUser.isOnline ? 'online' : 'offline'}
              className="mr-3"
            />
            <div>
              <h3 className="text-md font-semibold text-gray-900">{otherUser.name}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Calendar size={14} />
                {formattedDate} at {formattedTime}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge()}
            {isUpdating && <Loader2 size={16} className="animate-spin text-primary-600" />}
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-100">
          <p className="text-sm font-medium text-gray-800">Topic: {meeting.title}</p>
          {meeting.description && (
             <p className="text-sm text-gray-600 mt-1">{meeting.description}</p>
          )}
        </div>
      </CardBody>
      
      <CardFooter className="border-t border-gray-100 bg-gray-50">
        <div className="flex justify-between w-full">
          {meeting.status === 'pending' ? (
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
                onClick={() => navigate(`/chat/${otherUser.id || otherUser._id}`)}
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
                onClick={() => navigate(`/chat/${otherUser.id || otherUser._id}`)}
              >
                Message
              </Button>
              {meeting.status === 'accepted' && meeting.meetingLink && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Video size={16} />}
                  onClick={() => window.open(meeting.meetingLink, '_blank')}
                >
                  Join Meeting
                </Button>
              )}
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};