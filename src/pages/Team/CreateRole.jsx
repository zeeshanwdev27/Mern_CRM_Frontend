import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiPlus,
  FiX,
  FiChevronDown,
  FiCheck,
  FiSave,
  FiArrowLeft
} from 'react-icons/fi';

const CreateRole = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    permissions: []
  });

  // Available permissions
  const allPermissions = [
    'create', 'read', 'update', 'delete',
    'manage_users', 'manage_roles', 'manage_departments',
    'approve_content', 'view_reports', 'export_data', 'Assign Projects'
  ];

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/departments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setDepartments(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionToggle = (permission) => {
    setFormData(prev => {
      if (prev.permissions.includes(permission)) {
        return {
          ...prev,
          permissions: prev.permissions.filter(p => p !== permission)
        };
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, permission]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/roles', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(formData)
      
      setSuccess(true);
      setTimeout(() => navigate('/team/roles'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
        <div>
          <button
            onClick={() => navigate('/team/roles')}
            className="cursor-pointer flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4 transition-colors duration-200"
          >
            <FiArrowLeft size={18} />
            <span>Back to Roles</span>
          </button>
          <h2 className="text-3xl font-bold text-gray-900">Create New Role</h2>
          <p className="text-gray-500 mt-2">Define a new role and assign permissions</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50/90 text-emerald-800 rounded-xl flex items-center gap-3 border border-emerald-200 backdrop-blur-sm">
          <FiCheck size={20} className="text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-medium">Role created successfully! Redirecting...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          <p className="font-medium">Error: {error}</p>
          <button 
            onClick={() => setError(null)} 
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Role Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Role Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter role name (e.g., 'Content Moderator')"
              className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 h-12 px-4"
            />
            <p className="text-xs text-gray-500">
              You can enter any role name you need
            </p>
          </div>

          {/* Department */}
          <div className="space-y-2">
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 h-12 px-4"
            >
              <option value="">No department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={500}
            value={formData.description}
            onChange={handleInputChange}
            className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 px-4 py-3"
            placeholder="Brief description of this role's purpose"
          />
          <p className="text-xs text-gray-500 text-right">
            {formData.description.length}/500 characters
          </p>
        </div>

        {/* Permissions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Permissions</h3>
            <div className="text-sm text-gray-500">
              {formData.permissions.length} selected
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {allPermissions.map((permission) => (
              <div 
                key={permission} 
                onClick={() => handlePermissionToggle(permission)}
                className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                  formData.permissions.includes(permission)
                    ? 'border-indigo-200 bg-indigo-50/50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex-shrink-0 h-5 w-5 rounded-md border flex items-center justify-center transition-all duration-200 ${
                    formData.permissions.includes(permission)
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'bg-white border-gray-300'
                  }`}>
                    {formData.permissions.includes(permission) && (
                      <FiCheck className="h-3.5 w-3.5 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {permission.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/team/roles')}
            className="px-5 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.name}
            className={`px-5 py-3 rounded-xl transition-all duration-200 shadow-sm flex items-center gap-2 ${
              isSubmitting || !formData.name
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <FiSave size={18} />
                Create Role
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRole;