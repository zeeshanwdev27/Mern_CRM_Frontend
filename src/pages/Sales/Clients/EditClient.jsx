import React, { useEffect, useState, useCallback } from 'react';
import { 
  FiUser, 
  FiMail, 
  FiBriefcase, 
  FiDollarSign, 
  FiCalendar,
  FiX,
  FiCheck,
  FiArrowLeft
} from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const EditClient = () => {
  // Router hooks
  const { state } = useLocation();
  const clientId = state?.id;
  const navigate = useNavigate();

  // State management
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    projects: [],
    status: 'active',
    lastContact: new Date().toISOString().split('T')[0]
  });
  const [newProject, setNewProject] = useState({ name: '', value: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized fetch function
  const fetchClient = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      const response = await axios.get(`http://localhost:3000/api/clients/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { client } = response.data.data;

      setFormData({
        name: client.name || '',
        email: client.email || '',
        company: client.company || '',
        projects: client.projects || [],
        status: client.status || 'active',
        lastContact: client.lastContact 
          ? new Date(client.lastContact).toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to load client data');
    }
  }, [clientId]);

  // Initial data fetch
  useEffect(() => {
    if (clientId) fetchClient();
  }, [clientId, fetchClient]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: name === 'value' ? value.replace(/[^0-9.]/g, '') : value
    }));
  };

  const handleProjectAdd = () => {
    if (newProject.name.trim() && newProject.value) {
      setFormData(prev => ({
        ...prev,
        projects: [...prev.projects, { 
          name: newProject.name.trim(), 
          value: parseFloat(newProject.value) || 0 
        }]
      }));
      setNewProject({ name: '', value: '' });
    }
  };

  const handleProjectRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      await axios.put(
        `http://localhost:3000/api/clients/${clientId}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSuccessMessage('Client updated successfully!');
      setTimeout(() => navigate('/clients'), 1500);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
        error.message ||
        'Failed to update client'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value) => {
    const amount = parseFloat(value) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Edit Client</h1>
          <Link 
            to="/clients" 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <FiArrowLeft size={18} />
            <span>Back to Clients</span>
          </Link>
        </div>

        {/* Status Messages */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-md">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Client Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Acme Corporation"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="contact@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Company Field */}
            <div className="space-y-2">
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                Company <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiBriefcase className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="company"
                  name="company"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Company Name"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Status Field */}
            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Last Contact Field */}
            <div className="space-y-2">
              <label htmlFor="lastContact" className="block text-sm font-medium text-gray-700">
                Last Contact Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  id="lastContact"
                  name="lastContact"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.lastContact}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Projects Field */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Projects <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.projects.map((project, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    {project.name} ({formatCurrency(project.value)})
                    <button 
                      type="button"
                      onClick={() => handleProjectRemove(index)}
                      className="ml-1.5 inline-flex text-purple-500 hover:text-purple-700"
                    >
                      <FiX className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="name"
                  className="block cleanslate w-full px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Project name (e.g., Ecommerce Website)"
                  value={newProject.name}
                  onChange={handleProjectChange}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleProjectAdd())}
                />
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDollarSign className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="value"
                    className="block w-32 pl-10 pr-3 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="1000"
                    value={newProject.value}
                    onChange={handleProjectChange}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleProjectAdd())}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleProjectAdd}
                  className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <Link 
              to="/clients" 
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : (
                <>
                  <FiCheck className="mr-2" />
                  Update Client
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClient;