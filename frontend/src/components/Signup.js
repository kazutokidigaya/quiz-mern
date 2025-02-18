import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
  });
  const [isOTPRequested, setIsOTPRequested] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSendOTP = async () => {
    try {
      setIsOTPRequested(true);
      toast.info("Please wait while we process your request!");
      await API.post("/send-code", { email: formData.email });
      toast.success("OTP sent to your email!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleSignup = async () => {
    try {
      const res = await API.post("/signup", formData);
      const { token } = res?.data;

      if (!token) {
        throw new Error("Token not received from server");
      }

      login(token);

      toast.success("Signup successful!");
      navigate("/dashboard");

      setFormData({
        name: "",
        email: "",
        otp: "",
        password: "",
      });
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);

      toast.error(
        error.response?.data?.message || "Failed to complete signup."
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-8">
      <div className="bg-white shadow-lg text-sm rounded-3xl p-8 w-full max-w-md hover:shadow-xl transition duration-300">
        <ToastContainer />
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Sign Up
        </h1>

        {/* Name Input */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
          />
          <FaUser className="absolute left-3 top-3 text-gray-400" />
        </div>

        {/* Email Input */}
        <div className="relative mb-4">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
          />
          <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
        </div>

        {/* Password Input */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            minLength={6}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
          />
          <FaLock className="absolute left-3 top-3 text-gray-400" />
          <div
            className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-blue-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </div>
        </div>

        {/* OTP Button */}
        <div className="w-full flex items-center justify-center">
          <button
            onClick={handleSendOTP}
            disabled={isOTPRequested || !formData.email}
            className={` mb-4 py-2 px-6 rounded-md text-white ${
              isOTPRequested
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition duration-300`}
          >
            Send OTP
          </button>
        </div>

        {/* OTP Input */}
        {isOTPRequested && (
          <div className="relative mb-4 w-full flex justify-center items-center">
            <input
              type="text"
              placeholder="Enter OTP"
              value={formData.otp}
              onChange={(e) =>
                setFormData({ ...formData, otp: e.target.value })
              }
              className="w-[28%] px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Signup Button */}
        <div className="w-full flex justify-center items-center">
          <button
            disabled={!isOTPRequested || !formData.otp}
            onClick={handleSignup}
            className=" py-2 px-8 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
          >
            Sign Up
          </button>
        </div>

        <div className="text-center mt-4">
          <Link
            to="/login"
            className="text-blue-400 hover:text-blue-600 hover:font-semibold text-sm"
          >
            Already have an account? Log In
          </Link>
        </div>

        <hr className="my-6" />
        <div className="flex flex-col gap-4 justify-center items-center">
          <p className="text-gray-500  text-sm">Or SignUp using Google Auth</p>

          {/* Google Signup */}
          <button
            onClick={() =>
              (window.location.href =
                "https://quiz-mern-dr93.vercel.app/api/auth/google")
            }
            className="flex w-full items-center justify-center gap-4"
          >
            <img
              src="https://res.cloudinary.com/dqela8lj8/image/upload/v1732783718/db9aiwhjxeitnkzjsyza.png"
              alt="Google"
              className="w-6 h-6"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
