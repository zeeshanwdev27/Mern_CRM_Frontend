import React, { useState, useMemo } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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

const Reports = () => {
  // State for filters
  const [timeRange, setTimeRange] = useState('30days');
  const [activeReport, setActiveReport] = useState('overview');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedExport, setSelectedExport] = useState('pdf');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);

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
    { value: 'team', label: 'Team', icon: <FiUsers /> }
  ];

  // Export format options
  const exportFormats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'csv', label: 'CSV' },
    { value: 'excel', label: 'Excel' },
    { value: 'image', label: 'Image' }
  ];

  // Dummy data generators
  const generateRevenueData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      labels: months.slice(0, new Date().getMonth() + 1),
      datasets: [{
        label: 'Revenue',
        data: months.slice(0, new Date().getMonth() + 1).map(() => Math.floor(Math.random() * 10000) + 5000),
        backgroundColor: colorPalette.primary,
        borderColor: colorPalette.primaryBorder,
        borderWidth: 1
      }]
    };
  };

  const generateClientRevenueData = () => {
    const clients = ['Acme Corp', 'Beta LLC', 'Gamma Inc', 'Delta Co', 'Epsilon Ltd'];
    return {
      labels: clients,
      datasets: [{
        data: clients.map(() => Math.floor(Math.random() * 15000) + 5000),
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
    };
  };

  const generateProjectStatusData = () => {
    return {
      labels: ['Completed', 'In Progress', 'Not Started', 'On Hold'],
      datasets: [{
        data: [12, 8, 5, 2],
        backgroundColor: [
          colorPalette.secondary,
          colorPalette.primary,
          colorPalette.neutral,
          colorPalette.warning
        ],
        borderColor: [
          colorPalette.secondaryBorder,
          colorPalette.primaryBorder,
          colorPalette.neutralBorder,
          colorPalette.warningBorder
        ],
        borderWidth: 1
      }]
    };
  };

  const generateTaskCompletionData = () => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    return {
      labels: weeks,
      datasets: [
        {
          label: 'Completed',
          data: [15, 22, 18, 27],
          borderColor: colorPalette.secondaryBorder,
          backgroundColor: colorPalette.secondary.replace('0.6', '0.1'),
          tension: 0.3,
          fill: true
        },
        {
          label: 'Overdue',
          data: [5, 3, 7, 2],
          borderColor: colorPalette.dangerBorder,
          backgroundColor: colorPalette.danger.replace('0.6', '0.1'),
          tension: 0.3,
          fill: true
        }
      ]
    };
  };

  // Memoized chart data
  const revenueData = useMemo(() => generateRevenueData(), [timeRange]);
  const clientRevenueData = useMemo(() => generateClientRevenueData(), [timeRange]);
  const projectStatusData = useMemo(() => generateProjectStatusData(), [timeRange]);
  const taskCompletionData = useMemo(() => generateTaskCompletionData(), [timeRange]);

  // Report data configuration
  const reportData = {
    overview: {
      title: "Business Overview",
      stats: [
        { title: "Total Revenue", value: "$24,580.00", change: "+12.5%", trend: "up", icon: <FiDollarSign className="text-blue-500" /> },
        { title: "Active Projects", value: "18", change: "+2", trend: "up", icon: <FiUsers className="text-emerald-500" /> },
        { title: "Overdue Tasks", value: "7", change: "-3", trend: "down", icon: <FiClock className="text-amber-500" /> },
        { title: "Invoice Paid", value: "82%", change: "+5%", trend: "up", icon: <FiCheckCircle className="text-green-500" /> }
      ],
      charts: [
        { 
          type: "bar", 
          title: "Revenue by Month", 
          component: <Bar 
            data={revenueData} 
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
            data={taskCompletionData} 
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
                  beginAtZero: true
                }
              }
            }} 
          /> 
        }
      ]
    },
    financial: {
      title: "Financial Reports",
      stats: [
        { title: "Total Income", value: "$24,580.00", change: "+12.5%", trend: "up", icon: <FiDollarSign className="text-green-500" /> },
        { title: "Total Expenses", value: "$8,245.00", change: "+3.2%", trend: "up", icon: <FiDollarSign className="text-red-500" /> },
        { title: "Net Profit", value: "$16,335.00", change: "+18.7%", trend: "up", icon: <FiTrendingUp className="text-emerald-500" /> },
        { title: "Outstanding Invoices", value: "$3,450.00", change: "-$1,200", trend: "down", icon: <FiAlertCircle className="text-amber-500" /> }
      ],
      charts: [
        { 
          type: "pie", 
          title: "Revenue by Client", 
          component: <Pie 
            data={clientRevenueData} 
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
      ]
    },
    projects: {
      title: "Project Reports",
      stats: [
        { title: "Active Projects", value: "18", change: "+2", trend: "up", icon: <FiUsers className="text-blue-500" /> },
        { title: "Completed This Month", value: "5", change: "+1", trend: "up", icon: <FiCheckCircle className="text-emerald-500" /> },
        { title: "Behind Schedule", value: "3", change: "-2", trend: "down", icon: <FiClock className="text-amber-500" /> },
        { title: "Avg. Completion Time", value: "12.5 days", change: "-1.2", trend: "down", icon: <FiTrendingDown className="text-red-500" /> }
      ],
      charts: [
        { 
          type: "pie", 
          title: "Projects by Status", 
          component: <Pie 
            data={projectStatusData} 
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
              labels: ['Website Redesign', 'Mobile App', 'Marketing', 'HR System', 'Data Migration'],
              datasets: [
                {
                  label: 'Budget',
                  data: [15000, 20000, 8000, 12000, 9500],
                  backgroundColor: colorPalette.neutral,
                  borderColor: colorPalette.neutralBorder,
                  borderWidth: 1
                },
                {
                  label: 'Actual',
                  data: [13500, 18500, 9200, 10500, 11000],
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
      ]
    }
  };

  // Dummy table data
  const tableData = {
    overview: [
      { id: 1, item: 'Website Redesign', status: 'Completed', value: '$12,500', date: '2025-05-15' },
      { id: 2, item: 'Mobile App Development', status: 'In Progress', value: '$18,000', date: '2025-05-20' },
      { id: 3, item: 'Marketing Campaign', status: 'Completed', value: '$8,500', date: '2025-04-30' },
      { id: 4, item: 'HR System Update', status: 'On Hold', value: '$10,500', date: '2025-05-01' },
      { id: 5, item: 'Data Migration', status: 'In Progress', value: '$9,500', date: '2025-05-25' }
    ],
    financial: [
      { id: 1, client: 'Acme Corp', status: 'Paid', amount: '$12,500', date: '2025-05-15' },
      { id: 2, client: 'Beta LLC', status: 'Pending', amount: '$8,750', date: '2025-05-20' },
      { id: 3, client: 'Gamma Inc', status: 'Paid', amount: '$15,200', date: '2025-04-30' },
      { id: 4, client: 'Delta Co', status: 'Overdue', amount: '$6,300', date: '2025-05-01' },
      { id: 5, client: 'Epsilon Ltd', status: 'Paid', amount: '$9,800', date: '2025-05-25' }
    ],
    projects: [
      { id: 1, project: 'Website Redesign', status: 'Completed', progress: '100%', date: '2025-05-15' },
      { id: 2, project: 'Mobile App', status: 'In Progress', progress: '75%', date: '2025-05-20' },
      { id: 3, project: 'Marketing Campaign', status: 'Completed', progress: '100%', date: '2025-04-30' },
      { id: 4, project: 'HR System', status: 'On Hold', progress: '30%', date: '2025-05-01' },
      { id: 5, project: 'Data Migration', status: 'In Progress', progress: '60%', date: '2025-05-25' }
    ]
  };

  // Filter table data by time range
  const filterTableDataByTimeRange = (data, timeRange, startDate, endDate) => {
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

  const filteredTableData = filterTableDataByTimeRange(tableData[activeReport], timeRange, customStartDate, customEndDate);

  // Helper functions
  const toggleExportMenu = () => {
    setShowExportMenu(!showExportMenu);
  };

  const handleExport = (format) => {
    setSelectedExport(format);
    setShowExportMenu(false);
    if (format === 'csv') {
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
    console.log('Refreshing report data');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed':
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-amber-100 text-amber-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'On Hold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Error handling for invalid report type
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
                      <div className="font-medium text-gray-900">{item[activeReport === 'financial' ? 'client' : activeReport === 'projects' ? 'project' : 'item']}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item[activeReport === 'financial' ? 'amount' : activeReport === 'projects' ? 'progress' : 'value']}
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