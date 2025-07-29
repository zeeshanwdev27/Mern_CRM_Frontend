import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import {
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiTrendingDown,
  FiDownload,
  FiCalendar,
  FiFilter,
  FiRefreshCw,
  FiPrinter,
  FiUsers,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
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

const Reports = () => {
  // State for filters
  const [timeRange, setTimeRange] = useState('30days');
  const [activeReport, setActiveReport] = useState('overview');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedExport, setSelectedExport] = useState('pdf');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    overview: null,
    financial: null,
    projects: null,
    tasks: null,
  });

  // Time range options
  const timeRanges = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last Quarter' },
    { value: '12months', label: 'Last 12 Months' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Report type options
  const reportTypes = [
    { value: 'overview', label: 'Overview', icon: <FiBarChart2 /> },
    { value: 'financial', label: 'Financial', icon: <FiDollarSign /> },
    { value: 'projects', label: 'Projects', icon: <FiUsers /> },
    { value: 'tasks', label: 'Tasks', icon: <FiCheckCircle /> },
  ];

  // Export format options
  const exportFormats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'csv', label: 'CSV' },
    { value: 'excel', label: 'Excel' },
    { value: 'image', label: 'Image' }
  ];

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

        // Calculate date range based on selected time range
        let startDate, endDate = new Date();
        switch (timeRange) {
          case '7days':
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            break;
          case '30days':
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            break;
          case '90days':
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 90);
            break;
          case '12months':
            startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
          case 'custom':
            startDate = customStartDate;
            endDate = customEndDate || new Date();
            break;
          default:
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
        }
        

        // Fetch all data in parallel
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

        // Process data for reports
        const processedData = processReportData(
          projectsRes.data,
          tasksRes.data,
          invoicesRes.data.data,
          startDate,
          endDate
        );

        setReportData(processedData);
        
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, customStartDate, customEndDate, activeReport]);

  // Process raw API data into report format
  const processReportData = (projects, tasks, invoices, startDate, endDate) => {
    // Helper functions
    const filterByDateRange = (items, dateField) => {
      return items.filter(item => {
        const itemDate = new Date(item[dateField]);
        return (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
      });
    };

    // Process projects - transform to match what Reports expects
    const recentProjects = filterByDateRange(projects, 'startDate').map(project => {
      // Find the matching project in client's projects array
      const matchedProject = project.client?.projects?.find(
        p => p._id.toString() === project.clientProjectId.toString()
      );
      
      return {
        _id: project._id,
        name: matchedProject?.name || 'Unnamed Project',
        status: project.status,
        startDate: project.startDate,
        progress: project.progress,
        budget: matchedProject?.value || 0,
        actualCost: 0, // You might need to calculate this from actual data
        client: project.client?.name || 'Unknown Client'
      };
    });

    const projectStatusCounts = recentProjects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});

    // Process tasks
    const recentTasks = filterByDateRange(tasks, 'startDate');
    const taskStatusCounts = recentTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    // Calculate completed tasks percentage for task completion rate
    const completedTasksCount = taskStatusCounts['Completed'] || 0;
    const totalTasksCount = recentTasks.length;
    const taskCompletionRate = totalTasksCount > 0 ? 
      Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    // Process invoices
    const paidInvoices = invoices.filter(invoice => invoice.status === 'Paid');
    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const paidRevenue = paidInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const outstandingInvoices = invoices.filter(invoice => invoice.status !== 'Paid');
    const totalOutstanding = outstandingInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

    // Calculate invoice paid percentage
    const invoicePaidPercentage = invoices.length > 0 ?
      Math.round((paidInvoices.length / invoices.length) * 100) : 0;

    // Group invoices by month for revenue chart
    const monthlyRevenue = {};
    invoices.forEach(invoice => {
      const month = new Date(invoice.invoiceDate).toLocaleString('default', { month: 'short' });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + invoice.total;
    });

    // Group paid invoices by client for client revenue chart
    const clientRevenue = {};
    paidInvoices.forEach(invoice => {
      const clientName = invoice.client?.company || 'Unknown Client';
      clientRevenue[clientName] = (clientRevenue[clientName] || 0) + invoice.total;
    });

    // Calculate financial stats
    const expenses = 0; // You would need an expenses API for this
    const netProfit = paidRevenue - expenses;

    return {
      overview: {
        title: "Business Overview",
        stats: [
          { 
            title: "Total Revenue", 
            value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 
            change: "+12.5%", 
            trend: "up", 
            icon: <FiDollarSign className="text-blue-500" /> 
          },
          { 
            title: "Active Projects", 
            value: recentProjects.filter(p => p.status === 'active').length, 
            change: "+2", 
            trend: "up", 
            icon: <FiUsers className="text-emerald-500" /> 
          },
          { 
            title: "Overdue Tasks", 
            value: recentTasks.filter(t => 
              new Date(t.dueDate) < new Date() && t.status !== 'Completed'
            ).length, 
            change: "-3", 
            trend: "down", 
            icon: <FiClock className="text-amber-500" /> 
          },
          { 
            title: "Invoice Paid", 
            value: `${invoicePaidPercentage}%`, 
            change: "+5%", 
            trend: "up", 
            icon: <FiCheckCircle className="text-green-500" /> 
          }
        ],
        charts: [
          { 
            type: "bar", 
            title: "Revenue by Month", 
            component: <Bar 
              data={{
                labels: Object.keys(monthlyRevenue),
                datasets: [{
                  label: 'Revenue',
                  data: Object.values(monthlyRevenue),
                  backgroundColor: colorPalette.primary,
                  borderColor: colorPalette.primaryBorder,
                  borderWidth: 1
                }]
              }} 
              options={{
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }} 
            /> 
          },
          { 
            type: "line", 
            title: "Task Completion Rate", 
            component: <Line 
              data={{
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [
                  {
                    label: 'Completed',
                    data: [taskCompletionRate, taskCompletionRate, taskCompletionRate, taskCompletionRate],
                    borderColor: colorPalette.secondaryBorder,
                    backgroundColor: colorPalette.secondary.replace('0.6', '0.1'),
                    tension: 0.3,
                    fill: true
                  }
                ]
              }} 
              options={{
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                  legend: {
                    position: 'top'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }} 
            /> 
          }
        ],
        tableData: recentProjects.map(project => ({
          id: project._id,
          item: project.name,
          status: project.status === 'active' ? 'In Progress' : 
                 project.status === 'completed' ? 'Completed' : 'On Hold',
          value: `$${project.budget || 0}`,
          date: project.startDate
        }))
      },
      financial: {
        title: "Financial Reports",
        stats: [
          { 
            title: "Total Income", 
            value: `$${paidRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 
            change: "+12.5%", 
            trend: "up", 
            icon: <FiDollarSign className="text-green-500" /> 
          },
          { 
            title: "Total Expenses", 
            value: `$${expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 
            change: "+3.2%", 
            trend: "up", 
            icon: <FiDollarSign className="text-red-500" /> 
          },
          { 
            title: "Net Profit", 
            value: `$${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 
            change: "+18.7%", 
            trend: "up", 
            icon: <FiTrendingUp className="text-emerald-500" /> 
          },
          { 
            title: "Outstanding Invoices", 
            value: `$${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 
            change: "-$1,200", 
            trend: "down", 
            icon: <FiAlertCircle className="text-amber-500" /> 
          }
        ],
        charts: [
          { 
            type: "pie", 
            title: "Revenue by Client", 
            component: <Pie 
              data={{
                labels: Object.keys(clientRevenue),
                datasets: [{
                  data: Object.values(clientRevenue),
                  backgroundColor: [
                    colorPalette.secondary,
                    colorPalette.primary,
                    colorPalette.warning,
                    colorPalette.danger,
                    colorPalette.neutral
                  ],
                  borderColor: [
                    colorPalette.secondaryBorder,
                    colorPalette.primaryBorder,
                    colorPalette.warningBorder,
                    colorPalette.dangerBorder,
                    colorPalette.neutralBorder
                  ],
                  borderWidth: 1
                }]
              }} 
              options={{
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }} 
            /> 
          },
          { 
            type: "bar", 
            title: "Expenses by Category", 
            component: <Bar 
              data={{
                labels: ['Salaries', 'Software', 'Marketing', 'Office', 'Other'],
                datasets: [{
                  label: 'Expenses',
                  data: [12500, 3200, 4500, 1800, 2200],
                  backgroundColor: colorPalette.danger,
                  borderColor: colorPalette.dangerBorder,
                  borderWidth: 1
                }]
              }} 
              options={{
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }} 
            /> 
          }
        ],
        tableData: invoices.map(invoice => ({
          id: invoice._id,
          client: invoice.client?.company || 'Unknown',
          status: invoice.status,
          amount: `$${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          date: invoice.invoiceDate
        }))
      },
      projects: {
        title: "Project Reports",
        stats: [
          { 
            title: "Active Projects", 
            value: recentProjects.filter(p => p.status === 'active').length, 
            change: "+2", 
            trend: "up", 
            icon: <FiUsers className="text-blue-500" /> 
          },
          { 
            title: "Completed This Month", 
            value: recentProjects.filter(p => p.status === 'completed').length, 
            change: "+1", 
            trend: "up", 
            icon: <FiCheckCircle className="text-emerald-500" /> 
          },
          { 
            title: "On Hold This Month", 
            value: recentProjects.filter(p => p.status === 'hold').length, 
            change: "-2", 
            trend: "down", 
            icon: <FiClock className="text-amber-500" /> 
          },
          { 
            title: "Avg. Completion Time", 
            value: "NF", 
            change: "-1.2", 
            trend: "down", 
            icon: <FiTrendingDown className="text-red-500" /> 
          }
        ],
        charts: [
          { 
            type: "pie", 
            title: "Projects by Status", 
            component: <Pie 
              data={{
                labels: ['Active', 'Completed', 'On Hold'],
                datasets: [{
                  data: [
                    recentProjects.filter(p => p.status === 'active').length,
                    recentProjects.filter(p => p.status === 'completed').length,
                    recentProjects.filter(p => p.status === 'hold').length
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
                }]
              }} 
              options={{
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }} 
            /> 
          },
          { 
            type: "bar", 
            title: "Project Budget Utilization", 
            component: <Bar 
              data={{
                labels: recentProjects.slice(0, 5).map(p => p.name),
                datasets: [
                  {
                    label: 'Budget',
                    data: recentProjects.slice(0, 5).map(p => p.budget || 0),
                    backgroundColor: colorPalette.neutral,
                    borderColor: colorPalette.neutralBorder,
                    borderWidth: 1
                  },
                  {
                    label: 'Actual',
                    data: recentProjects.slice(0, 5).map(p => p.actualCost || 0),
                    backgroundColor: colorPalette.primary,
                    borderColor: colorPalette.primaryBorder,
                    borderWidth: 1
                  }
                ]
              }} 
              options={{
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }} 
            /> 
          }
        ],
        tableData: recentProjects.map(project => ({
          id: project._id,
          project: project.name,
          status: project.status === 'active' ? 'In Progress' : 
                 project.status === 'completed' ? 'Completed' : 'On Hold',
          progress: `${project.progress || 0}%`,
          date: project.startDate,
          client: project.client
        }))
      },
      tasks: {
        title: "Task Reports",
        stats: [
          { 
            title: "Total Tasks", 
            value: recentTasks.length, 
            change: "+5", 
            trend: "up", 
            icon: <FiCheckCircle className="text-blue-500" /> 
          },
          { 
            title: "Completed", 
            value: recentTasks.filter(t => t.status === 'Completed').length, 
            change: "+3", 
            trend: "up", 
            icon: <FiCheckCircle className="text-emerald-500" /> 
          },
          { 
            title: "Overdue", 
            value: recentTasks.filter(t => 
              new Date(t.dueDate) < new Date() && t.status !== 'Completed'
            ).length, 
            change: "-2", 
            trend: "down", 
            icon: <FiClock className="text-amber-500" /> 
          },
          { 
            title: "Avg. Completion", 
            value: "3.2 days", 
            change: "-0.5", 
            trend: "down", 
            icon: <FiTrendingDown className="text-red-500" /> 
          }
        ],
        charts: [
          { 
            type: "pie", 
            title: "Tasks by Status", 
            component: <Pie 
              data={{
                labels: ['Completed', 'In Progress', 'Not Started', 'Blocked'],
                datasets: [{
                  data: [
                    recentTasks.filter(t => t.status === 'Completed').length,
                    recentTasks.filter(t => t.status === 'In Progress').length,
                    recentTasks.filter(t => t.status === 'Not Started').length,
                    recentTasks.filter(t => t.status === 'Blocked').length
                  ],
                  backgroundColor: [
                    colorPalette.secondary,
                    colorPalette.primary,
                    colorPalette.neutral,
                    colorPalette.danger
                  ],
                  borderColor: [
                    colorPalette.secondaryBorder,
                    colorPalette.primaryBorder,
                    colorPalette.neutralBorder,
                    colorPalette.dangerBorder
                  ],
                  borderWidth: 1
                }]
              }} 
              options={{
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }} 
            /> 
          },
          { 
            type: "bar", 
            title: "Tasks by Priority", 
            component: <Bar 
              data={{
                labels: ['High', 'Medium', 'Low'],
                datasets: [{
                  label: 'Tasks',
                  data: [
                    recentTasks.filter(t => t.priority === 'High').length,
                    recentTasks.filter(t => t.priority === 'Medium').length,
                    recentTasks.filter(t => t.priority === 'Low').length
                  ],
                  backgroundColor: [
                    colorPalette.danger,
                    colorPalette.warning,
                    colorPalette.secondary
                  ],
                  borderColor: [
                    colorPalette.dangerBorder,
                    colorPalette.warningBorder,
                    colorPalette.secondaryBorder
                  ],
                  borderWidth: 1
                }]
              }} 
              options={{
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }} 
            /> 
          }
        ],
        tableData: recentTasks.map(task => ({
          id: task._id,
          item: task.title,
          status: task.status,
          value: task.priority,
          date: task.dueDate
        }))
      }
    };
  };

  // Filter table data by time range
  const filterTableDataByTimeRange = (data, timeRange, startDate, endDate) => {
    if (!data) return [];
    if (timeRange === 'custom' && (!startDate || !endDate)) return data;

    const now = new Date();
    let start;

    switch (timeRange) {
      case '7days':
        start = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30days':
        start = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90days':
        start = new Date(now.setDate(now.getDate() - 90));
        break;
      case '12months':
        start = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'custom':
        start = startDate;
        break;
      default:
        return data;
    }

    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= start && (!endDate || itemDate <= endDate);
    });
  };

  const filteredTableData = filterTableDataByTimeRange(
    reportData[activeReport]?.tableData || [], 
    timeRange, 
    customStartDate, 
    customEndDate
  );

  // Helper functions
  const toggleExportMenu = () => {
    setShowExportMenu(!showExportMenu);
  };

  const handleExport = (format) => {
    setSelectedExport(format);
    setShowExportMenu(false);
    if (format === 'csv') {
      if (!filteredTableData || filteredTableData.length === 0) {
        alert('No data to export');
        return;
      }
      
      const csv = [
        Object.keys(filteredTableData[0]).join(','),
        ...filteredTableData.map(row => Object.values(row).join(','))
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeReport}_report.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
    console.log(`Exporting ${activeReport} report as ${format}`);
  };

  const refreshData = () => {
    // Reset dates to trigger useEffect
    setCustomStartDate(null);
    setCustomEndDate(null);
    setTimeRange('30days');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed':
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

  // Loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading reports</h3>
          <p className="mt-1 text-gray-600">{error}</p>
          <button
            onClick={refreshData}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Check if report data is available
  if (!reportData[activeReport]) {
    return <div className="text-red-500 text-center p-6">Invalid report type selected</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.2s ease-out;
          }
        `}
      </style>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reports Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Analyze your business performance</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={refreshData}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-all duration-200 font-medium shadow-sm"
              aria-label="Refresh report data"
            >
              <FiRefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <div className="relative">
              <button 
                onClick={toggleExportMenu}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all duration-200 font-medium shadow-sm"
                aria-label="Export report"
              >
                <FiDownload size={16} />
                <span>Export</span>
              </button>
              {showExportMenu && (
                <div className="absolute z-10 right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 animate-fade-in">
                  <div className="py-1">
                    {exportFormats.map((format) => (
                      <button
                        key={format.value}
                        onClick={() => handleExport(format.value)}
                        className={`w-full flex items-center justify-between px-4 py-2 text-sm ${
                          selectedExport === format.value 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        aria-label={`Export as ${format.label}`}
                      >
                        {format.label}
                        {selectedExport === format.value && (
                          <FiCheckCircle className="text-blue-500" size={14} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {reportTypes.map((report) => (
              <button
                key={report.value}
                onClick={() => setActiveReport(report.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm whitespace-nowrap ${
                  activeReport === report.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                aria-label={`Select ${report.label} report`}
                role="tab"
                aria-selected={activeReport === report.value}
              >
                <span className="text-gray-500">{report.icon}</span>
                {report.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-2 rounded-lg border transition-all duration-200 font-medium text-sm ${
                  timeRange === range.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-inner'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                aria-label={`Select ${range.label} time range`}
              >
                {range.label}
              </button>
            ))}
            {timeRange === 'custom' && (
              <div className="flex gap-2">
                <DatePicker
                  selected={customStartDate}
                  onChange={(date) => setCustomStartDate(date)}
                  placeholderText="Start Date"
                  className="px-3 py-2 rounded-lg border"
                  aria-label="Select custom start date"
                />
                <DatePicker
                  selected={customEndDate}
                  onChange={(date) => setCustomEndDate(date)}
                  placeholderText="End Date"
                  className="px-3 py-2 rounded-lg border"
                  aria-label="Select custom end date"
                />
              </div>
            )}
          </div>
        </div>

        {/* Report Title */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">{reportData[activeReport].title}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <FiCalendar size={14} />
            <span>
              {timeRange === '7days' && 'Last 7 days'}
              {timeRange === '30days' && 'Last 30 days'}
              {timeRange === '90days' && 'Last 90 days'}
              {timeRange === '12months' && 'Last 12 months'}
              {timeRange === 'custom' && 'Custom date range'}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {reportData[activeReport].stats.map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                {stat.icon && (
                  <div className="p-2 rounded-lg bg-gray-50">
                    {stat.icon}
                  </div>
                )}
              </div>
              <div className={`flex items-center gap-1 mt-3 text-sm ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? (
                  <FiTrendingUp size={16} />
                ) : (
                  <FiTrendingDown size={16} />
                )}
                <span>{stat.change}</span>
                <span className="text-gray-400 text-xs ml-1">vs previous period</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {reportData[activeReport].charts.map((chart, index) => (
            <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900">{chart.title}</h3>
                <button className="text-gray-400 hover:text-gray-600" aria-label={`Print ${chart.title}`}>
                  <FiPrinter size={16} />
                </button>
              </div>
              <div className="relative" style={{ height: '300px' }}>
                {chart.component}
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Data Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">Detailed Data</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Full Report
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeReport === 'financial' ? 'Client' : activeReport === 'projects' ? 'Project' : 'Item'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeReport === 'financial' ? 'Amount' : activeReport === 'projects' ? 'Progress' : 'Value'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTableData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {activeReport === 'financial' ? item.client : 
                         activeReport === 'projects' ? item.project : 
                         item.item}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activeReport === 'financial' ? item.amount : 
                       activeReport === 'projects' ? item.progress : 
                       item.value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Reports Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Other Reports You Might Need</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <FiUsers size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Team Performance</h4>
                  <p className="text-sm text-gray-500">Track individual contributions</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <FiCheckCircle size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Task Completion</h4>
                  <p className="text-sm text-gray-500">Analyze task workflows</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <FiAlertCircle size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Bottlenecks</h4>
                  <p className="text-sm text-gray-500">Identify workflow issues</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;