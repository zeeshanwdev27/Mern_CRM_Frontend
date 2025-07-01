import React from 'react';
import { FiActivity, FiUsers, FiBriefcase, FiDollarSign, FiCalendar, FiStar } from 'react-icons/fi';
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

const Dashboard = () => {
  // Dummy data for the dashboard
  const stats = [
    { title: 'Active Projects', value: 12, icon: <FiBriefcase className="text-blue-500" size={24} />, change: '+2', trend: 'up' },
    { title: 'New Clients', value: 8, icon: <FiUsers className="text-green-500" size={24} />, change: '+3', trend: 'up' },
    { title: 'Revenue', value: '$48,500', icon: <FiDollarSign className="text-purple-500" size={24} />, change: '12%', trend: 'up' },
    { title: 'Tasks Due', value: 5, icon: <FiCalendar className="text-yellow-500" size={24} />, change: '-1', trend: 'down' }
  ];

  const recentActivities = [
    { id: 1, project: 'E-commerce Platform', action: 'Milestone completed', time: '10 min ago', user: 'Alex Johnson' },
    { id: 2, project: 'Mobile App', action: 'New task assigned', time: '25 min ago', user: 'Sarah Williams' },
    { id: 3, project: 'Dashboard UI', action: 'Client feedback received', time: '1 hour ago', user: 'Mike Chen' },
    { id: 4, project: 'API Integration', action: 'Bug reported', time: '2 hours ago', user: 'Emma Davis' },
    { id: 5, project: 'Web Portal', action: 'Project delivered', time: '3 hours ago', user: 'David Kim' }
  ];

  const teamMembers = [
    { id: 1, name: 'Alex Johnson', role: 'Lead Developer', avatar: 'AJ', status: 'active', projects: 4 },
    { id: 2, name: 'Sarah Williams', role: 'UI/UX Designer', avatar: 'SW', status: 'active', projects: 3 },
    { id: 3, name: 'Mike Chen', role: 'Frontend Dev', avatar: 'MC', status: 'active', projects: 5 },
    { id: 4, name: 'Emma Davis', role: 'Backend Dev', avatar: 'ED', status: 'away', projects: 2 },
    { id: 5, name: 'David Kim', role: 'Project Manager', avatar: 'DK', status: 'active', projects: 6 }
  ];

  const projectStatusData = {
    labels: ['Completed', 'In Progress', 'On Hold', 'Not Started'],
    datasets: [
      {
        data: [5, 7, 2, 3],
        backgroundColor: [
          '#10B981', // green
          '#3B82F6', // blue
          '#F59E0B', // yellow
          '#E5E7EB'  // gray
        ],
        borderWidth: 0
      }
    ]
  };

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [12000, 19000, 15000, 28000, 22000, 31000],
        backgroundColor: '#6366F1', // indigo
        borderRadius: 6
      }
    ]
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Last updated: Today, {new Date().toLocaleTimeString()}</span>
          <button className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50">
            <FiActivity className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold mt-1 text-gray-800">{stat.value}</p>
                <p className={`text-sm mt-1 flex items-center ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change} {stat.trend === 'up' ? '↑' : '↓'} from last month
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
            <Bar 
              data={revenueData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
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
          </div>
        </div>

        {/* Project Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Status</h2>
          <div className="h-64 flex flex-col">
            <div className="flex-1">
              <Pie 
                data={projectStatusData} 
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
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {projectStatusData.labels.map((label, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: projectStatusData.datasets[0].backgroundColor[index] }}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {label}: {projectStatusData.datasets[0].data[index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="bg-blue-100 text-blue-600 rounded-lg p-2 mr-3">
                  <FiStar size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.project}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{activity.time}</p>
                  <p className="text-sm text-gray-600 mt-1">{activity.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Team Members</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {teamMembers.map(member => (
              <div key={member.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`relative mr-3 ${member.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-700">
                    {member.avatar}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${member.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{member.projects} projects</p>
                  <p className="text-xs text-gray-500">{member.status === 'active' ? 'Active' : 'Away'}</p>
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