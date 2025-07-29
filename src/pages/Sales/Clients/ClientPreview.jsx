import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiMail,
  FiGlobe,
  FiMapPin,
  FiDollarSign,
  FiCalendar,
  FiBriefcase,
  FiTag,
} from "react-icons/fi";

const ClientPreview = () => {
  const { state } = useLocation();
  const clientId = state?.id;
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication required");

        const response = await axios.get(
          `http://localhost:3000/api/clients/${clientId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setClient(response.data.data.client || response.data.data.getClient);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) fetchClient();
  }, [clientId]);

  const formatCurrency = (value) => {
    const amount = parseFloat(value) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const calculateTotalValue = (projects) => {
    return projects.reduce((sum, project) => sum + (project.value || 0), 0);
  };

  if (loading)
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">Loading client details...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">Error: {error}</p>
        </div>
      </div>
    );

  if (!client)
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700">Client not found</p>
        </div>
      </div>
    );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
        >
          <FiArrowLeft className="mr-2" />
          <span className="font-medium">Back to Clients</span>
        </button>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Client header with avatar and basic info */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-shrink-0 h-20 w-20 rounded-xl bg-white shadow-sm border border-gray-200 flex items-center justify-center">
              <FiUser className="text-indigo-600 text-3xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {client.name}
              </h1>
              <div className="flex items-center mt-1">
                <FiBriefcase className="text-gray-500 mr-2" />
                <p className="text-gray-600">{client.company}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    client.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {client.status?.charAt(0)?.toUpperCase() +
                    client.status?.slice(1)}
                </span>
                <span className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                  <FiDollarSign className="mr-1" />
                  {formatCurrency(calculateTotalValue(client.projects || []))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Client details grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          {/* Contact Information */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiUser className="text-indigo-500 mr-2" />
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <FiMail className="text-gray-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">
                    {client.email || "Not provided"}
                  </p>
                </div>
              </div>

              {client.phone && (
                <div className="flex items-start">
                  <FiPhone className="text-gray-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900">{client.phone}</p>
                  </div>
                </div>
              )}

              {client.website && (
                <div className="flex items-start">
                  <FiGlobe className="text-gray-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {client.website}
                    </a>
                  </div>
                </div>
              )}

              {client.address && (
                <div className="flex items-start">
                  <FiMapPin className="text-gray-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-900">{client.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Projects Section */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiTag className="text-indigo-500 mr-2" />
              Projects ({client.projects?.length || 0})
            </h2>
            {client.projects?.length > 0 ? (
              <div className="space-y-3">
                {client.projects.map((project, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex justify-between">
                      <p className="font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {project.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(project.value)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-500">No projects recorded</p>
              </div>
            )}
          </div>

          {/* Timeline/Additional Info */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiCalendar className="text-indigo-500 mr-2" />
              Timeline
            </h2>
            <div className="space-y-4">
              {client.lastContact && (
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                    <FiCalendar className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Contact</p>
                    <p className="text-gray-900">
                      {new Date(client.lastContact).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              )}

              {client.createdAt && (
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                    <FiCalendar className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Client Since</p>
                    <p className="text-gray-900">
                      {new Date(client.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="font-medium text-blue-800 mb-1">
                  Total Project Value
                </h3>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(calculateTotalValue(client.projects || []))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPreview;