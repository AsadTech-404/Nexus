import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Bell,
  Calendar,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  Loader2,
} from "lucide-react";
import axios from "axios";

import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { InvestorCard } from "../../components/investor/InvestorCard";
import { CollaborationRequestCard } from "../../components/collaboration/CollaborationRequestCard";
import toast from "react-hot-toast";

// 1. Setup an Axios instance withCredentials if not already done globally
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

export const EntrepreneurDashboard: React.FC = () => {
  const { user } = useAuth();

  // 2. State management for backend data
  const [stats, setStats] = useState<any>(null);
  const [recommendedInvestors, setRecommendedInvestors] = useState<any[]>([]);
  const [collaborationRequests, setCollaborationRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Stats from the controller you just built
        const statsRes = await api.get("/dashboard/summary");
        setStats(statsRes.data.stats);

        // 2. Fetch Recommended Investors (Milestone 2/3)
        const investorsRes = await api.get("/user/investors");
        setRecommendedInvestors(investorsRes.data?.users || []);

        // 3. Fetch Collaboration Requests (Milestone 3)
        const requestsRes = await api.get("/collab/request");
        setCollaborationRequests(requestsRes.data?.collaborations || []);
      } catch (error) {
        console.error(error);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  },[user]);

  // Loading state UI
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 p-4 rounded-md text-error-700 flex items-center">
        <AlertCircle className="mr-2" /> {error}
      </div>
    );
  }

  const pendingRequests = collaborationRequests.filter(
    (request) => request.status === "pending",
  );

  const handleRequestStatusUpdate = async (requestId: string, status: string) => {
    try {
      await api.put(`/collab/${requestId}/update-status`, { status });
      setCollaborationRequests((prevRequests) =>
        prevRequests.map((request) =>
          request._id === requestId ? { ...request, status } : request,
        ),
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to update request status");
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name}
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your startup today
          </p>
        </div>

        <Link to="/investors">
          <Button leftIcon={<PlusCircle size={18} />}>Find Investors</Button>
        </Link>
      </div>

      {/* 4. Real Stats from Backend */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary-50 border-primary-100">
          <CardBody className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-full mr-4">
              <Bell size={20} className="text-primary-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-700">
                Pending Requests
              </p>
              <h3 className="text-xl font-semibold text-primary-900">
                {stats?.pendingRequests || 0}
              </h3>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-secondary-50 border-secondary-100">
          <CardBody className="flex items-center">
            <div className="p-3 bg-secondary-100 rounded-full mr-4">
              <Users size={20} className="text-secondary-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-700">
                Total Connections
              </p>
              <h3 className="text-xl font-semibold text-secondary-900">
                {stats?.totalConnections || 0}
              </h3>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-accent-50 border-accent-100">
          <CardBody className="flex items-center">
            <div className="p-3 bg-accent-100 rounded-full mr-4">
              <Calendar size={20} className="text-accent-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-accent-700">
                Upcoming Meetings
              </p>
              <h3 className="text-xl font-semibold text-accent-900">
                {stats?.upcomingMeetingsCount || 0}
              </h3>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-success-50 border-success-100">
          <CardBody className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <TrendingUp size={20} className="text-success-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-success-700">
                Profile Views
              </p>
              <h3 className="text-xl font-semibold text-success-900">
                {stats?.profileViews || 0}
              </h3>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Upcoming Meetings
              </h2>
              <Badge variant="primary">
                {stats?.meetings?.length || 0} scheduled
              </Badge>
            </CardHeader>
            <CardBody>
              {stats?.meetings?.length > 0 ? (
                <div className="space-y-4">
                  {stats.meetings.map((meeting: any) => (
                    <div
                      key={meeting.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <p className="font-medium">{meeting.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(meeting.scheduledTime).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 italic">
                    No meetings scheduled this week.
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
           <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Collaboration Requests
              </h2>
              <Badge variant="primary">{pendingRequests.length} pending</Badge>
            </CardHeader>

            <CardBody>
              {collaborationRequests.length > 0 ? (
                <div className="space-y-4">
                  {collaborationRequests.map((request) => (
                    <CollaborationRequestCard
                      key={request._id}
                      request={request}
                      onStatusUpdate={handleRequestStatusUpdate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <AlertCircle size={24} className="text-gray-500" />
                  </div>
                  <p className="text-gray-600">No collaboration requests yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    When investors are interested in your startup, their
                    requests will appear here
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Recommended Investors
              </h2>
              <Link
                to="/investors"
                className="text-sm font-medium text-primary-600"
              >
                View all
              </Link>
            </CardHeader>
            <CardBody className="space-y-4">
              {recommendedInvestors.map((investor) => (
                <InvestorCard
                  key={investor.id}
                  investor={investor}
                  showActions={false}
                />
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
