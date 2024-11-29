import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { login, userDetails } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("userId");

    if (userId) {
      // Fetch the token using the user ID
      axios
        .get(
          `https://quiz-mern-rs1j.onrender.com/api/auth/fetch-token/${userId}`
        )
        .then((res) => {
          const token = res.data.token;

          if (token) {
            // Use context to log in and store the token
            login(token);

            // Redirect to dashboard
            navigate("/dashboard", { replace: true });
          } else {
            console.log("No token found. Redirecting to login...");
            navigate("/login", { replace: true });
          }
        })
        .catch((error) => {
          console.error("Error fetching token:", error);
          navigate("/login", { replace: true });
        });
    } else {
      console.log("No user ID found. Redirecting to login...");
      navigate("/login", { replace: true });
    }
  }, [login, navigate]);

  return <h1>Authenticating with Google...</h1>;
};

export default GoogleCallback;
