import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiPlus, FiX, FiCheckCircle, FiTrash2, FiChevronDown, FiArrowLeft } from "react-icons/fi";


const AddDepartment = () => {
  const navigate = useNavigate();

  // Add Department State
  const [addFormData, setAddFormData] = useState({
    name: "",
    description: "",
    manager: "",
    isActive: true,
  });
  
  // Delete Department State
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Shared State
  const [loading, setLoading] = useState({ add: false, delete: false });
  const [error, setError] = useState({ add: null, delete: null });
  const [success, setSuccess] = useState({ add: false, delete: false });

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:3000/api/departments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDepartments(response.data.data);
      } catch (err) {
        setError(prev => ({...prev, delete: err.response?.data?.message || err.message}));
      }
    };
    fetchDepartments();
  }, []);

  // Add Department Handlers
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddFormData({
      ...addFormData,
      [name]: value,
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({...prev, add: true}));
    setError(prev => ({...prev, add: null}));
    setSuccess(prev => ({...prev, add: false}));

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/departments",
        addFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(prev => ({...prev, add: true}));
      setTimeout(() => {
        setAddFormData({
          name: "",
          description: "",
          manager: "",
          isActive: true,
        });
        setSuccess(prev => ({...prev, add: false}));
      }, 1500);
    } catch (err) {
      setError(prev => ({...prev, add: err.response?.data?.message || err.message}));
    } finally {
      setLoading(prev => ({...prev, add: false}));
    }
  };

  // Delete Department Handlers
  const handleDelete = async (e) => {
    e.preventDefault();
    if (!selectedDepartment) {
      setError(prev => ({...prev, delete: "Please select a department"}));
      return;
    }

    setLoading(prev => ({...prev, delete: true}));
    setError(prev => ({...prev, delete: null}));
    setSuccess(prev => ({...prev, delete: false}));

  

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:3000/api/departments/${selectedDepartment}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(prev => ({...prev, delete: true}));
      setTimeout(() => {
        setDepartments(departments.filter(d => d._id !== selectedDepartment));
        setSelectedDepartment("");
        setSuccess(prev => ({...prev, delete: false}));
      }, 1500);
    } catch (err) {
      setError(prev => ({...prev, delete: err.response?.data?.message || err.message}));
    } finally {
      setLoading(prev => ({...prev, delete: false}));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 max-w-6xl mx-auto">
      {/* <div className="flex justify-between items-center mb-8"> */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-4">
        <div>
          {/* <h2 className="text-2xl font-bold text-gray-900">Department Management</h2>
        <button
          onClick={() => navigate("/team/roles")}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
          >
          <FiX size={20} />
          </button> */}
          <button
            onClick={() => navigate('/team/roles')}
            className="cursor-pointer flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4 transition-colors duration-200"
          >
            <FiArrowLeft size={18} />
            <span>Back to Roles</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Department Management</h2>
          </div>
      </div>

      {/* Flex Container for Both Forms */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Add Department Section - Left Side */}
        <div className="flex-1 bg-gray-50 p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Add New Department</h3>

          {success.add && (
            <div className="mb-6 p-4 bg-emerald-50/90 text-emerald-800 rounded-xl flex items-center gap-3 border border-emerald-200">
              <FiCheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Department created successfully!</p>
              </div>
            </div>
          )}

          {error.add && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
              <p className="font-medium">Error: {error.add}</p>
            </div>
          )}

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Name
              </label>
              <input
                type="text"
                name="name"
                value={addFormData.name}
                onChange={handleAddChange}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 h-11"
                placeholder="Enter department name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={addFormData.description}
                onChange={handleAddChange}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5"
                placeholder="Brief description of the department"
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-500">
                {addFormData.description.length}/500 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={addFormData.isActive}
                    onChange={() => setAddFormData({ ...addFormData, isActive: true })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={!addFormData.isActive}
                    onChange={() => setAddFormData({ ...addFormData, isActive: false })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Inactive</span>
                </label>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 shadow-sm flex items-center justify-center gap-2 py-2.5"
                disabled={loading.add || !addFormData.name}
              >
                {loading.add ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiPlus size={16} />
                    Create Department
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Delete Department Section - Right Side */}
        <div className="flex-1 bg-gray-50 p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Delete Department</h3>

          {success.delete && (
            <div className="mb-6 p-4 bg-emerald-50/90 text-emerald-800 rounded-xl flex items-center gap-3 border border-emerald-200">
              <FiCheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Department deleted successfully!</p>
              </div>
            </div>
          )}

          {error.delete && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
              <p className="font-medium">Error: {error.delete}</p>
            </div>
          )}

          <form onSubmit={handleDelete} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Department
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="relative w-full bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2.5 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 h-11 flex items-center justify-between"
                >
                  <span className="block truncate">
                    {selectedDepartment
                      ? departments.find(d => d._id === selectedDepartment)?.name
                      : "Select a department"}
                  </span>
                  <FiChevronDown className="h-5 w-5 text-gray-400" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm max-h-60">
                    {departments.length === 0 ? (
                      <div className="px-3 py-2 text-gray-500 text-sm">No departments available</div>
                    ) : (
                      departments.map((department) => (
                        <div
                          key={department._id}
                          onClick={() => {
                            setSelectedDepartment(department._id);
                            setIsDropdownOpen(false);
                          }}
                          className={`px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm ${
                            selectedDepartment === department._id ? "bg-indigo-100" : ""
                          }`}
                        >
                          {department.name}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedDepartment && (
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 text-sm">Department Details</h4>
                <p className="text-gray-600 text-sm mt-1">
                  {departments.find(d => d._id === selectedDepartment)?.description || "No description"}
                </p>
                <p className="text-xs mt-2">
                  Status:{" "}
                  <span className={`font-medium ${
                    departments.find(d => d._id === selectedDepartment)?.isActive
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                    {departments.find(d => d._id === selectedDepartment)?.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </p>
              </div>
            )}

            <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0 pt-0.5">
                  <svg className="h-4 w-4 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2">
                  <p className="text-xs text-red-700">
                    Warning: This action cannot be undone. All associated data will be deleted.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 shadow-sm flex items-center justify-center gap-2 py-2.5"
                disabled={loading.delete || !selectedDepartment}
              >
                {loading.delete ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 size={16} />
                    Delete Department
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDepartment;



