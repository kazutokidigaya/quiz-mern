import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
  const [userDetails, setUserDetails] = useState(null);

  const login = (token) => {
    localStorage.setItem("authToken", token); // Save token in localStorage
    setAuthToken(token); // Update state
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setAuthToken(null);
  };

  const fetchUserDetails = async () => {
    if (authToken) {
      try {
        const res = await API.get("/user-details", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUserDetails(res.data);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        logout();
      }
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [authToken]);

  return (
    <AuthContext.Provider
      value={{
        authToken,
        login,
        logout,
        userDetails,
        fetchUserDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
