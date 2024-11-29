import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllQuizzes, deleteQuiz } from "../api/quiz";
import { FaTrophy, FaPlayCircle, FaEdit, FaTrash } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import { CgProfile, CgLogOut, CgBox } from "react-icons/cg";

import { toast } from "react-toastify";
import Loading from "./Loading";

const Dashboard = () => {
  const { userDetails, authToken, logout } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Fetch quizzes on component mount
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await getAllQuizzes(authToken);
        setQuizzes(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
        setLoading(false);
        toast.error("Failed to load quizzes.");
      }
    };

    fetchQuizzes();
  }, [authToken]);

  const handleDeleteQuiz = async (quizId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this quiz? This action cannot be undone."
      )
    ) {
      try {
        await deleteQuiz(quizId, authToken);
        setQuizzes((prev) => prev.filter((quiz) => quiz._id !== quizId));
        toast.success("Quiz deleted successfully!");
      } catch (error) {
        console.error("Failed to delete quiz:", error);
        toast.error("Failed to delete quiz.");
      }
    }
  };

  const handleMouseEnter = () => setDropdownVisible(true);
  const handleMouseLeave = () => setDropdownVisible(false);

  if (!authToken || !userDetails) {
    return (
      <p>
        <Loading />
      </p>
    );
  }

  return (
    <div className=" min-h-screen rounded-lg flex flex-col items-center bg-white ">
      {/* Navbar */}
      <nav className=" w-[100%] md:w-[80%] rounded-3xl mb-6  py-4 shadow-md  ">
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <div
            className="text-lg font-bold cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="https://res.cloudinary.com/dqela8lj8/image/upload/v1732799761/bouijgx58jejpq5wxi8s.webp"
              className="w-28 h-28 rounded-full hover:border-2 hover:border-gray-100"
              alt="Quiz-ez-logo.webp"
            />
          </div>

          {/* Right-Side Section */}
          <div className="flex items-center space-x-4">
            {/* Create Quiz for Admin */}
            {userDetails.role === "admin" && (
              <button
                onClick={() => navigate("/admin/create-quiz")}
                className="bg-blue-500 shadow-lg text-gray-100 p-2 rounded-full text-base font-semibold hover:bg-blue-600 hover:shadow-none"
              >
                <IoIosAddCircleOutline className="text-2xl" />
              </button>
            )}

            {/* Profile Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-center px-2 space-x-2 cursor-pointer">
                <img
                  src={
                    userDetails.profileImage ||
                    "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png"
                  }
                  alt="Profile"
                  className=" w-12 object-contain rounded-full border-2 border-white shadow-sm"
                />
                <span className=" font-semibold">{userDetails.name}</span>
              </div>

              {/* Dropdown Menu */}
              {dropdownVisible && (
                <div className="absolute right-[-30px] top-[40px] mt-2 bg-white shadow-lg rounded-md py-2 w-32 flex flex-col items-center border border-gray-200">
                  <button
                    onClick={() => navigate("/update-profile")}
                    className="block p-2 w-full hover:bg-gray-200  "
                  >
                    <div className="flex w-full items-center justify-center gap-4 ">
                      <CgProfile className="text-xl" />
                      Profile
                    </div>
                  </button>
                  <hr className="w-full " />
                  <button
                    onClick={() => navigate("/quiz/history")}
                    className="block p-2 w-full hover:bg-gray-200  "
                  >
                    <div className="flex items-center w-full justify-center gap-4">
                      <CgBox className="text-xl" />
                      History
                    </div>
                  </button>
                  <hr className="w-full" />
                  <button
                    onClick={() => {
                      // Clear any auth token logic if needed
                      logout();
                      navigate("/");
                    }}
                    className="block p-2 w-full hover:bg-gray-200  "
                  >
                    <div className="flex items-center w-full justify-center gap-4">
                      <CgLogOut className="text-xl" />
                      Logout
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">
          Welcome, {userDetails.name}!
        </h1>

        {/* Quizzes Section */}
        <div className=" p-2 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p>
              <Loading />
            </p>
          ) : quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white border border-gray-100 shadow rounded-lg md:gap-8 gap-4 p-4 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {quiz.title}
                  </h2>
                  <p className="text-gray-600 p-2">{quiz.description}</p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <button
                    className="bg-blue-500 flex gap-2 items-center shadow-lg text-gray-100 p-2 rounded-xl text-base font-semibold hover:bg-blue-600 hover:shadow-none transition"
                    onClick={() => navigate(`/quiz/${quiz._id}/attempt`)}
                  >
                    <FaPlayCircle className="text-lg" />
                    <span>Start Quiz</span>
                  </button>
                  <button
                    className=" text-gray-600 flex items-center space-x-2 hover:underline"
                    onClick={() => navigate(`/quiz/${quiz._id}/leaderboard`)}
                  >
                    <FaTrophy className="text-lg" />
                    <span>Leaderboard</span>
                  </button>
                </div>
                {userDetails.role === "admin" && (
                  <div className="mt-4 flex justify-between items-center">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-blue-600 transition"
                      onClick={() => navigate(`/quiz/update/${quiz._id}`)}
                    >
                      <FaEdit className="text-lg" />
                      <span>Update</span>
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-red-600 transition"
                      onClick={() => handleDeleteQuiz(quiz._id)}
                    >
                      <FaTrash className="text-lg" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No quizzes available at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
