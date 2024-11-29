import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserQuizAttempts } from "../../api/quiz"; // API for fetching attempts
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { CgChevronLeftO } from "react-icons/cg";
import Loading from "../Loading";

const QuizHistory = () => {
  const { authToken } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const data = await getUserQuizAttempts(authToken);
        setAttempts(data);
      } catch (error) {
        toast.error("Failed to load quiz history.");
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, [authToken]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading />
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate("/dashboard")}
          className=" bg-white text-black shadow-lg py-2 px-4 rounded my-4 hover:text-white hover:bg-black transition duration-300"
        >
          <CgChevronLeftO className="text-2xl " />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow rounded-lg p-6 bg-gray-100 flex flex-col items-center">
        {attempts && attempts.length === 0 ? (
          <p className="text-gray-700 text-lg">No quiz attempts found.</p>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-blue-600 mb-6">
              Your Quiz History
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
              {attempts.map((attempt) => (
                <div
                  key={attempt._id}
                  className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between h-[200px] hover:shadow-2xl transition duration-300"
                >
                  <div>
                    <h2 className="text-lg font-bold text-blue-600">
                      {attempt.quiz.title}
                    </h2>
                    <p className="text-gray-700 mt-2">
                      Score: <span className="font-bold">{attempt.score}</span>
                    </p>
                  </div>
                  <div className="w-full flex items-center justify-center mt-4">
                    <button
                      onClick={() =>
                        navigate(`/quiz/attempt/${attempt._id}`, {
                          state: {
                            quiz: attempt.quiz,
                            score: attempt.score,
                            stats: attempt.stats,
                            answers: attempt.answers,
                          },
                        })
                      }
                      className=" bg-blue-500 shadow-lg text-gray-100 px-4 py-2 rounded-full text-base font-semibold hover:bg-blue-600 hover:shadow-none"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizHistory;
