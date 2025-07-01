import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiChevronLeft,
  FiSave,
  FiShield,
  FiUsers,
  FiCode,
  FiLayers,
  FiCheck,
} from "react-icons/fi";
import axios from "axios";

// Permission options that match your backend enum
const permissionOptions = [
  { id: "create", label: "Create", description: "Can create new items" },
  { id: "read", label: "Read", description: "Can view items" },
  { id: "update", label: "Update", description: "Can edit items" },
  { id: "delete", label: "Delete", description: "Can delete items" },
  {
    id: "manage_users",
    label: "Manage Users",
    description: "Can manage users",
  },
  {
    id: "manage_roles",
    label: "Manage Roles",
    description: "Can manage roles",
  },
  {
    id: "manage_departments",
    label: "Manage Departments",
    description: "Can manage departments",
  },
  {
    id: "approve_content",
    label: "Approve Content",
    description: "Can approve content",
  },
  {
    id: "view_reports",
    label: "View Reports",
    description: "Can view reports",
  },
  { id: "export_data", label: "Export Data", description: "Can export data" },
];

const EditRole = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Initialize form state with all permissions set to false
  const initialFormState = {
    name: "",
    description: "",
    department: "",
    isSystemRole: false,
    permissions: permissionOptions.reduce((acc, curr) => {
      acc[curr.id] = false;
      return acc;
    }, {}),
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch role and department data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [departmentResponse, roleResponse] = await Promise.all([
          axios.get(`http://localhost:3000/api/departments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:3000/api/roles/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setDepartments(departmentResponse.data.data);

        const roleData = roleResponse.data.roles;
        const updatedPermissions = { ...initialFormState.permissions };

        // Set permissions to true if they exist in the backend response
        roleData.permissions.forEach((perm) => {
          if (updatedPermissions.hasOwnProperty(perm)) {
            updatedPermissions[perm] = true;
          }
        });

        setFormData({
          name: roleData.name,
          description: roleData.description,
          department: roleData.department?._id || "",
          isSystemRole: roleData.isDefault || false,
          permissions: updatedPermissions,
        });
      } catch (e) {
        console.error("Error Fetching Data", e);
        setError(
          e.response?.data?.message || e.message || "Failed To Fetch Data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Get role icon
  const getRoleIcon = () => {
    switch (formData.name.toLowerCase()) {
      case "administrator":
        return <FiShield className="text-purple-600" />;
      case "project manager":
        return <FiUsers className="text-blue-600" />;
      case "developer":
      case "qa engineer":
        return <FiCode className="text-green-600" />;
      case "designer":
        return <FiLayers className="text-orange-600" />;
      case "marketing":
      case "sales":
        return <FiUsers className="text-red-600" />;
      default:
        return <FiUsers className="text-gray-600" />;
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle permission toggle
  const togglePermission = (permissionId) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionId]: !prev.permissions[permissionId],
      },
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      // Transform permissions back to array format for backend
      const backendPermissions = [];
      Object.entries(formData.permissions).forEach(([perm, hasPerm]) => {
        if (hasPerm) backendPermissions.push(perm);
      });

      const payload = {
        name: formData.name,
        description: formData.description,
        department: formData.department,
        permissions: backendPermissions,
      };

      await axios.put(`http://localhost:3000/api/roles/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error("Error updating role:", e);
      setError(
        e.response?.data?.message || e.message || "Failed to update role"
      );
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

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-7xl mx-auto">
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          <p className="font-medium">Error loading role: {error}</p>
          <Link
            to="/team/roles"
            className="mt-2 inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <FiChevronLeft className="mr-1" /> Back to Roles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-4">
            <Link
              to="/team/roles"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <FiChevronLeft size={20} className="text-gray-600" />
            </Link>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Edit Role</h2>
              <p className="text-gray-500 mt-2">
                Update role details and permissions
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            form="editRoleForm"
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <FiSave size={18} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50/90 text-emerald-800 rounded-xl flex items-center gap-3 border border-emerald-200 backdrop-blur-sm">
          <FiCheck size={20} className="text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-medium">Role updated successfully</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form id="editRoleForm" onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Role Information
              </h3>

              <div className="space-y-5">
                {/* Role Icon Preview */}
                <div className="flex items-center justify-center">
                  <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="p-3 rounded-lg bg-gray-100">
                      {getRoleIcon()}
                    </div>
                  </div>
                </div>

                {/* Role Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Role Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 h-11 px-4"
                    required
                  />
                </div>

                {/* Department */}
                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 h-11 px-4"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 px-4 py-3"
                  />
                </div>

                {/* System Role Indicator */}
                {formData.isSystemRole && (
                  <div className="p-3 bg-purple-50 text-purple-800 rounded-lg text-sm">
                    <p className="font-medium">This is a system role</p>
                    <p className="mt-1">
                      System roles have special permissions and cannot be
                      deleted.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Permissions */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Permissions
              </h3>
              <p className="text-gray-600 mb-6">
                Select the permissions this role should have access to.
              </p>

              <div className="space-y-4">
                {permissionOptions.map((permission) => (
                  <div
                    key={permission.id}
                    onClick={() => togglePermission(permission.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                      formData.permissions[permission.id]
                        ? "border-indigo-300 bg-indigo-50/50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${
                          formData.permissions[permission.id]
                            ? "bg-indigo-600 border-indigo-600"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {formData.permissions[permission.id] && (
                          <FiCheck size={14} className="text-white" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            {permission.label}
                          </h4>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              formData.permissions[permission.id]
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {formData.permissions[permission.id]
                              ? "Enabled"
                              : "Disabled"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditRole;
