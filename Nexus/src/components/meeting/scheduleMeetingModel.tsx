import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { MapPin, X, Loader2 } from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  investorId?: string; 
  entrepreneurId?: string;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({ 
  isOpen, onClose, investorId, entrepreneurId 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: 'Video Call',
    scheduledTime: new Date(),
    endTime: new Date(new Date().getTime() + 30 * 60000), // Default 30 mins
  });

  // if (!isOpen) return null;

  useEffect(() => {
    if (isOpen && user?.role !== "investor") {
      toast.error("Only investors can schedule meetings.");
      onClose(); // Automatically close the modal
    }
  }, [isOpen, user?.role, onClose]);

  // If not open or not an investor, return null (renders nothing)
  if (!isOpen || user?.role !== "investor") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8000/api/meeting/schedule', {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        scheduledTime: formData.scheduledTime.toISOString(),
        endTime: formData.endTime.toISOString(),
        investorId,
        entrepreneurId,
      }, { withCredentials: true });

      if (res.data.success) {
        toast.success("Meeting scheduled successfully.");
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Conflict detected or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Schedule Meeting</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Meeting Title</label>
            <input 
              required
              className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Pitch Deck Review"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <DatePicker
                selected={formData.scheduledTime}
                onChange={(date: Date | null) => setFormData({...formData, scheduledTime: date || new Date()})}
                showTimeSelect
                dateFormat="Pp"
                className="mt-1 w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <DatePicker
                selected={formData.endTime}
                onChange={(date: Date | null) => setFormData({...formData, endTime: date || new Date()})}
                showTimeSelect
                dateFormat="Pp"
                minDate={formData.scheduledTime}
                className="mt-1 w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location/Link</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
              <input 
                className="mt-1 w-full pl-10 p-2 border rounded-lg"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <Button type="submit" className="w-full py-3" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Confirm Schedule"}
          </Button>
        </form>
      </div>
    </div>
  );
};