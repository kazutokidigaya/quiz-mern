import { Navigate, Route, Routes } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import GoogleCallback from "./components/Google/GoogleCallback";
import ProtectedRoute from "./route/ProtectedRoute";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UpdateProfile from "./components/UpdateProfile";
import CreateQuiz from "./components/Quiz/CreateQuiz";
import AttemptQuiz from "./components/Quiz/AttemptQuiz";
import Leaderboard from "./components/Quiz/Leaderboard";
import QuizHistory from "./components/Quiz/QuizHistory";
import UpdateQuiz from "./components/Quiz/UpdateQuiz";
import ResultComponent from "./components/Quiz/ResultComponent";
import AttemptDetail from "./components/Quiz/AttemptDetail";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div className="flex flex-col bg-gray-100 min-h-screen text-sm flex-1 overflow-scroll p-2 lg:p-5 bg-gradient-to-bl from-white to-indigo-600">
      <ToastContainer autoClose={5000} />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/update-profile" element={<UpdateProfile />} />
          <Route path="/google/callback" element={<GoogleCallback />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-quiz"
            element={
              <ProtectedRoute>
                <CreateQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:quizId/attempt"
            element={
              <ProtectedRoute>
                <AttemptQuiz />
              </ProtectedRoute>
            }
          />

          <Route path="/quiz/:quizId/leaderboard" element={<Leaderboard />} />

          <Route
            path="/quiz/history"
            element={
              <ProtectedRoute>
                <QuizHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/quiz/attempt/:id"
            element={
              <ProtectedRoute>
                <AttemptDetail />
              </ProtectedRoute>
            }
          />

          <Route path="/quiz/update/:id" element={<UpdateQuiz />} />
          <Route path="/quiz/result" element={<ResultComponent />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};
export default App;
