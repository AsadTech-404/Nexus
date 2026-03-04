import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ExternalLink } from 'lucide-react';
import { Investor } from '../../types';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface InvestorCardProps {
  investor: Investor;
  showActions?: boolean;
}

export const InvestorCard: React.FC<InvestorCardProps> = ({
  investor,
  showActions = true
}) => {
  const navigate = useNavigate();
  
  const handleViewProfile = () => {
    // Add safety check just in case investor ID is missing
    if (investor?.id) navigate(`/profile/investor/${investor.id}`);
  };
  
  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (investor?.id) navigate(`/chat/${investor.id}`);
  };
  
  // 🚀 Safe Data Extraction: Defaults to empty arrays if undefined
  const investmentStages = investor?.investmentStage || [];
  const investmentInterests = investor?.investmentInterests || [];
  
  return (
    <Card 
      hoverable 
      className="transition-all duration-300 h-full"
      onClick={handleViewProfile}
    >
      <CardBody className="flex flex-col">
        <div className="flex items-start">
          <Avatar
            src={investor?.avatarUrl || "https://via.placeholder.com/150"}
            alt={investor?.name || "Unknown"}
            size="lg"
            status={investor?.isOnline ? 'online' : 'offline'}
            className="mr-4"
          />
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {investor?.name || "Unknown Investor"}
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              Investor • {investor?.totalInvestments || 0} investments
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {/* 🚀 Safe Map: Will just be empty if no stages exist */}
              {investmentStages.length > 0 ? (
                investmentStages.map((stage, index) => (
                  <Badge key={index} variant="secondary" size="sm">{stage}</Badge>
                ))
              ) : (
                <span className="text-xs text-gray-400">No stages listed</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-900 mb-1">Investment Interests</h4>
          <div className="flex flex-wrap gap-2">
            {/* 🚀 Safe Map: Displays fallback text if empty */}
            {investmentInterests.length > 0 ? (
              investmentInterests.map((interest, index) => (
                <Badge key={index} variant="primary" size="sm">{interest}</Badge>
              ))
            ) : (
              <span className="text-xs text-gray-400">No interests listed</span>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600 line-clamp-2">
            {investor?.bio || "This investor hasn't added a bio yet."}
          </p>
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          <div>
            <span className="text-xs text-gray-500">Investment Range</span>
            <p className="text-sm font-medium text-gray-900">
              {investor?.minimumInvestment || 'N/A'} - {investor?.maximumInvestment || 'N/A'}
            </p>
          </div>
        </div>
      </CardBody>
      
      {showActions && (
        <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-between">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<MessageCircle size={16} />}
            onClick={handleMessage}
            disabled={!investor?.id}
          >
            Message
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            rightIcon={<ExternalLink size={16} />}
            onClick={handleViewProfile}
            disabled={!investor?.id}
          >
            View Profile
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};