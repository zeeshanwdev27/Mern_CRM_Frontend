import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiUser,
  FiFlag,
  FiCalendar,
  FiMoreVertical,
  FiPaperclip
} from 'react-icons/fi';

// Status configuration
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

// Priority configuration
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

// Dummy data
const dummyTasks = [
  { 
    id: 1, 
    title: 'Implement user authentication', 
    description: 'Create login and registration pages with JWT support',
    status: 'In Progress',
    priority: 'High',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: { id: 1, name: 'John Doe', avatar: 'JD', role: 'Developer' },
    createdAt: new Date().toISOString(),
    tags: ['Auth', 'Security'],
    attachments: 2
  },
  { 
    id: 2, 
    title: 'Design dashboard UI', 
    description: 'Create mockups for the admin dashboard with dark/light mode support',
    status: 'Completed',
    priority: 'Medium',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: { id: 2, name: 'Sarah Smith', avatar: 'SS', role: 'Designer' },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['UI/UX'],
    attachments: 3
  },
  { 
    id: 3, 
    title: 'API documentation', 
    description: 'Document all endpoints for the REST API with examples',
    status: 'Not Started',
    priority: 'Low',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: null,
    createdAt: new Date().toISOString(),
    tags: ['Documentation'],
    attachments: 0
  }
];

const dummyTeamMembers = [
  { id: 1, name: 'John Doe', avatar: 'JD', role: 'Developer' },
  { id: 2, name: 'Sarah Smith', avatar: 'SS', role: 'Designer' },
  { id: 3, name: 'Mike Johnson', avatar: 'MJ', role: 'QA Engineer' },
  { id: 4, name: 'Emma Wilson', avatar: 'EW', role: 'Project Manager' }
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

const DueDateBadge = ({ date, status }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);
  const isOverdue = dueDate < today && status !== 'Completed';
  
  const formattedDate = dueDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: dueDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
  
  return (
    <div className={`flex items-center gap-2 text-xs ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
      <FiCalendar size={14} className="flex-shrink-0" />
      <span>{formattedDate}</span>
    </div>
  );
};

const AssigneeDropdown = ({ assignee, teamMembers, isOpen, onOpenChange, onAssign, onUnassign }) => {
  return (
    <div className="relative">
      <button 
        onClick={() => onOpenChange(!isOpen)}
        className="flex items-center gap-2 group"
        aria-label={assignee ? `Change assignee (currently ${assignee.name})` : 'Assign task'}
        aria-expanded={isOpen}
      >
        {assignee ? (
          <>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-medium shadow-sm">
              {assignee.avatar}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                {assignee.name}
              </div>
              <div className="text-xs text-gray-500">{assignee.role}</div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-gray-500 group-hover:text-blue-600 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
              <FiUser size={14} className="text-gray-500" />
            </div>
            <span className="text-sm font-medium">Unassigned</span>
          </div>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute z-20 top-10 left-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
          >
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                Assign to
              </div>
              <div className="max-h-60 overflow-y-auto">
                {teamMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => {
                      onAssign(member);
                      onOpenChange(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer text-left transition-colors"
                    aria-label={`Assign to ${member.name}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-medium shadow-sm">
                      {member.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.role}</div>
                    </div>
                  </button>
                ))}
              </div>
              {assignee && (
                <button
                  onClick={() => {
                    onUnassign();
                    onOpenChange(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer text-red-500 mt-1 border-t border-gray-100 transition-colors"
                >
                  <FiXCircle size={14} />
                  <span className="text-sm font-medium">Unassign</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TaskActionsMenu = ({ isOpen, onOpenChange, task, onEdit, onDelete, onStatusChange }) => {
  return (
    <div className="relative">
      <button 
        onClick={() => onOpenChange(!isOpen)}
        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Task actions"
        aria-expanded={isOpen}
      >
        <FiMoreVertical size={18} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute z-20 top-10 right-0 w-48 bg-white rounded-lg shadow-xl border border-gray-200 origin-top-right"
          >
            <div className="py-1">
              <button
                onClick={() => {
                  onEdit(task);
                  onOpenChange(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FiEdit2 size={14} />
                <span>Edit Task</span>
              </button>
              
              {statusOptions.map(option => (
                task.status !== option.value && (
                  <button
                    key={option.value}
                    onClick={() => {
                      onStatusChange(task.id, option.value);
                      onOpenChange(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${option.textClass} hover:bg-gray-50 transition-colors`}
                  >
                    {React.cloneElement(option.icon, { size: 14 })}
                    <span>Mark as {option.value}</span>
                  </button>
                )
              ))}
              
              <button
                onClick={() => {
                  onDelete(task);
                  onOpenChange(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 transition-colors"
              >
                <FiTrash2 size={14} />
                <span>Delete Task</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TaskCard = ({ 
  task, 
  teamMembers, 
  onStatusChange,
  onAssign,
  onUnassign,
  onDelete,
  onEdit
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
  
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
          <TaskActionsMenu 
            isOpen={isMenuOpen}
            onOpenChange={setIsMenuOpen}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {task.tags?.map(tag => (
            <span key={tag} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
              {tag}
            </span>
          ))}
          {task.attachments > 0 && (
            <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full flex items-center gap-1">
              <FiPaperclip size={12} /> {task.attachments}
            </span>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <StatusBadge status={task.status} />
          
          <div className="flex items-center gap-3">
            <PriorityBadge priority={task.priority} />
            <DueDateBadge date={task.dueDate} status={task.status} />
          </div>
          
          <AssigneeDropdown 
            assignee={task.assignee} 
            teamMembers={teamMembers}
            isOpen={isAssigneeOpen}
            onOpenChange={setIsAssigneeOpen}
            onAssign={(member) => onAssign(task.id, member)}
            onUnassign={() => onUnassign(task.id)}
          />
        </div>
      </div>
    </motion.div>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const tasksPerPage = 6;

  useEffect(() => {
    // Load data
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setTasks(dummyTasks);
        setTeamMembers(dummyTeamMembers);
      } catch (err) {
        setError("Failed to load tasks. Please try again later.");
        console.error("Error loading tasks:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.assignee && task.assignee.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      activeFilter === 'All' || 
      task.status === activeFilter ||
      task.priority === activeFilter ||
      (activeFilter === 'Unassigned' && !task.assignee);
    
    return matchesSearch && matchesFilter;
  });

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  const handleAssignTask = (taskId, member) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId ? { ...task, assignee: member } : task
    ));
  };

  const handleUnassignTask = (taskId) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId ? { ...task, assignee: null } : task
    ));
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleDeleteTask = (task) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTask.id));
    setIsDeleteModalOpen(false);
  };

  const handleEditTask = (task) => {
    console.log("Editing task:", task);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Team Tasks</h1>
            <p className="text-gray-600 text-sm mt-1">Manage and track your team's work</p>
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
        {isLoading ? (
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
        ) : currentTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {currentTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  teamMembers={teamMembers}
                  onStatusChange={handleStatusChange}
                  onAssign={handleAssignTask}
                  onUnassign={handleUnassignTask}
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

export default Tasks;