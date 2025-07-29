import React, { useState, useEffect } from 'react';
import { 
  FiCheckCircle, 
  FiClock, 
  FiAlertTriangle, 
  FiPieChart, 
  FiUsers, 
  FiCalendar,
  FiSearch,
  FiFilter,
  FiChevronDown
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_BASE_URL = "http://localhost:3000";

const statusColors = {
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  'on hold': 'bg-amber-100 text-amber-800'
};

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
};

const ProjectCard = ({ project }) => {
  const progress = project.progress || 0;
  
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{project.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{project.client}</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full ${statusColors[project.status]}`}>
            {project.status}
          </span>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                progress >= 90 ? 'bg-green-500' : 
                progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
              }`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full ${priorityColors[project.priority]}`}>
            {project.priority} priority
          </span>
          <div className="flex items-center text-xs text-gray-500">
            <FiCalendar className="mr-1" size={14} />
            {new Date(project.deadline).toLocaleDateString()}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex -space-x-2">
            {project.team.slice(0, 4).map((member, i) => (
              <div 
                key={i} 
                className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-blue-800 text-xs font-medium"
              >
                {member.split(' ').map(n => n[0]).join('')}
              </div>
            ))}
          </div>
          <Link 
            to={`/projects/${project.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const MyProjects = () => {

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const userId = JSON.parse(localStorage.getItem('user'))?.id;
  
  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/users/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log(response.data.data)
        
        const transformedProjects = response.data.data.assignedProjects.map(project => ({
          id: project._id,
          name: project.clientProject.name || 'Unnamed Project',
          client: project.client?.name || 'Unknown Client',
          status: project.status === 'hold' ? 'on hold' : project.status,
          deadline: project.deadline,
          progress: project.progress || 0,
          priority: project.priority || 'medium',
          team: project.team?.map(member => member?.name || 'Unknown') || []
        }));
        
        setProjects(transformedProjects);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchMyProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) return (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6 text-red-500">
      Error loading projects: {error}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600 mt-1">Projects assigned to you</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
          </div>
        </div>
      </div>
      
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <FiAlertTriangle size={32} className="text-gray-400" />
            <p className="text-base font-medium text-gray-700">No projects found</p>
            {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                }} 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProjects;