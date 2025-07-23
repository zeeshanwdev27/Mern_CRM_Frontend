import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleOnSubmit = async (e) => {
  e.preventDefault();

  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/api/signin`,
      formData,
      { timeout: 10000 }
    );

    try {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (storageError) {
      console.error("Storage error:", storageError);
      toast.error("Could not save session data");
      return;
    }

    setFormData({
      email: "",
      password: "",
    });

    toast.success("Successfully logged in", { autoClose: 1500 });

    // Redirect based on user role
    setTimeout(() => {
      const userRole = data.user.role?.name;
      switch(userRole) {
        case 'Sales':
          navigate('/clients');
          break;
        case 'Project Manager':
          navigate('/projects');
          break;
        case 'Administrator':
        case 'Manager':
          navigate('/dashboard');
          break;
        default:
          navigate('/dashboard'); 
      }
    }, 1600);

  } catch (error) {
    const errorMessage = 
      error.response?.data?.message ||
      error.message ||
      "Login failed. Please try again later.";
    
    console.error("Login error:", error);
    toast.error(errorMessage);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Sign In
        </h2>

        <form onSubmit={handleOnSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              name="email"
              onChange={handleOnChange}
              value={formData.email}
              className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              name="password"
              onChange={handleOnChange}
              value={formData.password}
              className="w-full px-4 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            Sign In
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          Forgot your password?{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Reset it
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
