import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiChevronDown,
  FiCalendar,
  FiUser,
  FiFlag,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiCheck,
  FiArrowLeft,
  FiX,
  FiSearch,
  FiPlus
} from 'react-icons/fi';

const AddTask = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Not Started',
    priority: 'Medium',
    startDate: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    assignees: [],
    tags: []
  });

  const [tagInput, setTagInput] = useState('');

  const statusOptions = [
    { value: 'Not Started', icon: <FiAlertCircle />, color: 'bg-gray-100 text-gray-800' },
    { value: 'In Progress', icon: <FiClock />, color: 'bg-blue-50 text-blue-600' },
    { value: 'Completed', icon: <FiCheckCircle />, color: 'bg-green-50 text-green-600' },
    { value: 'Blocked', icon: <FiXCircle />, color: 'bg-red-50 text-red-600' }
  ];

  const priorityOptions = [
    { value: 'Low', icon: <FiFlag />, color: 'bg-blue-50 text-blue-600' },
    { value: 'Medium', icon: <FiFlag />, color: 'bg-amber-50 text-amber-600' },
    { value: 'High', icon: <FiFlag />, color: 'bg-red-50 text-red-600' }
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const response = await axios.get("http://localhost:3000/api/users/allusers", {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });

        const formattedUsers = response.data.data.map(user => ({
          _id: user._id,
          name: user.name,
          avatar: user.name.split(' ').map(n => n[0]).join('').toUpperCase(),
          role: user.role?.name || 'Team Member'
        }));

        // Filter out "Administrator"
        const filteredUsers = formattedUsers.filter(user => user.role !== "Administrator");


        setUsers(filteredUsers);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load users");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  const handleAssigneeChange = (userId) => {
    setFormData(prev => {
      const alreadyAssigned = prev.assignees.includes(userId);
      return {
        ...prev,
        assignees: alreadyAssigned
          ? prev.assignees.filter(id => id !== userId)
          : [...prev.assignees, userId],
      };
    });
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate required fields
    if (!formData.title || !formData.dueDate || !formData.tags || formData.tags.length === 0 || !formData.assignees || formData.assignees.length === 0) {
      setError("Please provide all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token");

      // Format dates to ISO strings
      const taskData = {
        ...formData,
        startDate: formData.startDate.toISOString(),
        dueDate: formData.dueDate.toISOString()
      };

      const response = await axios.post("http://localhost:3000/api/tasks", taskData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      navigate('/tasks');
    } catch (err) {
      console.error("Error creating task:", err);
      setError(err.response?.data?.message || "Failed to create task");
    }
  };

  const filteredUsers = users
    .filter(user => !formData.assignees.includes(user._id))
    .filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg font-medium text-gray-600">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
            Loading user data...
          </div>
        </motion.div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-red-100 max-w-md w-full"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-red-100 mt-0.5">
              <FiXCircle className="text-red-500" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Error Loading Data</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Task</h1>
                <p className="text-gray-600 mt-1">Fill in the details below to create a new task</p>
              </div>
              <Link
                to="/tasks"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 group"
              >
                <FiArrowLeft
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                <span className="font-medium">Back to Tasks</span>
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 md:p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50/90 backdrop-blur-sm text-red-700 rounded-lg border border-red-100"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Task Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {statusOptions.find(opt => opt.value === formData.status)?.icon}
                      </div>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm appearance-none"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.value}
                          </option>
                        ))}
                      </select>
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
                        className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm appearance-none"
                      >
                        {priorityOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.value}
                          </option>
                        ))}
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
                        onChange={(date) => handleDateChange(date, 'startDate')}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCalendar className="text-gray-500" />
                      </div>
                      <DatePicker
                        selected={formData.dueDate}
                        onChange={(date) => handleDateChange(date, 'dueDate')}
                        minDate={formData.startDate}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Assignees */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Assignees <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {formData.assignees.map(userId => {
                      const user = users.find(u => u._id === userId);
                      return (
                        <motion.div
                          key={userId}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="group relative inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 transition-all duration-200 hover:bg-blue-200 shadow-sm"
                        >
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mr-2 text-xs font-medium">
                            {user?.avatar || '?'}
                          </div>
                          <span className="text-sm font-medium">
                            {user ? user.name : 'Unknown'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAssigneeChange(userId)}
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-blue-600 hover:text-blue-800"
                          >
                            <FiX className="h-3 w-3" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="relative" ref={dropdownRef}>
                    <div
                      className="flex items-center w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200 text-sm cursor-pointer shadow-sm"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="text-gray-500" />
                      </div>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search team members..."
                        className="w-full bg-transparent outline-none text-sm"
                        onClick={() => setIsDropdownOpen(true)}
                      />
                      <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ type: "spring", damping: 20, stiffness: 300 }}
                          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                        >
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                              <div
                                key={user._id}
                                className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                                onClick={() => handleAssigneeChange(user._id)}
                              >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mr-2 text-xs font-medium">
                                  {user.avatar}
                                </div>
                                <span className="text-sm font-medium">
                                  {user.name}
                                </span>
                                <span className="ml-auto text-xs text-gray-500">{user.role}</span>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">
                              No matching team members found
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tags <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <AnimatePresence>
                      {formData.tags.map(tag => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 shadow-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleTagRemove(tag)}
                            className="ml-1.5 text-gray-500 hover:text-gray-700"
                          >
                            <FiX className="h-3 w-3" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm shadow-sm"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                    />
                    <button
                      type="button"
                      onClick={handleTagAdd}
                      className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:from-blue-600 hover:to-blue-700 flex items-center"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Link
                  to="/tasks"
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  Cancel
                </Link>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      Creating...
                    </div>
                  ) : (
                    <>
                      <FiCheck className="mr-2" />
                      Create Task
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AddTask;