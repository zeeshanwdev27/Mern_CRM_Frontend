import React, { useState, useEffect } from 'react';
import { 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle, 
  FiXCircle,
  FiFlag,
  FiSearch,
  FiChevronDown,
  FiUser,
  FiCalendar,
  FiCheck,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE_URL = "http://localhost:3000";

const statusOptions = [
  { 
    value: 'Not Started', 
    icon: <FiAlertCircle />, 
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-800',
    borderClass: 'border-gray-200'
  },
  { 
    value: 'In Progress', 
    icon: <FiClock />, 
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-600',
    borderClass: 'border-blue-200'
  },
  { 
    value: 'Completed', 
    icon: <FiCheckCircle />, 
    bgClass: 'bg-green-50',
    textClass: 'text-green-600',
    borderClass: 'border-green-200'
  },
  { 
    value: 'Blocked', 
    icon: <FiXCircle />, 
    bgClass: 'bg-red-50',
    textClass: 'text-red-600',
    borderClass: 'border-red-200'
  }
];

const priorityOptions = [
  { 
    value: 'Low', 
    icon: <FiFlag />, 
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-600'
  },
  { 
    value: 'Medium', 
    icon: <FiFlag />, 
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-600'
  },
  { 
    value: 'High', 
    icon: <FiFlag />, 
    bgClass: 'bg-red-50',
    textClass: 'text-red-600'
  }
];

const StatusBadge = ({ status }) => {
  const statusConfig = statusOptions.find(opt => opt.value === status) || statusOptions[0];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgClass} ${statusConfig.textClass}`}>
      {React.cloneElement(statusConfig.icon, { size: 12 })}
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const priorityConfig = priorityOptions.find(opt => opt.value === priority) || priorityOptions[0];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${priorityConfig.bgClass} ${priorityConfig.textClass}`}>
      {React.cloneElement(priorityConfig.icon, { size: 12 })}
      {priority}
    </span>
  );
};

const DateBadge = ({ date, label, isOverdue = false }) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: new Date(date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
  
  return (
    <div className={`flex items-center gap-2 text-xs ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
      <FiCalendar size={14} className="flex-shrink-0" />
      <div>
        <span className="font-medium">{label}: </span>
        <span>{formattedDate}</span>
      </div>
    </div>
  );
};

const TaskCard = ({ 
  task, 
  onStatusChange,
  onDelete,
  onEdit
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  const isOverdue = dueDate < today && task.status !== 'Completed';

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      layout
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Task actions"
            >
              <FiMoreVertical size={18} className="text-gray-500" />
            </button>
            
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className="absolute z-20 right-0 top-8 w-48 max-h-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-y-auto"
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onEdit(task);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      <FiEdit2 size={14} />
                      <span>Edit</span>
                    </button>
                    <div className="border-t border-gray-100">
                      {statusOptions.map(status => (
                        <button
                          key={status.value}
                          onClick={() => {
                            onStatusChange(task._id, status.value);
                            setIsMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left ${
                            task.status === status.value ? 'font-medium' : 'text-gray-700'
                          }`}
                        >
                          {React.cloneElement(status.icon, { size: 14 })}
                          <span>Mark as {status.value}</span>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => {
                          onDelete(task);
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600"
                      >
                        <FiTrash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
        )}
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {task.tags?.map(tag => (
            <span key={tag} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        
        {/* Dates */}
        <div className="mt-3 space-y-1">
          <DateBadge date={task.startDate} label="Start" />
          <DateBadge date={task.dueDate} label="Due" isOverdue={isOverdue} />
        </div>
        
        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
          
          {task.assignees && task.assignees.length > 0 ? (
            <div className="flex items-center">
              {task.assignees.slice(0, 2).map((assignee, index) => (
                <div 
                  key={index} 
                  className={`w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-medium shadow-sm ${index > 0 ? '-ml-2' : ''}`}
                >
                  {typeof assignee === 'object' 
                    ? assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()
                    : 'U'}
                </div>
              ))}
              {task.assignees.length > 2 && (
                <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-medium shadow-sm -ml-2">
                  +{task.assignees.length - 2}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
                <FiUser size={14} className="text-gray-500" />
              </div>
              <span className="text-sm font-medium">Unassigned</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const tasksPerPage = 6;
  const userId = JSON.parse(localStorage.getItem('user'))?.id;

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/users/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log(response.data.data.assignedTasks)
        
        setTasks(response.data.data.assignedTasks || []);
        setIsLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch tasks');
        setIsLoading(false);
      }
    };
    
    fetchMyTasks();
  }, [userId]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      activeFilter === 'All' || 
      task.status === activeFilter ||
      task.priority === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/api/tasks/${taskId}/status`,
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setTasks(tasks.map(task => 
        task._id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task status");
    }
  };

  const handleDeleteTask = (task) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/tasks/${selectedTask._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      setTasks(tasks.filter(task => task._id !== selectedTask._id));
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task");
    }
  };

  const handleEditTask = (task) => {
    console.log("Editing task:", task);
    // You would typically navigate to an edit page here
    // navigate(`/tasks/edit/${task._id}`);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-8 bg-gray-200 rounded-full w-8"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-600 text-sm mt-1">Tasks assigned to you</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/tasks/add"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium shadow-sm"
              aria-label="Add new task"
            >
              <FiPlus size={16} />
              <span>Add Task</span>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-800 rounded-lg flex items-center gap-3 border border-red-200">
            <FiXCircle size={18} className="text-red-600 flex-shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" size={16} />
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm"
              aria-label="Search tasks"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => setActiveFilter('All')}
              className={`px-3 py-2 rounded-lg border transition-all duration-200 font-medium text-sm flex items-center gap-2 shadow-sm ${
                activeFilter === 'All' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-inner' 
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
              aria-label="Show all tasks"
            >
              <FiFilter size={14} />
              All Tasks
            </button>
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => {
                  setActiveFilter(status.value);
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 rounded-lg border transition-all duration-200 font-medium text-sm flex items-center gap-2 shadow-sm ${
                  activeFilter === status.value
                    ? `${status.borderClass} ${status.bgClass} ${status.textClass} shadow-inner`
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
                aria-label={`Filter by ${status.value} tasks`}
              >
                {React.cloneElement(status.icon, { size: 14 })}
                {status.value}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks Grid */}
        {currentTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {currentTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <FiAlertCircle size={32} className="text-gray-400" />
              <p className="text-base font-medium text-gray-700">No tasks found</p>
              {(searchTerm || activeFilter !== 'All') && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setActiveFilter('All');
                  }} 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                  aria-label="Clear filters"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredTasks.length > tasksPerPage && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{indexOfFirstTask + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(indexOfLastTask, filteredTasks.length)}
              </span>{' '}
              of <span className="font-medium">{filteredTasks.length}</span> tasks
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                aria-label="Previous page"
              >
                <FiChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  className={`w-10 h-10 rounded-lg border transition-all duration-200 text-sm font-medium shadow-sm ${
                    currentPage === number
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                  aria-label={`Go to page ${number}`}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                aria-label="Next page"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {isDeleteModalOpen && (
            <motion.div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-modal="true"
              role="dialog"
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full border border-gray-200"
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="p-2 rounded-full bg-red-100 mt-0.5">
                    <FiXCircle size={20} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Delete Task</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Are you sure you want to delete "{selectedTask?.title}"? This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all duration-200 font-medium text-sm shadow-sm"
                    aria-label="Cancel deletion"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-sm"
                    aria-label="Confirm deletion"
                  >
                    Delete Task
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyTasks;