import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Loader2, Video } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Axios instance configuration
const api = axios.create({ baseURL: 'http://localhost:8000/api', withCredentials: true });

export const MeetingCalendar: React.FC = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Meetings  
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await api.get('/meeting/all-meetings'); 
        if (res.data.success) {
          // Transform backend data to FullCalendar format
          const formattedEvents = res.data.meetings.map((m: any) => ({
            id: m._id,
            title: m.title,
            start: m.scheduledTime,
            end: m.endTime,
            backgroundColor: m.status === 'accepted' ? '#10b981' : '#f59e0b', // Green for accepted, Yellow for pending
            extendedProps: { ...m }
          }));
          setEvents(formattedEvents);
        }
      } catch (err) {
        toast.error("Failed to load calendar events.");
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  const handleEventClick = (info: any) => {
    const meeting = info.event.extendedProps;
    if (meeting.status === 'accepted') {
      toast(`Joining meeting: ${meeting.title}`, { icon: <Video className="text-primary-600" /> });
      // This links Video Calling
      window.location.href = `/video-call/${meeting._id}`;
    } else {
      toast.error("This meeting is not yet accepted.");
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Collaboration Schedule</h2>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-full" /> Accepted</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-500 rounded-full" /> Pending</span>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            eventClick={handleEventClick}
            height="auto"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek'
            }}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: 'short'
            }}
          />
        </div>
      </CardBody>
    </Card>
  );
};