import React, { useState, useEffect } from 'react';
import { 
  FiArrowLeft, 
  FiCalendar, 
  FiClock, 
  FiCheckCircle, 
  FiPause, 
  FiAlertCircle,
  FiPlus,
  FiUsers,
  FiFileText,
  FiBarChart2,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiCheck,
  FiX,
  FiList,
  FiTag
} from 'react-icons/fi';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = "http://localhost:3000";

const ProjectDetails = () => {
  
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignees: [],
    priority: 'medium',
    dueDate: '',
    status: 'pending'
  });
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const userString = JSON.parse(user)
  const userRole = userString?.role?.name
  
  

  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const [projectRes, tasksRes, teamRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/projects/${projectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/api/tasks?projectId=${projectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/api/users/allusers`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const projectData = projectRes.data;
        setProject({
          ...projectData,
          startDate: new Date(projectData.startDate).toISOString().split('T')[0],
          deadline: new Date(projectData.deadline).toISOString().split('T')[0],
          status: projectData.status === 'hold' ? 'on hold' : projectData.status
        });

        setTasks(tasksRes.data);
        setTeamMembers(teamRes.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, token]);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/tasks/project/${projectId}`,
        {
          ...newTask,
          dueDate: new Date(newTask.dueDate).toISOString()
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setTasks([...tasks, response.data]);
      setNewTask({
        title: '',
        description: '',
        assignees: [],
        priority: 'medium',
        dueDate: '',
        status: 'pending'
      });
      setShowTaskForm(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/tasks/${taskId}/status`,
        { status: newStatus },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setTasks(tasks.map(task => 
        task._id === taskId ? { 
          ...task, 
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date() : null
        } : task
      ));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <FiClock className="text-blue-500" />;
      case 'completed': return <FiCheckCircle className="text-green-500" />;
      case 'on hold': return <FiPause className="text-yellow-500" />;
      default: return <FiAlertCircle className="text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusClass = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Chart data for project progress
  const progressData = {
    labels: ['Progress'],
    datasets: [
      {
        label: 'Completion %',
        data: [project?.progress || 0],
        backgroundColor: project?.status === 'completed' ? '#10B981' :
                        project?.status === 'on hold' ? '#F59E0B' : '#3B82F6',
        borderRadius: 4
      }
    ]
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
        <div className="text-red-500 mb-4">
          <FiAlertCircle className="inline-block text-3xl" />
        </div>
        <h2 className="text-xl font-bold mb-2">Error Loading Project</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
  
  if (!project) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
        <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
        <p className="text-gray-600 mb-4">The requested project could not be found.</p>
        <button 
          onClick={() => navigate('/projects')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Projects
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="mr-4 p-2 rounded-full hover:bg-gray-100"
              >
                <FiArrowLeft className="text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityBadge(project.priority)}`}>
                {project.priority} priority
              </span>
              {userRole === 'Project Manager' && (
                <Link
                  to={`/projects/editproject/${project._id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiEdit2 className="mr-2" />
                  Edit Project
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Project Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Status Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  {getStatusIcon(project.status)}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Project Status
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 capitalize">
                      {project.status}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <FiCalendar className="text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Timeline
                  </dt>
                  <dd className="mt-1">
                    <div className="text-sm text-gray-900">
                      <span className="font-medium">Start:</span> {new Date(project.startDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-900">
                      <span className="font-medium">Deadline:</span> {new Date(project.deadline).toLocaleDateString()}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Team Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <FiUsers className="text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Team Members
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {project.team?.length || 0}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Project Progress</h3>
            <div className="h-64">
              <Bar 
                data={progressData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: { display: true, text: 'Completion %' }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Project Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Projects Section */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Client Projects
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                {project.clientProjects?.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {project.clientProjects.map((cp, index) => (
                      <li key={index} className="py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FiTag className="text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{cp.name}</div>
                            <div className="text-sm text-gray-500">Associated Project</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {cp.value ? `$${cp.value.toLocaleString()}` : 'No value set'}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No client projects associated with this project
                  </div>
                )}
              </div>
            </div>

            {/* Team Members Section */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Team Members
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                {project.team?.length > 0 ? (
                  <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {project.team.map((member) => {
                      const fullMember = teamMembers.find(tm => tm._id === member._id) || member;
                      return (
                        <li key={member._id} className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200">
                          <div className="w-full flex items-center justify-between p-6 space-x-6">
                            <div className="flex-1 truncate">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-gray-900 text-sm font-medium truncate">{fullMember.name}</h3>
                                <span className={`flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                                  fullMember.role === 'developer' ? 'bg-green-100 text-green-800' :
                                  fullMember.role === 'designer' ? 'bg-purple-100 text-purple-800' :
                                  fullMember.role === 'qa' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {fullMember.role}
                                </span>
                              </div>
                              <p className="mt-1 text-gray-500 text-sm truncate">{fullMember.email}</p>
                            </div>
                            <img 
                              className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" 
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullMember.name)}&background=random`} 
                              alt="" 
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No team members assigned to this project
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Tasks */}
          <div className="space-y-6">
            {/* Tasks Header */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Tasks
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {tasks.length} tasks
                    </span>
                  </h3>
                  {userRole === 'Project Manager' && (
                    <Link
                      to={`/tasks/newTask/${projectId}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                      {showTaskForm ? 'Cancel' : 'New Task'}
                    </Link>
                  )}
                </div>
              </div>

              {/* Task Creation Form */}
              {showTaskForm && (
                <div className="border-b border-gray-200 px-4 py-5 sm:p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Create New Task</h4>
                  <form onSubmit={handleTaskSubmit}>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-6">
                        <label htmlFor="task-title" className="block text-sm font-medium text-gray-700">
                          Task Title *
                        </label>
                        <input
                          type="text"
                          id="task-title"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={newTask.title}
                          onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                          required
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="task-assignees" className="block text-sm font-medium text-gray-700">
                          Assign To *
                        </label>
                        <select
                          multiple
                          id="task-assignees"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={newTask.assignees}
                          onChange={(e) => {
                            const options = Array.from(e.target.selectedOptions, opt => opt.value);
                            setNewTask({...newTask, assignees: options});
                          }}
                          required
                        >
                          {teamMembers.map(member => (
                            <option key={member._id} value={member._id}>
                              {member.name} ({member.role})
                            </option>
                          ))}
                        </select>
                        <p className="mt-2 text-sm text-gray-500">
                          Hold Ctrl/Cmd to select multiple team members
                        </p>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700">
                          Priority
                        </label>
                        <select
                          id="task-priority"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={newTask.priority}
                          onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="task-due-date" className="block text-sm font-medium text-gray-700">
                          Due Date *
                        </label>
                        <input
                          type="date"
                          id="task-due-date"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={newTask.dueDate}
                          onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                          required
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="task-description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={newTask.description}
                          onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowTaskForm(false)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Create Task
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tasks List */}
              {tasks.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <FiList className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new task.
                  </p>
                  {/* {userRole === 'Project Manager' && !showTaskForm && (
                    <div className="mt-6">
                      <button
                        onClick={() => setShowTaskForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                        New Task
                      </button>
                    </div>
                  )} */}
                </div>
              ) : (
                <div className="overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {tasks.map(task => {
                      const assignees = task.assignees.map(assigneeId => 
                        teamMembers.find(m => m._id === assigneeId)
                      ).filter(Boolean);
                      
                      return (
                        <li key={task._id} className="px-4 py-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0">
                              <input
                                type="checkbox"
                                checked={task.status === 'completed'}
                                onChange={() => handleTaskStatusChange(
                                  task._id, 
                                  task.status === 'completed' ? 'pending' : 'completed'
                                )}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div className="ml-3 min-w-0">
                                <p className={`text-sm font-medium truncate ${
                                  task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                                }`}>
                                  {task.title}
                                </p>
                                <div className="flex flex-wrap mt-1">
                                  {assignees.map(assignee => (
                                    <span key={assignee._id} className="mr-2 mb-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {assignee.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadge(task.priority)}`}>
                                {task.priority}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getTaskStatusClass(task.status)}`}>
                                {task.status}
                              </span>
                              {userRole === 'Project Manager' && (
                                <button
                                  onClick={() => handleDeleteTask(task._id)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <FiTrash2 />
                                </button>
                              )}
                            </div>
                          </div>
                          {task.description && (
                            <p className="mt-2 text-sm text-gray-500 truncate">
                              {task.description}
                            </p>
                          )}
                          <div className="mt-2 flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                            </span>
                            <span className="text-xs text-gray-500">
                              Created: {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;