"use client";

import { useState } from 'react';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { MeetingCalendar } from '../../components/meeting/MeetingCalendar';
import { ScheduleMeetingModal } from '../../components/meeting/scheduleMeetingModel';
import { useAuth } from '../../context/AuthContext';

export default function MeetingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  if (!user) return null;

  const currentId = user.id;


  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="text-primary-600" />
            Collaboration Hub
          </h1>
          <p className="text-gray-500">
            View your schedule and connect with {user.role === 'entrepreneur' ? 'investors' : 'entrepreneurs'}.
          </p>
        </div>
        
        <Button 
          variant="outline"
          leftIcon={<Plus size={18} />} 
          onClick={() => setIsModalOpen(true)}
          className="shadow-lg hover:shadow-primary-200 transition-all"
        >
          Schedule New Meeting
        </Button>
      </div>

      {/* The Calendar Component You Built */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
        <MeetingCalendar />
      </div>

      {/* The Scheduling Modal You Built */}
      <ScheduleMeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUserId={currentId}
      />
      
      {/* Quick Status Legend */}
      <div className="flex gap-6 justify-center text-sm font-medium text-gray-600 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#10b981] rounded-full" /> Accepted (Joinable)
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#f59e0b] rounded-full" /> Pending Review
        </div>
      </div>
    </div>
  );
}