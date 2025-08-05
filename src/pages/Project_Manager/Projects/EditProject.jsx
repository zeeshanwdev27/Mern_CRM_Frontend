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
  FiPercent,
} from "react-icons/fi";
import axios from "axios";
import { useNavigate, Link, useParams, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_BASE_URL = "http://localhost:3000";

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [clients, setClients] = useState([]);
  const [clientProjects, setClientProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    priority: "medium",
    client: "",
    clientProjects: [],
    status: "active",
    startDate: new Date(),
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    progress: 0,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Get initial data from location state if available
        const initialProjectData = location.state?.projectData || null;
        
        const [clientsRes, projectRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/clients/getclients`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/projects/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const clientsData = clientsRes.data?.data?.getClients || [];
        const projectData = initialProjectData || projectRes.data?.data || projectRes.data;

        if (!projectData) {
          throw new Error("Project data not found in response");
        }

        setClients(clientsData);
        
        // Set form data from existing project
        const initialFormData = {
          name: projectData.name || "",
          priority: projectData.priority || "medium",
          client: projectData.client?.id || projectData.client?._id || projectData.client || "",
          clientProjects: projectData.clientProjects?.map(p => String(p.id || p._id || p)) || [],
          status: projectData.status === "hold" ? "on hold" : projectData.status || "active",
          startDate: new Date(projectData.startDate || Date.now()),
          deadline: new Date(projectData.deadline || Date.now() + 7 * 24 * 60 * 60 * 1000),
          progress: projectData.progress || 0,
        };

        setFormData(initialFormData);

        // Find the client and their projects
        const client = clientsData.find(c => c._id === (projectData.client?.id || projectData.client?._id || projectData.client));
        if (client?.projects) {
          // Normalize project IDs to strings and include names
          const normalizedProjects = client.projects.map(p => ({
            ...p,
            _id: String(p._id),
            name: p.name || "Unnamed Project"
          }));
          setClientProjects(normalizedProjects);
        }
        
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
  }, [id, token, location.state]);

  useEffect(() => {
    const fetchClientProjects = async () => {
      if (!formData.client) {
        setClientProjects([]);
        return;
      }

      try {
        const client = clients.find((c) => c._id === formData.client);
        if (client?.projects) {
          const normalizedProjects = client.projects.map(p => ({
            ...p,
            _id: String(p._id),
            name: p.name || "Unnamed Project"
          }));
          setClientProjects(normalizedProjects);
        } else {
          setClientProjects([]);
        }
      } catch (err) {
        console.error("Error fetching client projects:", err);
        setClientProjects([]);
      }
    };

    fetchClientProjects();
  }, [formData.client, clients]);

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
      const stringId = String(projectId);
      if (prev.clientProjects.includes(stringId)) {
        return {
          ...prev,
          clientProjects: prev.clientProjects.filter(id => id !== stringId),
        };
      } else {
        return {
          ...prev,
          clientProjects: [...prev.clientProjects, stringId],
        };
      }
    });
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const getProjectName = (projectId) => {
    if (!projectId) return "Unknown Project";
    
    const stringId = String(projectId);
    
    // First check in current client projects
    const project = clientProjects.find(p => String(p._id) === stringId);
    if (project) return project.name;
    
    // Then check in all clients' projects
    for (const client of clients) {
      if (client.projects) {
        const foundProject = client.projects.find(p => String(p._id) === stringId);
        if (foundProject) return foundProject.name || "Unnamed Project";
      }
    }
    
    return "Unknown Project";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name || formData.name.trim() === "") {
        setError("Project name is required");
        return;
      }

      if (formData.name.length > 100) {
        setError("Project name cannot exceed 100 characters");
        return;
      }

      if (!formData.client) {
        setError("Client is required");
        return;
      }

      if (!formData.clientProjects || formData.clientProjects.length === 0) {
        setError("At least one client project must be selected");
        return;
      }

      // Ensure deadline is at least 1ms after start date
      const adjustedDeadline = new Date(formData.deadline);
      if (adjustedDeadline <= formData.startDate) {
        adjustedDeadline.setTime(formData.startDate.getTime() + 1);
      }

      // Verify all selected projects belong to the client
      const validProjects = formData.clientProjects.filter(projectId => 
        clientProjects.some(p => String(p._id) === String(projectId))
      );

      if (validProjects.length !== formData.clientProjects.length) {
        throw new Error("One or more selected projects don't belong to this client");
      }

      const formattedData = {
        name: formData.name,
        priority: formData.priority,
        client: formData.client,
        clientProjects: validProjects,
        status: formData.status === "on hold" ? "hold" : formData.status,
        startDate: formData.startDate.toISOString(),
        deadline: adjustedDeadline.toISOString(),
        progress: formData.progress,
      };

      const response = await axios.put(
        `${API_BASE_URL}/api/projects/${id}`,
        formattedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        navigate("/projects");
      } else {
        throw new Error("Failed to update project");
      }
    } catch (err) {
      console.error("Project update error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message || err.message || "Failed to update project"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = clientProjects
    .filter(project => !formData.clientProjects.includes(String(project._id)))
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
            Edit Project
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                required
                maxLength={100}
                placeholder="Enter project name"
              />
            </div>

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
                  <option value="active">active</option>
                  <option value="on hold">on hold</option>
                  <option value="completed">completed</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {formData.status === "active" && (
                    <FiClock className="text-gray-500" />
                  )}
                  {formData.status === "on hold" && (
                    <FiPause className="text-gray-500" />
                  )}
                  {formData.status === "completed" && (
                    <FiCheckCircle className="text-gray-500" />
                  )}
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
                  <option value="high">high</option>
                  <option value="medium">medium</option>
                  <option value="low">low</option>
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Progress (%)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPercent className="text-gray-500" />
                </div>
                <input
                  type="number"
                  name="progress"
                  value={formData.progress}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="block w-full pl-10 pr-3 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                />
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
                const projectName = getProjectName(projectId);
                return (
                  <div
                    key={projectId}
                    className="group relative inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 transition-all duration-200 hover:bg-blue-200 transform hover:-translate-y-0.5"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center mr-2">
                      <FiUser className="text-blue-800" />
                    </div>
                    <span className="text-sm font-medium">
                      {projectName}
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
                "Updating..."
              ) : (
                <>
                  <FiCheck className="mr-2" />
                  Update Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProject;