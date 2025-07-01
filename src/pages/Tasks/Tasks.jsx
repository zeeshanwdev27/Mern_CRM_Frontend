import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  FiCheck,
  FiAlertCircle,
  FiFlag,
  FiUser,
  FiUsers,
  FiCalendar,
  FiMoreVertical
} from 'react-icons/fi';

const Tasks = () => {
  const teamMembers = [
    { id: 1, name: 'John Doe', avatar: 'JD', role: 'Developer' },
    { id: 2, name: 'Sarah Smith', avatar: 'SS', role: 'Designer' },
    { id: 3, name: 'Mike Johnson', avatar: 'MJ', role: 'QA Engineer' },
    { id: 4, name: 'Emma Wilson', avatar: 'EW', role: 'Project Manager' },
    { id: 5, name: 'Alex Brown', avatar: 'AB', role: 'Developer' },
  ];

  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      title: 'Implement user authentication', 
      description: 'Create login and registration pages with JWT support',
      status: 'In Progress',
      priority: 'High',
      dueDate: '2023-06-15',
      assignee: teamMembers[0],
      createdAt: '2023-06-01'
    },
    { 
      id: 2, 
      title: 'Design dashboard UI', 
      description: 'Create mockups for the admin dashboard',
      status: 'Completed',
      priority: 'Medium',
      dueDate: '2023-06-10',
      assignee: teamMembers[1],
      createdAt: '2023-05-28'
    },
    { 
      id: 3, 
      title: 'API documentation', 
      description: 'Document all endpoints for the REST API',
      status: 'Not Started',
      priority: 'Low',
      dueDate: '2023-06-20',
      assignee: null,
      createdAt: '2023-06-05'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const tasksPerPage = 5;

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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDeleteClick = (task) => {
    setSelectedTask(task);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setTasks(tasks.filter(task => task.id !== selectedTask.id));
    setShowDeleteModal(false);
    setSuccessMessage(`Task "${selectedTask.title}" deleted successfully`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleAssigneeDropdown = (taskId) => {
    setShowAssigneeDropdown(showAssigneeDropdown === taskId ? null : taskId);
    setShowActionMenu(null);
  };

  const toggleActionMenu = (taskId) => {
    setShowActionMenu(showActionMenu === taskId ? null : taskId);
    setShowAssigneeDropdown(null);
  };

  const assignTask = (taskId, member) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, assignee: member } : task
    ));
    setShowAssigneeDropdown(null);
    setSuccessMessage(`Task assigned to ${member.name}`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const unassignTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, assignee: null } : task
    ));
    setShowAssigneeDropdown(null);
    setSuccessMessage(`Task unassigned`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const markAsComplete = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: 'Completed' } : task
    ));
    setSuccessMessage(`Task marked as completed`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-red-500';
      case 'Medium': return 'text-amber-500';
      case 'Low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'High': return <FiFlag className="text-red-500" />;
      case 'Medium': return <FiFlag className="text-amber-500" />;
      case 'Low': return <FiFlag className="text-blue-500" />;
      default: return <FiFlag className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Team Tasks</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and track your team's work</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/tasks/add"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all duration-200 font-medium shadow-sm"
            >
              <FiPlus size={16} />
              <span>New Task</span>
            </Link>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-3 animate-fade-in border border-emerald-200">
            <FiCheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
            <p className="font-medium text-sm">{successMessage}</p>
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
              onChange={handleSearch}
              className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400 shadow-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => setActiveFilter('All')}
              className={`px-3 py-2 rounded-lg border transition-all duration-200 font-medium text-sm flex items-center gap-2 ${
                activeFilter === 'All' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-inner' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <FiFilter size={14} />
              All Tasks
            </button>
            <button 
              onClick={() => setActiveFilter('High')}
              className={`px-3 py-2 rounded-lg border transition-all duration-200 font-medium text-sm flex items-center gap-2 ${
                activeFilter === 'High' 
                  ? 'border-red-500 bg-red-50 text-red-700 shadow-inner' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <FiFlag className="text-red-500" size={14} />
              High
            </button>
            <button 
              onClick={() => setActiveFilter('In Progress')}
              className={`px-3 py-2 rounded-lg border transition-all duration-200 font-medium text-sm flex items-center gap-2 ${
                activeFilter === 'In Progress' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-inner' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <FiClock className="text-blue-500" size={14} />
              In Progress
            </button>
            <button 
              onClick={() => setActiveFilter('Not Started')}
              className={`px-3 py-2 rounded-lg border transition-all duration-200 font-medium text-sm flex items-center gap-2 ${
                activeFilter === 'Not Started' 
                  ? 'border-gray-500 bg-gray-50 text-gray-700 shadow-inner' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <FiAlertCircle className="text-gray-500" size={14} />
              Not Started
            </button>
            <button 
              onClick={() => setActiveFilter('Unassigned')}
              className={`px-3 py-2 rounded-lg border transition-all duration-200 font-medium text-sm flex items-center gap-2 ${
                activeFilter === 'Unassigned' 
                  ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-inner' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <FiUser className="text-purple-500" size={14} />
              Unassigned
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-5">Task</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Due Date</div>
            <div className="col-span-2">Assignee</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Tasks */}
          {currentTasks.length > 0 ? (
            currentTasks.map((task) => (
              <div key={task.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                {/* Task Details */}
                <div className="col-span-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {task.status === 'Completed' ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <FiCheck size={12} />
                        </div>
                      ) : (
                        <div className={`w-5 h-5 rounded-full border ${getPriorityColor(task.priority)} border-current`}></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>

                {/* Due Date */}
                <div className="col-span-2 flex items-center">
                  <div className="flex items-center gap-2 text-sm">
                    <FiCalendar size={14} className="text-gray-400" />
                    <span className={task.dueDate < new Date().toISOString().split('T')[0] && task.status !== 'Completed' ? 'text-red-500' : 'text-gray-600'}>
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>

                {/* Assignee */}
                <div className="col-span-2 flex items-center relative">
                  <div 
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => toggleAssigneeDropdown(task.id)}
                  >
                    {task.assignee ? (
                      <>
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-medium">
                          {task.assignee.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {task.assignee.name}
                          </div>
                          <div className="text-xs text-gray-500">{task.assignee.role}</div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500 group-hover:text-blue-600 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <FiUser size={16} className="text-gray-400" />
                        </div>
                        <span className="text-sm font-medium">Unassigned</span>
                      </div>
                    )}
                  </div>
                  {showAssigneeDropdown === task.id && (
                    <div className="absolute z-10 top-10 left-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 animate-fade-in">
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                          Assign to
                        </div>
                        {teamMembers.map(member => (
                          <div 
                            key={member.id}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                            onClick={() => assignTask(task.id, member)}
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-medium">
                              {member.avatar}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-xs text-gray-500">{member.role}</div>
                            </div>
                          </div>
                        ))}
                        {task.assignee && (
                          <div 
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer text-red-500 mt-1 border-t border-gray-100"
                            onClick={() => unassignTask(task.id)}
                          >
                            <FiXCircle size={14} />
                            <span className="text-sm font-medium">Unassign</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex justify-end items-center relative">
                  <button 
                    onClick={() => toggleActionMenu(task.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiMoreVertical size={18} />
                  </button>
                  {showActionMenu === task.id && (
                    <div className="absolute z-10 top-10 right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 animate-fade-in">
                      <div className="py-1">
                        <Link
                          to={`/tasks/edit/${task.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FiEdit2 size={14} />
                          <span>Edit</span>
                        </Link>
                        {task.status !== 'Completed' && (
                          <button
                            onClick={() => {
                              markAsComplete(task.id);
                              setShowActionMenu(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 hover:bg-gray-50"
                          >
                            <FiCheck size={14} />
                            <span>Mark Complete</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            handleDeleteClick(task);
                            setShowActionMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <FiTrash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
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
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredTasks.length > tasksPerPage && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{indexOfFirstTask + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(indexOfLastTask, filteredTasks.length)}
              </span>{' '}
              of <span className="font-medium">{filteredTasks.length}</span> tasks
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Previous page"
              >
                <FiChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`w-10 h-10 rounded-lg border transition-all duration-200 text-sm font-medium ${
                    currentPage === number
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  aria-label={`Page ${number}`}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Next page"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full animate-scale-in">
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
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-sm"
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;