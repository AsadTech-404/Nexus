import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  PieChart,
  Filter,
  Search,
  PlusCircle,
  Loader2,
  Calendar,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { EntrepreneurCard } from "../../components/entrepreneur/EntrepreneurCard";
import { useAuth } from "../../context/AuthContext";
import { Entrepreneur } from "../../types";
import { getRequestsFromInvestor } from "../../data/collaborationRequests";
import axios from "axios";
import toast from "react-hot-toast";

// 1. Setup an Axios instance withCredentials if not already done globally
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

export const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null); // To store dashboard summary
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [loading, setLoading] = useState(true);

  if (!user) return null;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Stats from the controller you just built
        const statsRes = await api.get("/dashboard/summary");
        setStats(statsRes.data.stats);

        // 2. Fetch Entrepreneurs list (Milestone 2/3)
        const entRes = await api.get("/user/entrepreneurs");
        setEntrepreneurs(entRes.data?.users || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  // Get collaboration requests sent by this investor
  const sentRequests = getRequestsFromInvestor(user.id);
  const requestedEntrepreneurIds = sentRequests.map(
    (req) => req.entrepreneurId,
  );

  // Filter entrepreneurs based on search and industry filters
  const filteredEntrepreneurs = (entrepreneurs || []).filter((entrepreneur) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      entrepreneur.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.startupName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      entrepreneur.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.pitchSummary
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // Industry filter
    const matchesIndustry =
      selectedIndustries.length === 0 ||
      selectedIndustries.includes(entrepreneur.industry);

    return matchesSearch && matchesIndustry;
  });

  // Get unique industries for filter
  const industries = Array.from(new Set((entrepreneurs || []).map((e) => e.industry)));

  // Toggle industry selection
  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prevSelected) =>
      prevSelected.includes(industry)
        ? prevSelected.filter((i) => i !== industry)
        : [...prevSelected, industry],
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Discover Startups
          </h1>
          <p className="text-gray-600">
            Find and connect with promising entrepreneurs
          </p>
        </div>

        <Link to="/entrepreneurs">
          <Button leftIcon={<PlusCircle size={18} />}>View All Startups</Button>
        </Link>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <Input
            placeholder="Search startups, industries, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            startAdornment={<Search size={18} />}
          />
        </div>

        <div className="w-full md:w-1/3">
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Filter by:
            </span>

            <div className="flex flex-wrap gap-2">
              {industries.map((industry, index) => (
                <Badge
                  key={`${index}-${industry}`}
                  variant={
                    selectedIndustries.includes(industry) ? "primary" : "gray"
                  }
                  className="cursor-pointer"
                  onClick={() => toggleIndustry(industry)}
                >
                  {industry || "Uncategorized"}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Total Startups on Platform */}
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full mr-4">
                <Users size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">
                  Total Startups
                </p>
                {/* Use backend stat: platformStartups */}
                <h3 className="text-xl font-semibold text-primary-900">
                  {stats?.platformStartups || 0}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>
        {/* 3. Industries */}
        <Card className="bg-accent-50 border-accent-100">
          <CardBody className="flex items-center">
            <div className="p-3 bg-emerald-100 rounded-full mr-4">
              <PieChart size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800/80">
                Industries
              </p>
              <h3 className="text-xl font-semibold text-accent-900">
                {stats?.industries || 0}
              </h3>
            </div>
          </CardBody>
        </Card>
        {/* 2. Your Active Connections */}
        <Card className="bg-accent-50 border border-accent-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-full mr-4">
                <Users size={20} className="text-accent-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-700">
                  Your Connections
                </p>
                {/* Use backend stat: totalConnections */}
                <h3 className="text-xl font-semibold text-accent-900">
                  {stats?.totalConnections || 0}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Entrepreneurs grid */}
      <div>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">
              Featured Startups
            </h2>
          </CardHeader>

          <CardBody>
            {filteredEntrepreneurs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEntrepreneurs.map((entrepreneur) => (
                  <EntrepreneurCard
                    key={entrepreneur.id}
                    entrepreneur={entrepreneur}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No startups match your filters</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedIndustries([]);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
