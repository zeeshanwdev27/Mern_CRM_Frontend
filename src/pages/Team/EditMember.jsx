import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiMail, FiPhone, FiClock, FiSave, FiArrowLeft } from 'react-icons/fi';

const EditMember = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        status: 'Active',
        joinDate: ''
    });

useEffect(() => {
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            // Fetch all necessary data in parallel
            const [userResponse, rolesResponse, deptsResponse] = await Promise.all([
                axios.get(`http://localhost:3000/api/users/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get('http://localhost:3000/api/roles', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get('http://localhost:3000/api/departments', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            // Access the nested data arrays/objects
            setRoles(rolesResponse.data.data);
            setDepartments(deptsResponse.data.data);
            
            // Get the user data from the nested data property
            const userData = userResponse.data.data;
            setMember(userData);
            setFormData({
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                role: userData.role?.name || '',
                department: userData.department?.name || '',
                status: userData.status || 'Active',
                joinDate: userData.joinDate ? new Date(userData.joinDate).toISOString().split('T')[0] : ''
            });
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const dataToSend = {
                ...formData,
                joinDate: formData.joinDate ? new Date(formData.joinDate).toISOString() : null
            };
            
            await axios.put(`http://localhost:3000/api/users/${id}`, dataToSend, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            navigate('/team/all-members');
        } catch (err) {
            console.error('Error updating member:', err);
            setError(err.response?.data?.error || err.message || 'Failed to update member');
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-red-500 p-4 border border-red-100 bg-red-50 rounded-lg">
                    Error: {error}
                </div>
                <button 
                    onClick={() => navigate('/team/all-members')}
                    className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                    <FiArrowLeft /> Back to Team Members
                </button>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-gray-500 p-4">Member not found</div>
                <button 
                    onClick={() => navigate('/team/all-members')}
                    className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                    <FiArrowLeft /> Back to Team Members
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Edit Member</h2>
                <button 
                    onClick={() => navigate('/team/all-members')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                    <FiArrowLeft /> Back to Team
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                {error && (
                    <div className="text-red-500 p-3 border border-red-100 bg-red-50 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiUser className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiMail className="text-gray-400" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiPhone className="text-gray-400" />
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Select a role</option>
                            {roles.map(role => (
                                <option key={role._id} value={role.name}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Select a department</option>
                            {departments.map(dept => (
                                <option key={dept._id} value={dept.name}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="On Leave">On Leave</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiClock className="text-gray-400" />
                            </div>
                            <input
                                type="date"
                                name="joinDate"
                                value={formData.joinDate}
                                onChange={handleChange}
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/team/all-members')}
                        className="mr-4 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <FiSave size={18} />
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditMember;