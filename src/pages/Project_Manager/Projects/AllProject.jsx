import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiPlus, 
  FiFilter, 
  FiChevronDown, 
  FiClock,
  FiCheckCircle,
  FiPause,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiAlertCircle,
  FiBriefcase
} from 'react-icons/fi';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Link } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = "http://localhost:3000";

const AllProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const token = localStorage.getItem('token');

  // Fetch projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/projects/getprojects`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Transform the data to match frontend structure
        const transformedProjects = response.data.map(project => {
          // Get all client project names
          const clientProjectsList = project.clientProjects.map(cp => ({
            id: cp._id,
            name: cp.name
          }));

          return {
            id: project._id,
            client: {
              id: project.client?._id,
              name: project.client?.name || 'Unknown Client'
            },
            clientProjects: clientProjectsList,
            status: project.status === 'hold' ? 'on hold' : project.status,
            startDate: new Date(project.startDate).toISOString().split('T')[0],
            deadline: new Date(project.deadline).toISOString().split('T')[0],
            progress: project.progress,
            priority: project.priority,
            createdAt: project.createdAt
          };
        });

        setProjects(transformedProjects);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDeleteProject = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/projects/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProjects(projects.filter(project => project.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Chart data
  const projectStatusData = {
    labels: projects.map(project => project.client.name),
    datasets: [
      {
        label: 'Progress %',
        data: projects.map(project => project.progress),
        backgroundColor: projects.map(project => 
          project.status === 'completed' ? '#10B981' :
          project.status === 'on hold' ? '#F59E0B' :
          '#3B82F6'
        ),
        borderRadius: 4
      }
    ]
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         project.clientProjects.some(cp => cp.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

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

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Project Management</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
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
                <option value="on hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
              <FiChevronDown className="absolute right-3 top-2.5 text-gray-400" />
            </div>
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <FiChevronDown className="absolute right-3 top-2.5 text-gray-400" />
            </div>
            <Link to="/projects/newproject" 
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="mr-2" />
              New Project
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Projects</p>
          <p className="text-2xl font-bold mt-1 text-gray-800">{projects.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Active</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">
            {projects.filter(p => p.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Completed</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {projects.filter(p => p.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Progress</h2>
        <div className="h-64">
          <Bar 
            data={projectStatusData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: {
                    display: true,
                    text: 'Completion %'
                  }
                }
              }
            }} 
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projects
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{project.client.name}</div>
                    <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadge(project.priority)}`}>
                      {project.priority} priority
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FiBriefcase className="text-gray-500 mr-2" />
                      <div className="text-sm text-gray-700">
                        {project.clientProjects.length} projects
                        <div className="text-xs text-gray-500 mt-1">
                          {project.clientProjects.slice(0, 2).map(p => p.name).join('')}
                          {/* {project.clientProjects.length > 2 && ` +${project.clientProjects.length - 2}`} */}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(project.status)}
                      <span className="ml-2 capitalize">{project.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(project.startDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      <FiCalendar className="inline mr-1" />
                      {new Date(project.deadline).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          project.status === 'completed' ? 'bg-green-500' :
                          project.status === 'on hold' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-start text-xs text-gray-500 mt-1">
                      {project.progress}% complete
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-center space-x-2">
                      <Link 
                        to={{
                          pathname: `/projects/editproject/${project.id}`,
                          state: { 
                            clientId: project.client.id,
                            selectedProjects: project.clientProjects.map(p => p.id) 
                          }
                        }} 
                        className="text-blue-600 hover:text-blue-900 cursor-pointer"
                      >
                        <FiEdit2 />
                      </Link>
                      <button 
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllProjects;