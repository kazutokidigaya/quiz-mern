import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await API.post("/login", formData);
      const { token, user } = res.data;

      login(token);
      toast.success(`Welcome back, ${user.name}`);
      setFormData({ email: "", password: "" });
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error.response?.data);
      toast.error(error.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg txt-sm rounded-lg p-8 w-full max-w-md m-8 hover:shadow-xl  transition duration-300">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Log In
        </h1>
        <div className="relative mb-4">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 pl-10"
          />
          <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
        </div>
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 pl-10"
          />
          <FaLock className="absolute left-3 top-3 text-gray-400" />
          <div
            className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-blue-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </div>
        </div>
        <div className="flex flex-col my-8 justify-center items-center w-[100%]">
          <button
            onClick={handleLogin}
            className="bg-blue-500  flex gap-2 items-center shadow-lg text-gray-100 py-2 px-6 rounded-xl text-base font-semibold hover:bg-blue-600 hover:shadow-none transition"
          >
            Log In
          </button>
        </div>
        <div className="text-center ">
          <Link
            to="/signup"
            className="text-blue-400 hover:text-blue-600 hover:font-semibold text-sm"
          >
            Don’t have an account? Sign Up
          </Link>
        </div>
        <hr className="my-6" />
        <div className="flex flex-col gap-4 justify-center items-center">
          <p className="text-gray-500  text-sm">Or login using Google Auth</p>

          <button
            onClick={() => {
              window.location.href = "http://localhost:5000/api/auth/google";
            }}
            className="flex w-full items-center justify-center gap-4"
          >
            <img
              src="https://res.cloudinary.com/dqela8lj8/image/upload/v1732783718/db9aiwhjxeitnkzjsyza.png"
              alt="Google.webp"
              className="w-8 h-8"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
