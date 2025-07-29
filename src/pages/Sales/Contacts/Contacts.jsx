import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  FiSearch,
  FiPlus,
  FiFilter,
  FiCheck,
  FiX,
  FiChevronDown,
  FiUser,
  FiPhone,
  FiMail,
  FiBriefcase,
  FiEdit2,
  FiTrash2,
  FiStar,
  FiMoreVertical,
  FiAlertCircle,
  FiUserPlus,
} from "react-icons/fi";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Link } from "react-router-dom";
import axios from "axios";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

// API Configuration
const API_BASE_URL = "http://localhost:3000/api/contacts";

const Contacts = () => {
  // State Management
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  // Refs
  const notificationRef = useRef(null);

  // Scroll to notifications when messages change
  useEffect(() => {
    if (error || errorMessage || successMessage) {
      setTimeout(() => {
        if (notificationRef.current) {
          notificationRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  }, [error, errorMessage, successMessage]);

  // Memoized filtered contacts
  const filteredContacts = useMemo(
    () =>
      contacts.filter((contact) => {
        const matchesSearch =
          contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || contact.status === statusFilter;
        const matchesTag =
          tagFilter === "all" ||
          (contact.tags && contact.tags.includes(tagFilter));
        return matchesSearch && matchesStatus && matchesTag;
      }),
    [contacts, searchTerm, statusFilter, tagFilter]
  );

  // Memoized chart data
  const contactStatusData = useMemo(
    () => ({
      labels: ["Active", "Inactive"],
      datasets: [
        {
          data: [
            contacts.filter((c) => c.status === "active").length,
            contacts.filter((c) => c.status === "inactive").length,
          ],
          backgroundColor: ["#10B981", "#E5E7EB"],
          borderWidth: 0,
        },
      ],
    }),
    [contacts]
  );

  // Fetch contacts on mount
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const response = await axios.get(`${API_BASE_URL}/getcontacts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && Array.isArray(response.data.getContacts)) {
          setContacts(response.data.getContacts);
        } else {
          throw new Error("Invalid data format received from server");
        }
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
        setError(err.message || "Failed to load contacts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Starred Update in DB
  const toggleStar = async (id) => {
    try {
      // Find the contact first to get current starred value
      const contactToUpdate = contacts.find((c) => c._id === id);
      if (!contactToUpdate) {
        throw new Error("Contact not found");
      }

      // Optimistically update UI
      setContacts(
        contacts.map((contact) =>
          contact._id === id
            ? { ...contact, starred: !contact.starred }
            : contact
        )
      );

      // Update in database
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.patch(
        `${API_BASE_URL}/updatestar/${id}`,
        { starred: !contactToUpdate.starred },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data || !response.data.status === "success") {
        throw new Error("Failed to update star status");
      }
    } catch (error) {
      console.error("Error updating star status:", error);
      setErrorMessage(error.message || "Failed to update star status");
    }
  };

  // Delete contact handlers
  const handleDeleteClick = (contact) => {
    setContactToDelete(contact);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      await axios.delete(
        `${API_BASE_URL}/deletecontact/${contactToDelete._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setContacts(contacts.filter((c) => c._id !== contactToDelete._id));
      setSuccessMessage(
        `Contact "${contactToDelete.name}" deleted successfully`
      );
      setShowDeleteModal(false);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to delete contact"
      );
      setSuccessMessage("");
      setShowDeleteModal(false);
    }
  };

  // Get all unique tags
  const allTags = useMemo(
    () =>
      Array.from(new Set(contacts.flatMap((contact) => contact.tags || []))),
    [contacts]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <FiAlertCircle className="inline-block text-4xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Error loading contacts
          </h3>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Notification Messages */}
      <div
        ref={notificationRef}
        className={`transition-all duration-300 ${
          errorMessage || successMessage
            ? "mb-4 opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 h-0"
        }`}
      >
        {errorMessage && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-800 rounded-md shadow-lg flex justify-between items-center">
            <div className="flex items-center">
              <FiAlertCircle className="mr-2" />
              {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage("")}
              className="text-red-800 hover:text-red-600"
            >
              <FiX />
            </button>
          </div>
        )}
        {successMessage && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-800 rounded-md shadow-lg flex justify-between items-center">
            <div className="flex items-center">
              <FiCheck className="mr-2" />
              {successMessage}
            </div>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-green-800 hover:text-green-600"
            >
              <FiX />
            </button>
          </div>
        )}
      </div>

      {/* Header and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Contact Management
        </h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search contacts..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-3">
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <FiChevronDown className="absolute right-3 top-2.5 text-gray-400" />
            </div>
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
              >
                <option value="all">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-2.5 text-gray-400" />
            </div>
            <Link
              to="/contacts/add"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="mr-2" />
              Add Contact
            </Link>
          </div>
        </div>
      </div>

      {/* Stats and Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-500">Total Contacts</p>
            <p className="text-2xl font-bold mt-1 text-gray-800">
              {contacts.length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-500">Active Contacts</p>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {contacts.filter((c) => c.status === "active").length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-500">Starred</p>
            <p className="text-2xl font-bold mt-1 text-yellow-500">
              {contacts.filter((c) => c.starred).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-500">Companies</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">
              {new Set(contacts.map((c) => c.company)).size}
            </p>
          </div>
        </div>

        {/* Contact Status Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Contact Status
          </h2>
          <div className="h-64 flex">
            <div className="w-1/2">
              <Pie
                data={contactStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
            <div className="w-1/2 pl-6 flex flex-col justify-center">
              <div className="space-y-3">
                {contactStatusData.labels.map((label, index) => (
                  <div key={label} className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{
                        backgroundColor:
                          contactStatusData.datasets[0].backgroundColor[index],
                      }}
                    ></div>
                    <span className="text-sm text-gray-600">
                      {label}: {contactStatusData.datasets[0].data[index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Contact
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Add to Client
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleStar(contact._id)}
                          className="mr-2 text-gray-400 hover:text-yellow-500"
                        >
                          <FiStar
                            className={
                              contact.starred
                                ? "fill-yellow-400 text-yellow-400"
                                : ""
                            }
                          />
                        </button>
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FiUser className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {contact.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {contact.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiBriefcase className="text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {contact.company}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <FiPhone className="mr-1 text-gray-400" />{" "}
                        {contact.phone}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <FiMail className="mr-1 text-gray-400" />{" "}
                        {contact.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contact.lastContact).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <Link
                        to={`/clients/add/${contact._id}`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <FiUserPlus className="mr-1" />
                        Convert
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-center space-x-2">
                        <Link
                          to={`/contacts/edit/${contact._id}`}
                          className="text-blue-600 hover:text-blue-900 cursor-pointer" 
                        >
                          <FiEdit2 />
                        </Link>
                        <button
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                          onClick={() => handleDeleteClick(contact)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No contacts found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-start gap-4 mb-5">
              <div className="p-3 rounded-full bg-rose-100 mt-0.5">
                <FiAlertCircle size={24} className="text-rose-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Delete Contact
                </h3>
                <p className="text-gray-600 mt-2">
                  Are you sure you want to delete the contact "
                  {contactToDelete?.name}"? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors"
              >
                Delete Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;