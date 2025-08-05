import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiCheck, 
  FiX, 
  FiCalendar, 
  FiTag, 
  FiUsers,
  FiAlertCircle,
  FiPlus,
  FiTrash2,
  FiChevronDown,
  FiFlag,
  FiClock,
  FiCheckCircle,
  FiPause,
  FiSearch
} from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';

const API_BASE_URL = "http://localhost:3000";

const NewTask = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [project, setProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    status: 'Not Started',
    priority: 'Medium',
    startDate: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    assignees: [],
    tags: []
  });

  const statusOptions = [
    { value: 'Not Started', icon: <FiAlertCircle />, color: 'bg-gray-100 text-gray-800' },
    { value: 'In Progress', icon: <FiClock />, color: 'bg-blue-50 text-blue-600' },
    { value: 'Completed', icon: <FiCheckCircle />, color: 'bg-green-50 text-green-600' },
    { value: 'Blocked', icon: <FiPause />, color: 'bg-red-50 text-red-600' }
  ];

  const priorityOptions = [
    { value: 'Low', icon: <FiFlag />, color: 'bg-blue-50 text-blue-600' },
    { value: 'Medium', icon: <FiFlag />, color: 'bg-amber-50 text-amber-600' },
    { value: 'High', icon: <FiFlag />, color: 'bg-red-50 text-red-600' }
  ];

  // Fetch project and team members
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, teamRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/projects/${projectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/api/users/allusers`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        setProject(projectRes.data);
        
        // Format team members data with avatars
                const formattedUsers = teamRes.data.data.map(user => ({
          _id: user._id,
          name: user.name,
          avatar: user.name.split(' ').map(n => n[0]).join('').toUpperCase(),
          role: user.role?.name || 'Team Member'
        }));

        // Filter out "Administrator"
        const filteredUsers = formattedUsers.filter(user => user.role !== "Administrator");

        
        setTeamMembers(filteredUsers);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, token]);

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
    setTaskData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (date, field) => {
    setTaskData(prev => ({ ...prev, [field]: date }));
  };

  const handleAssigneeChange = (userId) => {
    setTaskData(prev => {
      const alreadyAssigned = prev.assignees.includes(userId);
      return {
        ...prev,
        assignees: alreadyAssigned
          ? prev.assignees.filter(id => id !== userId)
          : [...prev.assignees, userId],
      };
    });
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleTagToggle = (tag) => {
    setTaskData(prev => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags: newTags };
    });
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !taskData.tags.includes(newTagInput.trim())) {
      setTaskData(prev => ({
        ...prev,
        tags: [...prev.tags, newTagInput.trim()]
      }));
      setNewTagInput('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTaskData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (!taskData.title || !taskData.dueDate || taskData.assignees.length === 0 || taskData.tags.length === 0) {
        throw new Error('Please fill all required fields');
      }
      
      await axios.post(
        `${API_BASE_URL}/api/tasks`,
        {
          ...taskData,
          project: projectId,
          startDate: taskData.startDate.toISOString(),
          dueDate: taskData.dueDate.toISOString()
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      toast.success('Task created successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'bg-green-50 text-green-800 border border-green-100'
      });
      
      navigate(`/projects/${projectId}`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      toast.error(`Error: ${errorMsg}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'bg-red-50 text-red-800 border border-red-100'
      });
    }
  };

  const filteredTeamMembers = teamMembers
    .filter(member => !taskData.assignees.includes(member._id))
    .filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      member.roleName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-lg font-medium text-gray-600"
        >
          <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
          Loading task data...
        </motion.div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-red-100 max-w-md w-full"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-red-100 mt-0.5">
              <FiAlertCircle className="text-red-500" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Project Not Found</h3>
              <p className="text-gray-600 mb-4">The requested project could not be loaded.</p>
              <button
                onClick={() => navigate('/projects')}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Back to Projects
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
                <p className="text-gray-600 mt-1">Project: {project.name}</p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 group"
              >
                <FiArrowLeft
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                <span className="font-medium">Back to Project</span>
              </button>
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
                    value={taskData.title}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                    required
                    placeholder="Enter task title"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={taskData.description}
                    onChange={handleChange}
                    rows={4}
                    className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                    placeholder="Enter task description"
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
                        {statusOptions.find(opt => opt.value === taskData.status)?.icon}
                      </div>
                      <select
                        name="status"
                        value={taskData.status}
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
                        value={taskData.priority}
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
                      Start Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCalendar className="text-gray-500" />
                      </div>
                      <DatePicker
                        selected={taskData.startDate}
                        onChange={(date) => handleDateChange(date, 'startDate')}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
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
                        selected={taskData.dueDate}
                        onChange={(date) => handleDateChange(date, 'dueDate')}
                        minDate={taskData.startDate}
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
                    <AnimatePresence>
                      {taskData.assignees.map(userId => {
                        const member = teamMembers.find(m => m._id === userId);
                        return (
                          <motion.div
                            key={userId}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 transition-all duration-200 hover:bg-blue-200 shadow-sm"
                          >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mr-2 text-xs font-medium">
                              {member?.avatar || '?'}
                            </div>
                            <span className="text-sm font-medium">
                              {member ? member.name : 'Unknown'}
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
                    </AnimatePresence>
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
                          {filteredTeamMembers.length > 0 ? (
                            filteredTeamMembers.map(member => (
                              <div
                                key={member._id}
                                className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                                onClick={() => handleAssigneeChange(member._id)}
                              >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mr-2 text-xs font-medium">
                                  {member.avatar}
                                </div>
                                <span className="text-sm font-medium">
                                  {member.name}
                                </span>
                                <span className="ml-auto text-xs text-gray-500">{member.roleName}</span>
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
                      {taskData.tags.map(tag => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 shadow-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1.5 text-purple-600 hover:text-purple-800"
                          >
                            <FiX className="h-3 w-3" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="flex gap-2">
                    {showTagInput ? (
                      <>
                        <input
                          type="text"
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm shadow-sm"
                          placeholder="Enter new tag"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:from-green-600 hover:to-green-700 flex items-center"
                        >
                          <FiCheck size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowTagInput(false)}
                          className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:from-red-600 hover:to-red-700 flex items-center"
                        >
                          <FiX size={14} />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowTagInput(true)}
                        className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-all duration-200"
                      >
                        <FiPlus className="mr-2" />
                        Add Custom Tag
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  <FiCheck className="mr-2" />
                  Create Task
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NewTask;