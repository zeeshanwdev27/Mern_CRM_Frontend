import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiCheckCircle,
  FiChevronDown,
  FiXCircle,
  FiShield,
  FiCode,
  FiLayers,
  FiUsers,
} from "react-icons/fi";
import { Menu } from "@headlessui/react";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const rolesPerPage = 5;

  // Fetch roles from backend
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("token");

        const [userResponse, rolesResponse] = await Promise.all([
          axios.get(`http://localhost:3000/api/users/allusers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3000/api/roles", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Create a map to count users per role
        const roleUserCount = {};
        userResponse.data.data.forEach((user) => {
          const roleId = user.role?._id;
          if (roleId) {
            roleUserCount[roleId] = (roleUserCount[roleId] || 0) + 1;
          }
        });

        // Transform data to match frontend expectations
        const transformedRoles = rolesResponse.data.data.map((role) => ({
          id: role._id,
          name: role.name,
          description: role.description,
          memberCount: roleUserCount[role._id] || 0,
          department: role.department?.name || "Unassigned",
          permissions: role.permissions,
          createdAt: role.createdAt,
          isSystemRole: role.isDefault,
        }));

        setRoles(transformedRoles);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // Get unique departments for filter
  const departments = ["All", ...new Set(roles.map((role) => role.department))];

  // Filter roles based on search and department
  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      departmentFilter === "All" || role.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  // Sort roles by name A-Z
  const sortedRoles = [...filteredRoles].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Pagination logic
  const indexOfLastRole = currentPage * rolesPerPage;
  const indexOfFirstRole = indexOfLastRole - rolesPerPage;
  const currentRoles = sortedRoles.slice(indexOfFirstRole, indexOfLastRole);
  const totalPages = Math.ceil(filteredRoles.length / rolesPerPage);

  // Role icon mapping
  const getRoleIcon = (roleName) => {
    switch (roleName) {
      case "Administrator":
        return <FiShield className="text-purple-600" />;
      case "Project Manager":
        return <FiUsers className="text-blue-600" />;
      case "Developer":
      case "QA Engineer":
        return <FiCode className="text-green-600" />;
      case "Designer":
        return <FiLayers className="text-orange-600" />;
      case "Marketing":
      case "Sales":
        return <FiUsers className="text-red-600" />;
      default:
        return <FiUsers className="text-gray-600" />;
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDeleteClick = (role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedRole.isSystemRole) {
      setSuccessMessage("System roles cannot be deleted");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setShowDeleteModal(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/roles/${selectedRole.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRoles(roles.filter((role) => role.id !== selectedRole.id));
      setShowDeleteModal(false);
      setSuccessMessage(`Role "${selectedRole.name}" deleted successfully`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
          <p className="font-medium">Error loading roles: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Roles Management</h2>
          <p className="text-gray-500 mt-2">
            Manage team roles and permissions
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/team/departments/add"
            className="flex items-center gap-2 px-5 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <FiPlus size={18} />
            <span>Add Department</span>
          </Link>
          <Link
            to="/team/roles/add"
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <FiPlus size={18} />
            <span>Add New Role</span>
          </Link>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-emerald-50/90 text-emerald-800 rounded-xl flex items-center gap-3 border border-emerald-200 backdrop-blur-sm">
          <FiCheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search roles by name or description..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-11 pr-4 h-12 block w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
          />
        </div>

        <Menu as="div" className="relative w-full md:w-48">
          {({ open }) => (
            <>
              <Menu.Button className="cursor-pointer flex justify-between items-center pl-4 pr-3 h-12 w-full rounded-xl border border-gray-200 bg-white shadow-sm hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 text-left">
                <span className="truncate">{departmentFilter}</span>
                <FiChevronDown
                  className={`ml-2 h-5 w-5 text-gray-400 transition-transform duration-200 ${
                    open ? "transform rotate-180 text-indigo-500" : ""
                  }`}
                />
              </Menu.Button>

              <Menu.Items className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-xl py-1 ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-auto">
                {departments.map((dept) => (
                  <Menu.Item key={dept}>
                    {({ active }) => (
                      <button
                        onClick={() => setDepartmentFilter(dept)}
                        className={`${
                          active
                            ? "bg-indigo-50 text-indigo-800"
                            : "text-gray-700"
                        } cursor-pointer flex items-center px-4 py-2.5 text-sm w-full text-left transition-colors duration-150 ${
                          departmentFilter === dept
                            ? "font-medium bg-indigo-100/50"
                            : ""
                        }`}
                      >
                        {dept}
                        {departmentFilter === dept && (
                          <FiCheckCircle className="ml-auto h-4 w-4 text-indigo-600" />
                        )}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </>
          )}
        </Menu>
      </div>

      {/* Roles Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                scope="col"
                className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
              >
                Department
              </th>
              <th
                scope="col"
                className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
              >
                Created
              </th>
              <th
                scope="col"
                className="px-8 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRoles.length > 0 ? (
              currentRoles.map((role) => (
                <tr
                  key={role.id}
                  className="hover:bg-gray-50/50 transition-all duration-150"
                >
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 p-2 rounded-lg bg-gray-100">
                        {getRoleIcon(role.name)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          {role.name}
                          {role.isSystemRole && (
                            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                              System
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {role.memberCount}{" "}
                          {role.memberCount === 1 ? "member" : "members"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-gray-600 max-w-md">
                      {role.description}
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      {role.department}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(role.createdAt)}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      {role.isSystemRole ? (
                        <span
                          className="text-gray-400 cursor-not-allowed transition-all duration-200 p-2 rounded-lg flex items-center justify-center"
                          title="System roles cannot be edited"
                        >
                          <FiEdit2 size={18} />
                        </span>
                      ) : (
                        <Link
                          to={`/team/roles/edit/${role.id}`}
                          className="text-indigo-600 hover:text-indigo-900 transition-all duration-200 p-2 rounded-lg hover:bg-indigo-50 flex items-center justify-center"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </Link>
                      )}
                      <button
                        onClick={() => handleDeleteClick(role)}
                        disabled={role.isSystemRole}
                        className={`transition-all duration-200 p-2 rounded-lg flex items-center justify-center ${
                          role.isSystemRole
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-rose-600 hover:text-rose-900 hover:bg-rose-50 cursor-pointer"
                        }`}
                        title={
                          role.isSystemRole
                            ? "System roles cannot be deleted"
                            : "Delete"
                        }
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-8 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FiSearch size={24} className="text-gray-400" />
                    <p className="text-lg">
                      No roles found matching your criteria
                    </p>
                    {(searchTerm || departmentFilter !== "All") && (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setDepartmentFilter("All");
                        }}
                        className="text-indigo-600 hover:text-indigo-800 mt-2 text-sm font-medium"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredRoles.length > rolesPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{indexOfFirstRole + 1}</span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(indexOfLastRole, filteredRoles.length)}
            </span>{" "}
            of <span className="font-medium">{filteredRoles.length}</span> roles
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="cursor-pointer p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              aria-label="Previous page"
            >
              <FiChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`cursor-pointer w-11 h-11 rounded-xl border transition-all duration-200 shadow-sm ${
                    currentPage === number
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  aria-label={`Page ${number}`}
                >
                  {number}
                </button>
              )
            )}
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="cursor-pointer p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              aria-label="Next page"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full animate-scale-in">
            <div className="flex items-start gap-4 mb-5">
              <div className="p-3 rounded-full bg-rose-100 mt-0.5">
                <FiXCircle size={24} className="text-rose-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Delete Role</h3>
                <p className="text-gray-600 mt-2">
                  Are you sure you want to delete the role "{selectedRole?.name}
                  "? This action cannot be undone.
                </p>
                {selectedRole?.memberCount > 0 && (
                  <div className="mt-3 p-3 bg-amber-50 text-amber-800 rounded-lg text-sm">
                    This role is assigned to {selectedRole.memberCount} members.
                    Deleting it will unassign these members.
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all duration-200 shadow-sm"
              >
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
