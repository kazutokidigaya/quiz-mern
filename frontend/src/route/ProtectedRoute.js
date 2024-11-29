import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

const ProtectedRoute = ({ children }) => {
  const { authToken } = useAuth();
  // console.log("ProtectedRoute - authToken:", authToken); // Debug

  if (authToken === undefined) {
    return (
      <div>
        <Loading />
      </div>
    ); // Prevent premature redirection
  }

  if (!authToken) {
    console.log("No token found. Redirecting to login...");
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
