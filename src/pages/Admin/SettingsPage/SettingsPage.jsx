import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  FiSettings,
  FiBell,
  FiMoon,
  FiSun,
  FiLock,
  FiMail,
  FiGlobe,
  FiDollarSign,
  FiSave,
  FiCheckCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:3000";

const SettingsPage = () => {
  const [companyName, setCompanyName] = useState("");
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/settings/general`
      );
      setCompanyName(response.data.data);
      setCompanyId(response.data.data._id);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (companyName) {
      setGeneralSettings((prev) => ({
        ...prev,
        companyName: companyName.name,
      }));
    }
  }, [companyName]);

  const [generalSettings, setGeneralSettings] = useState({
    companyName,
    timezone: "UTC",
    currency: "USD",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    weeklyReports: false,
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light",
  });

  const [accountSettings, setAccountSettings] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [originalEmail, setOriginalEmail] = useState(""); //Seperate Store Email

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please login to access account settings");

        const response = await axios.get(
          `${API_BASE_URL}/api/settings/account`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Store both in accountSettings AND originalEmail
        setAccountSettings((prev) => ({
          ...prev,
          email: response.data.data.email,
        }));
        setOriginalEmail(response.data.data.email); // Store original separately
      } catch (error) {
        // ... existing error handling ...
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Timezone options
  const timezoneOptions = [
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "Eastern Time (US)" },
    { value: "America/Los_Angeles", label: "Pacific Time (US)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Asia/Karachi", label: "Pakistan Standard Time (PKT)" },
  ];

  // Currency options
  const currencyOptions = [
    { value: "USD", label: "US Dollar (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "GBP", label: "British Pound (GBP)" },
    { value: "PKR", label: "Pakistani Rupee (PKR)" },
  ];

  // Tab options
  const tabs = [
    { id: "general", label: "General", icon: <FiGlobe size={20} /> },
    { id: "notifications", label: "Notifications", icon: <FiBell size={20} /> },
    { id: "appearance", label: "Appearance", icon: <FiMoon size={20} /> },
    { id: "account", label: "Account", icon: <FiLock size={20} /> },
  ];

  // Handle input changes
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleAppearanceChange = (theme) => {
    setAppearanceSettings((prev) => ({ ...prev, theme }));
    // Apply theme to document (simplified for demo)
    document.documentElement.classList.toggle("dark", theme === "dark");
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountSettings((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submissions
  const handleSave = async (e) => {
    e.preventDefault();
    let success = false;

    switch (activeTab) {
      case "general":
        success = await handleGeneralSettingsSave();
        break;
      case "account":
        success = await handleAccountSettingsSave();
        break;
      case "notifications":
        success = await handleNotificationSettingsSave();
        break;
      case "appearance":
        success = await handleAppearanceSettingsSave();
        break;
      default:
        break;
    }

    if (success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 1500);
      if (activeTab === "general") window.location.reload(); // Reload only if needed
    }
  };

  const handleGeneralSettingsSave = async () => {
    if (!generalSettings.companyName.trim()) {
      toast.error("Company Name, cannot be empty!");
      return false;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please login to access account settings");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const requestData = {
        name: generalSettings.companyName,
      };

      let response;

      if (companyId) {
        // PUT request for update
        response = await axios.put(
          `${API_BASE_URL}/api/settings/general/${companyId}`, // Using relative path
          requestData,
          config // Correct config position
        );
      } else {
        // POST request for create
        response = await axios.post(
          `${API_BASE_URL}/api/settings/general`,
          requestData,
          config // Correct config position
        );
        setCompanyId(response.data.data._id);
      }
      return true;
    } catch (error) {
      console.error("Error saving company:", error);
      alert("Failed to save company name.");
      return false;
    }
  };

  const handleAccountSettingsSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return false;
      }

      const updateData = {};
      let requiresCurrentPassword = false;

      // Check if email is being changed
      if (accountSettings.email !== originalEmail) {
        updateData.email = accountSettings.email;
        requiresCurrentPassword = true;
      }

      // Check if password is being changed
      if (accountSettings.newPassword) {
        if (
          accountSettings.newPassword !== accountSettings.confirmNewPassword
        ) {
          toast.error("New passwords don't match");
          return false;
        }
        updateData.newPassword = accountSettings.newPassword;
        requiresCurrentPassword = true;
      }

      // Validate current password if needed
      if (requiresCurrentPassword && !accountSettings.currentPassword) {
        toast.error("Current password required for changes");
        return false;
      }

      if (requiresCurrentPassword) {
        updateData.currentPassword = accountSettings.currentPassword;
      }

      // Only proceed if there are changes
      if (Object.keys(updateData).length > 0) {
        await axios.put(
          `${API_BASE_URL}/api/settings/account/update`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Clear passwords and update original reference
        setAccountSettings((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        }));

        if (updateData.email) {
          setOriginalEmail(updateData.email); // Update original reference
        }

        toast.success("Account updated successfully!");
        return true;
      }

      toast.info("No changes detected");
      return false;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update account";
      toast.error(errorMessage);
      return false;
    }
  };

  // Loading & Error Display
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-red-500 p-4 border border-red-100 bg-red-50 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        appearanceSettings.theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-50 text-gray-900"
      } p-4 md:p-6 transition-colors duration-300`}
    >
      <style>
        {`
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-in {
            animation: slideIn 0.3s ease-out;
          }
          .dark .bg-white { background-color: #1f2a44; }
          .dark .border-gray-200 { border-color: #374151; }
          .dark .text-gray-900 { color: #e5e7eb; }
          .dark .text-gray-700 { color: #9ca3af; }
          .dark .text-gray-500 { color: #6b7280; }
          .dark .bg-gray-50 { background-color: #111827; }
          .dark .bg-blue-50 { background-color: #1e3a8a; }
          .dark .text-blue-700 { color: #60a5fa; }
          .dark .border-blue-500 { border-color: #3b82f6; }
          .dark .bg-gradient-to-r { background-image: linear-gradient(to right, #1e40af, #1e3a8a); }
          .dark .hover\\:bg-gray-50:hover { background-color: #374151; }
          .dark .text-green-600 { color: #34d399; }
        `}
      </style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FiSettings
              className={`${
                appearanceSettings.theme === "dark"
                  ? "text-blue-400"
                  : "text-blue-500"
              }`}
              size={28}
            />
            <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
          </div>
          {isSaved && (
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg animate-slide-in dark:bg-green-900 dark:text-green-300">
              <FiCheckCircle size={16} />
              <span className="text-sm font-medium">Settings saved!</span>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar for Desktop */}
          <div className="hidden md:block w-64 bg-white rounded-xl border border-gray-200 shadow-sm p-4 dark:bg-gray-800">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500 dark:bg-blue-900 dark:text-blue-300"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                  aria-label={`Select ${tab.label} settings tab`}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500 dark:bg-blue-900 dark:text-blue-300"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
                aria-label={`Select ${tab.label} settings tab`}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6 dark:bg-gray-800">
            {activeTab === "general" && (
              <div className="animate-slide-in">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <FiGlobe size={20} />
                  General Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="companyName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={generalSettings.companyName}
                      onChange={handleGeneralChange}
                      className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-blue-600"
                      aria-label="Company name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="timezone"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      name="timezone"
                      value={generalSettings.timezone}
                      onChange={handleGeneralChange}
                      className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-blue-600"
                      aria-label="Select timezone"
                    >
                      {timezoneOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="currency"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Currency
                    </label>
                    <select
                      id="currency"
                      name="currency"
                      value={generalSettings.currency}
                      onChange={handleGeneralChange}
                      className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-blue-600"
                      aria-label="Select currency"
                    >
                      {currencyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="animate-slide-in">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <FiBell size={20} />
                  Notification Settings
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationChange}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-600"
                      aria-label="Enable email notifications"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Email Notifications
                    </span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="inAppNotifications"
                      checked={notificationSettings.inAppNotifications}
                      onChange={handleNotificationChange}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-600"
                      aria-label="Enable in-app notifications"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      In-App Notifications
                    </span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="weeklyReports"
                      checked={notificationSettings.weeklyReports}
                      onChange={handleNotificationChange}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-600"
                      aria-label="Enable weekly report emails"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Weekly Report Emails
                    </span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="animate-slide-in">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <FiMoon size={20} />
                  Appearance
                </h2>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAppearanceChange("light")}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all duration-200 font-medium text-sm ${
                      appearanceSettings.theme === "light"
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-600"
                        : "border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300"
                    }`}
                    aria-label="Select light theme"
                  >
                    <FiSun size={18} />
                    Light Mode
                  </button>
                  <button
                    onClick={() => handleAppearanceChange("dark")}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all duration-200 font-medium text-sm ${
                      appearanceSettings.theme === "dark"
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-600"
                        : "border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300"
                    }`}
                    aria-label="Select dark theme"
                  >
                    <FiMoon size={18} />
                    Dark Mode
                  </button>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="animate-slide-in">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <FiLock size={20} />
                  Account Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={accountSettings.email}
                      onChange={handleAccountChange}
                      className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-blue-600"
                      aria-label="Email address"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={accountSettings.currentPassword}
                      onChange={handleAccountChange}
                      className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-blue-600"
                      aria-label="Current password"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={accountSettings.newPassword}
                      onChange={handleAccountChange}
                      className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-blue-600"
                      aria-label="New password"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="confirmNewPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      value={accountSettings.confirmNewPassword}
                      onChange={handleAccountChange}
                      className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-blue-600"
                      aria-label="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg dark:from-blue-700 dark:to-blue-600 dark:hover:from-blue-800 dark:hover:to-blue-700"
                aria-label="Save settings"
              >
                <FiSave size={18} />
                {activeTab === "account" ? "Update Settings" : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
