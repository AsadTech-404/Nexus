export type UserRole = 'entrepreneur' | 'investor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  bio: string;
  isOnline?: boolean;
  createdAt: string;
}

export interface Entrepreneur extends User {
  role: 'entrepreneur';
  startupName: string;
  pitchSummary: string;
  fundingNeeded: string;
  industry: string;
  location: string;
  foundedYear: number;
  teamSize: number;
}

export interface Investor extends User {
  role: 'investor';
  investmentInterests: string[];
  investmentStage: string[];
  portfolioCompanies: string[];
  totalInvestments: number;
  minimumInvestment: string;
  maximumInvestment: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  otherUser?: {
    id: string;
    name: string;
    avatarUrl: string;
    isOnline: boolean;
  };
  lastMessageDate?: string;
  unreadMessagesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollaborationRequest {
  id: string;
  investorId: string;
  entrepreneurId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  url: string;
  ownerId: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  investorId: string;
  entrepreneurId: string;
  scheduledTime: string;
  endTime: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  location?: string;
  createdAt: string;
}

export interface Notification {
  id: string,
  userId: string,
  senderId: {
    id: string,
    name: string,
    avatarUrl: string,
  }
  type: "message" | "collaboration-request" | "collaboration-accepted" | "collaboration-rejected" | "meeting-scheduled" | "meeting-status";
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}


export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (userId: string, updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}