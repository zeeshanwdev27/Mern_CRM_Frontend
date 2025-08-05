import React, { useState, useEffect, useRef } from "react";
import {
  FiChevronDown,
  FiCalendar,
  FiUser,
  FiFlag,
  FiClock,
  FiCheckCircle,
  FiPause,
  FiCheck,
  FiArrowLeft,
  FiX,
  FiSearch,
} from "react-icons/fi";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_BASE_URL = "http://localhost:3000";

const NewProject = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [clientProjects, setClientProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: "medium",
    client: "",
    clientProjects: [],
    status: "active",
    startDate: new Date(),
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          throw new Error("No authentication token found");
        }
        const [clientsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/clients/getclients`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setClients(clientsRes.data.data.getClients);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err.response?.data?.message || err.message || "Failed to fetch data"
        );
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    const fetchClientProjects = async () => {
      if (!formData.client) {
        setClientProjects([]);
        setFormData(prev => ({ ...prev, clientProjects: [] }));
        return;
      }

      try {
        const client = clients.find((c) => c._id === formData.client);
        if (client && client.projects) {
          setClientProjects(client.projects);
        } else {
          setClientProjects([]);
          setFormData(prev => ({ ...prev, clientProjects: [] }));
        }
      } catch (err) {
        console.error("Error fetching client projects:", err);
        setClientProjects([]);
        setFormData(prev => ({ ...prev, clientProjects: [] }));
      }
    };

    fetchClientProjects();
  }, [formData.client, clients]);

  // Auto-fill project name when client projects are selected
  useEffect(() => {
    if (formData.clientProjects.length > 0 && !formData.name) {
      const firstProject = clientProjects.find(
        p => p._id === formData.clientProjects[0]
      );
      if (firstProject) {
        setFormData(prev => ({
          ...prev,
          name: firstProject.name
        }));
      }
    }
  }, [formData.clientProjects, clientProjects]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

  const handleProjectSelect = (projectId) => {
    setFormData(prev => {
      if (prev.clientProjects.includes(projectId)) {
        return {
          ...prev,
          clientProjects: prev.clientProjects.filter(id => id !== projectId),
        };
      } else {
        return {
          ...prev,
          clientProjects: [...prev.clientProjects, projectId],
        };
      }
    });
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError("Project name is required");
      return;
    }

    if (formData.clientProjects.length === 0) {
      setError("At least one client project must be selected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formattedData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate.toISOString(),
        deadline: formData.deadline.toISOString(),
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/projects/addproject`,
        formattedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data && response.data._id) {
        navigate("/projects");
      } else {
        throw new Error("Failed to create project");
      }
    } catch (err) {
      console.error(
        "Project creation error:",
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message || err.message || "Failed to create project"
      );
      setLoading(false);
    }
  };

  const filteredProjects = clientProjects
    .filter(project => !formData.clientProjects.includes(project._id))
    .filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading && clients.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-lg font-medium text-gray-600 animate-pulse">
          Loading project data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-red-100">
          <p className="text-red-600 font-medium mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <style>
        {`
          select {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          }
          .react-datepicker__day {
            transition: background-color 0.2s ease, color 0.2s ease;
            background-color: transparent;
            color: #1f2937;
          }
          .react-datepicker__day--selected {
            background-color: #2563eb !important;
            color: white !important;
            border-radius: 4px;
          }
          .react-datepicker__day:not(.react-datepicker__day--disabled):not(.react-datepicker__day--selected):hover {
            background-color: #3b82f6 !important;
            color: white !important;
            border-radius: 4px;
          }
          .react-datepicker__day:not(.react-datepicker__day--disabled):not(.react-datepicker__day--selected) {
            background-color: transparent;
            color: #1f2937;
          }
        `}
      </style>
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 p-8 transition-all duration-300">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Project
          </h1>
          <Link
            to="/projects"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 group"
          >
            <FiArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="font-medium">Back to Projects</span>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm text-red-700 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="block w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
              required
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="block w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Client <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-500" />
                </div>
                <select
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {formData.status === "active" && <FiClock className="text-gray-500" />}
                  {formData.status === "hold" && <FiPause className="text-gray-500" />}
                  {formData.status === "completed" && <FiCheckCircle className="text-gray-500" />}
                </div>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFlag className="text-gray-500" />
                </div>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-500" />
                </div>
                <DatePicker
                  selected={formData.startDate}
                  onChange={(date) => handleDateChange(date, "startDate")}
                  className="block w-full pl-10 pr-3 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                  required
                />
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Deadline <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-500" />
                </div>
                <DatePicker
                  selected={formData.deadline}
                  onChange={(date) => handleDateChange(date, "deadline")}
                  minDate={formData.startDate}
                  className="block w-full pl-10 pr-3 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Client Projects Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Client Projects <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-3 mb-4">
              {formData.clientProjects.map((projectId) => {
                const project = clientProjects.find(p => p._id === projectId);
                return (
                  <div
                    key={projectId}
                    className="group relative inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 transition-all duration-200 hover:bg-blue-200 transform hover:-translate-y-0.5"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center mr-2">
                      <FiUser className="text-blue-800" />
                    </div>
                    <span className="text-sm font-medium">
                      {project ? project.name : "Unknown"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleProjectSelect(projectId)}
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-blue-600 hover:text-blue-800"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="relative" ref={dropdownRef}>
              <div
                className={`flex items-center w-full pl-10 pr-10 py-3 bg-white/50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200 text-sm ${
                  !formData.client ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={() => formData.client && setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-500" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    !formData.client 
                      ? "Select a client first" 
                      : clientProjects.length === 0 
                        ? "No projects available" 
                        : "Search projects..."
                  }
                  className="w-full bg-transparent outline-none text-sm"
                  onClick={() => formData.client && setIsDropdownOpen(true)}
                  disabled={!formData.client}
                />
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
              {isDropdownOpen && formData.client && (
                <div className="absolute z-10 w-full mt-1 bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                      <div
                        key={project._id}
                        className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                        onClick={() => handleProjectSelect(project._id)}
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center mr-2">
                          <FiUser className="text-blue-700 text-sm" />
                        </div>
                        <span className="text-sm font-medium">
                          {project.name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      {clientProjects.length === 0 
                        ? "No projects available for this client" 
                        : "No matching projects found"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Link
              to="/projects"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || formData.clientProjects.length === 0}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                "Creating..."
              ) : (
                <>
                  <FiCheck className="mr-2" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProject;