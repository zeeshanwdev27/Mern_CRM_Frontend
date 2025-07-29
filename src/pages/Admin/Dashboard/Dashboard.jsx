import React, { useState, useEffect } from 'react';
import { FiActivity, FiUsers, FiBriefcase, FiDollarSign, FiCalendar, FiStar, FiTrendingUp, FiTrendingDown, FiCheckCircle } from 'react-icons/fi';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Centralized color palette
const colorPalette = {
  primary: 'rgba(59, 130, 246, 0.6)',
  primaryBorder: 'rgba(59, 130, 246, 1)',
  secondary: 'rgba(16, 185, 129, 0.6)',
  secondaryBorder: 'rgba(16, 185, 129, 1)',
  warning: 'rgba(245, 158, 11, 0.6)',
  warningBorder: 'rgba(245, 158, 11, 1)',
  danger: 'rgba(239, 68, 68, 0.6)',
  dangerBorder: 'rgba(239, 68, 68, 1)',
  neutral: 'rgba(156, 163, 175, 0.6)',
  neutralBorder: 'rgba(156, 163, 175, 1)'
};

const API_BASE_URL = "http://localhost:3000";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentTasks: [], // Changed from recentActivities to recentTasks
    recentProjects: [], // Added recentProjects
    projectStatusData: null,
    revenueData: null
  });

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        setLoading(true);
        setError(null);

        // Fetch all data in parallel - using same endpoints as Reports.jsx
        const [projectsRes, tasksRes, invoicesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/projects/getprojects`,{
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
          axios.get(`${API_BASE_URL}/api/tasks`,{
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
          axios.get(`${API_BASE_URL}/api/invoices`,{
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        ]);

        // Process data for dashboard using same logic as Reports.jsx
        const processedData = processDashboardData(
          projectsRes.data,
          tasksRes.data,
          invoicesRes.data.data
        );

        setDashboardData(processedData);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process raw API data into dashboard format
  const processDashboardData = (projects, tasks, invoices) => {
    // Helper function to format time ago
    const formatTimeAgo = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    // Process projects - same as Reports.jsx
    const recentProjects = projects.map(project => {
      const matchedProject = project.client?.projects?.find(
        p => p._id.toString() === project.clientProjectId.toString()
      );
      
      return {
        _id: project._id,
        name: matchedProject?.name || 'Unnamed Project',
        status: project.status,
        startDate: project.startDate,
        updatedAt: project.updatedAt,
        progress: project.progress,
        budget: matchedProject?.value || 0,
        client: project.client?.name || 'Unknown Client'
      };
    }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5); // Get only 5 most recent projects

    // Process tasks - same as Reports.jsx
    const recentTasks = [...tasks]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5); // Get only 5 most recent tasks

    // Process invoices - same as Reports.jsx
    const paidInvoices = invoices.filter(invoice => invoice.status === 'Paid');
    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const paidRevenue = paidInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

    // Calculate stats for dashboard cards
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const overdueTasks = tasks.filter(t => 
      new Date(t.dueDate) < new Date() && t.status !== 'Completed'
    ).length;

    // Format recent tasks for display
    const formattedRecentTasks = recentTasks.map(task => ({
      id: task._id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      time: formatTimeAgo(task.updatedAt),
      project: task.project?.name || 'General'
    }));

    // Format recent projects for display
    const formattedRecentProjects = recentProjects.map(project => ({
      id: project._id,
      name: project.name,
      status: project.status,
      progress: project.progress,
      time: formatTimeAgo(project.updatedAt),
      client: project.client
    }));

    // Project status data for pie chart - same as Reports.jsx
    const projectStatusData = {
      labels: ['Active', 'Completed', 'On Hold'],
      datasets: [
        {
          data: [
            projects.filter(p => p.status === 'active').length,
            projects.filter(p => p.status === 'completed').length,
            projects.filter(p => p.status === 'hold').length
          ],
          backgroundColor: [
            colorPalette.primary,
            colorPalette.secondary,
            colorPalette.warning
          ],
          borderColor: [
            colorPalette.primaryBorder,
            colorPalette.secondaryBorder,
            colorPalette.warningBorder
          ],
          borderWidth: 1
        }
      ]
    };

    // Group revenue by month for the last 6 months - same as Reports.jsx
    const now = new Date();
    const months = [];
    const monthlyRevenue = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      months.push(monthName);
      
      const monthRevenue = paidInvoices
        .filter(invoice => {
          const invoiceDate = new Date(invoice.invoiceDate);
          return invoiceDate.getMonth() === date.getMonth() && 
                 invoiceDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, invoice) => sum + invoice.total, 0);
      
      monthlyRevenue.push(monthRevenue);
    }

    const revenueData = {
      labels: months,
      datasets: [
        {
          label: 'Revenue ($)',
          data: monthlyRevenue,
          backgroundColor: colorPalette.primary,
          borderColor: colorPalette.primaryBorder,
          borderRadius: 6,
          borderWidth: 1
        }
      ]
    };

    return {
      stats: [
        { 
          title: 'Active Projects', 
          value: activeProjects, 
          icon: <FiBriefcase className="text-blue-500" size={24} />, 
          change: activeProjects > 5 ? '+2' : '+1', 
          trend: 'up' 
        },
        { 
          title: 'Completed Projects', 
          value: completedProjects, 
          icon: <FiCheckCircle className="text-green-500" size={24} />, 
          change: completedProjects > 3 ? `+${completedProjects - 3}` : `-${3 - completedProjects}`, 
          trend: completedProjects > 3 ? 'up' : 'down' 
        },
        { 
          title: 'Paid Invoices', 
          value: paidInvoices.length, 
          icon: <FiDollarSign className="text-green-500" size={24} />, 
          change: `$${paidRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 
          trend: 'up' 
        },
        { 
          title: 'Total Revenue', 
          value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 
          icon: <FiDollarSign className="text-purple-500" size={24} />, 
          change: '+12.5%', 
          trend: 'up' 
        },
      ],
      recentTasks: formattedRecentTasks, // Now contains only tasks
      recentProjects: formattedRecentProjects, // Now contains only projects
      projectStatusData,
      revenueData
    };
  };

  // Loading and error states - same as Reports.jsx
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-500">
            <FiActivity size={48} />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading dashboard</h3>
          <p className="mt-1 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Helper function to get status color - same as Reports.jsx
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
      case 'Not Started':
        return 'bg-amber-100 text-amber-800';
      case 'Overdue':
      case 'Blocked':
        return 'bg-red-100 text-red-800';
      case 'On Hold':
      case 'hold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Last updated: Today, {new Date().toLocaleTimeString()}</span>
          <button 
            onClick={() => window.location.reload()}
            className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
            aria-label="Refresh dashboard"
          >
            <FiActivity className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {dashboardData.stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold mt-1 text-gray-800">{stat.value}</p>
                <p className={`text-sm mt-1 flex items-center ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change} {stat.trend === 'up' ? <FiTrendingUp className="ml-1" /> : <FiTrendingDown className="ml-1" />}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Revenue Overview</h2>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1 bg-white">
              <option>Last 6 Months</option>
              <option>Last Year</option>
              <option>Last Quarter</option>
            </select>
          </div>
          <div className="h-64">
            {dashboardData.revenueData && (
              <Bar 
                data={dashboardData.revenueData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        drawBorder: false
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }} 
              />
            )}
          </div>
        </div>

        {/* Project Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Status</h2>
          <div className="h-64 flex flex-col">
            <div className="flex-1">
              {dashboardData.projectStatusData && (
                <Pie 
                  data={dashboardData.projectStatusData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }} 
                />
              )}
            </div>
            {dashboardData.projectStatusData && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {dashboardData.projectStatusData.labels.map((label, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: dashboardData.projectStatusData.datasets[0].backgroundColor[index] }}
                    ></div>
                    <span className="text-sm text-gray-600">
                      {label}: {dashboardData.projectStatusData.datasets[0].data[index]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Tasks</h2>
             <Link to={'/tasks'} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All
            </Link>
            </div>
          <div className="space-y-4">
            {dashboardData.recentTasks.map(task => (
              <div key={task.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="bg-blue-100 text-blue-600 rounded-lg p-2 mr-3">
                  <FiCheckCircle size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{task.title}</p>
                  <p className="text-sm text-gray-600">{task.project}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium mt-1 inline-block ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{task.time}</p>
                  <p className="text-sm text-gray-600 mt-1">Priority: {task.priority}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Projects</h2>
            <Link to={'/projects'} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData.recentProjects.map(project => (
              <div key={project.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="relative mr-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-700">
                    {project.name.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{project.name}</p>
                  <p className="text-sm text-gray-600">{project.client}</p>
                  <div className="mt-1 flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {project.progress}% complete
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{project.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;