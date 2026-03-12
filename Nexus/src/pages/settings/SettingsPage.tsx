import React, { useState } from "react";
import { User, Lock, Bell, Globe, Palette } from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  // 1. Initialize with a default tab
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) return null;

  // 2. Navigation items helper to keep code clean
  const navItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "language", label: "Language", icon: Globe },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings navigation */}
        <Card className="lg:col-span-1">
          <CardBody className="p-2">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === item.id
                      ? "text-primary-700 bg-primary-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon size={18} className="mr-3" />
                  {item.label}
                </button>
              ))}
            </nav>
          </CardBody>
        </Card>

        {/* Main settings content */}
        <div className="lg:col-span-3 space-y-6">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">
                  Profile Settings
                </h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar src={user.avatarUrl} alt={user.name} size="xl" />
                  <div>
                    <Button variant="outline" size="sm">
                      Change Photo
                    </Button>
                    <p className="mt-2 text-sm text-gray-500">
                      JPG, GIF or PNG. Max size of 800K
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Full Name" defaultValue={user.name} />
                  <Input label="Email" type="email" defaultValue={user.email} />
                  <Input label="Role" value={user.role} disabled />
                  <Input label="Location" defaultValue="San Francisco, CA" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    rows={4}
                    defaultValue={user.bio}
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </div>
              </CardBody>
            </Card>
          )}
          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">
                  Security Settings
                </h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Two-Factor Authentication
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security to your account
                      </p>
                      <Badge variant="error" className="mt-1">
                        Not Enabled
                      </Badge>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <Input label="Current Password" type="password" />
                    <Input label="New Password" type="password" />
                    <Input label="Confirm New Password" type="password" />
                    <div className="flex justify-end">
                      <Button>Update Password</Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">
                  Notification Preferences
                </h2>
              </CardHeader>
              <CardBody className="space-y-8">
                {/* Group 1: Activity */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Activity
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        id: "notif-1",
                        title: "Meeting Reminders",
                        desc: "Get notified when a meeting is about to start.",
                      },
                      {
                        id: "notif-2",
                        title: "Collaboration Requests",
                        desc: "Alerts for new investment or partnership requests.",
                      },
                      {
                        id: "notif-3",
                        title: "Message Alerts",
                        desc: "Notifications for new direct messages.",
                      },
                    ].map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Group 2: Marketing */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Marketing
                  </h3>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Newsletter & Updates
                      </p>
                      <p className="text-xs text-gray-500">
                        Occasional news about product features and events.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
          {/* LANGUAGE TAB */}
          {activeTab === "language" && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">
                  Language & Region
                </h2>
                <p className="text-sm text-gray-500">
                  Set your preferred language and local time settings.
                </p>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interface Language
                    </label>
                    <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                      <option>English (US)</option>
                      <option>English (UK)</option>
                      <option>Urdu</option>
                      <option>Spanish</option>
                      <option>German</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                      <option>(GMT+05:00) Karachi, Islamabad</option>
                      <option>(GMT-08:00) Pacific Time</option>
                      <option>(GMT+00:00) UTC / London</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Date and Number Formats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Date format</span>
                      <select className="text-sm border-none bg-transparent font-medium text-primary-600 focus:ring-0 cursor-pointer">
                        <option>DD/MM/YYYY</option>
                        <option>MM/DD/YYYY</option>
                        <option>YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        First day of week
                      </span>
                      <select className="text-sm border-none bg-transparent font-medium text-primary-600 focus:ring-0 cursor-pointer">
                        <option>Monday</option>
                        <option>Sunday</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button>Update Preferences</Button>
                </div>
              </CardBody>
            </Card>
          )}
          {/* APPEARANCE TAB */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-medium text-gray-900">
                    Theme Preference
                  </h2>
                  <p className="text-sm text-gray-500">
                    Choose how the interface looks to you.
                  </p>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        id: "light",
                        label: "Light Mode",
                        bg: "bg-white",
                        border: "border-gray-200",
                      },
                      {
                        id: "dark",
                        label: "Dark Mode",
                        bg: "bg-gray-900",
                        border: "border-gray-800",
                      },
                    ].map(
                      (
                        option, // Changed 'theme' to 'option' to avoid shadowing
                      ) => (
                        <button
                          key={option.id}
                          onClick={() => setTheme(option.id as any)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            theme === option.id // Now correctly compares global theme with the option ID
                              ? "border-primary-500 ring-2 ring-primary-500/20"
                              : "border-gray-100 dark:border-gray-800"
                          }`}
                        >
                          <div
                            className={`h-20 w-full ${option.bg} rounded mb-3 border ${option.border}`}
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {option.label}
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
