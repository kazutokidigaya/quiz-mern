import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const LogoutButton = () => {
  const { logout, authToken } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (authToken) {
        // Send the logout request with the proper Authorization header format
        await axios.get("http://localhost:5000/api/auth/logout", {
          headers: { Authorization: `Bearer ${authToken}` }, // Add "Bearer" prefix
        });
      }

      // Clear the token and redirect the user
      logout();
      toast.success("Logged out successfully.");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);

      // Handle specific error cases
      if (error.response && error.response.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error("Failed to log out.");
      }

      // Clear the token even if logout fails (optional)
      logout();
      navigate("/login");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
