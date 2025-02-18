import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getNextQuestion, submitQuiz } from "../../api/quiz";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { CgChevronLeftO, CgTimer } from "react-icons/cg";
import Loading from "../Loading";

const AttemptQuiz = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { authToken } = useAuth();
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [questionsAttempted, setQuestionsAttempted] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false); // Added loading state

  const fetchNextQuestion = async (
    selectedOption = null,
    questionId = null
  ) => {
    setLoading(true); // Start loading
    try {
      const response = await getNextQuestion(
        quizId,
        score,
        authToken,
        usedQuestions,
        selectedOption,
        questionId
      );

      if (response.message === "All questions have been attempted.") {
        setScore(response.score);
        setCurrentQuestion(null);
        setLoading(false); // Stop loading
        return;
      }

      if (response.question) {
        setCurrentQuestion(response.question);
        setScore(response.score);
        setUsedQuestions([...usedQuestions, response.question.questionId]);
        setQuestionsAttempted((prev) => prev + 1);
        setTotalQuestions(response.totalQuestions);
        setTimeLeft(response.question.timeLimit || 30);
        setSelectedOption(null);
      }
    } catch (error) {
      console.error("Failed to fetch next question:", error);
      toast.error("Unable to load the next question. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    fetchNextQuestion();
  };

  const handleAnswer = (optionIndex) => {
    setAnswers((prevAnswers) => [
      ...prevAnswers,
      {
        questionId: currentQuestion.questionId,
        selectedOption: optionIndex,
      },
    ]);
    setSelectedOption(optionIndex);
    fetchNextQuestion(optionIndex, currentQuestion.questionId);
  };

  const handleSkip = () => {
    fetchNextQuestion(null, currentQuestion.questionId);
  };

  const handleSubmitQuiz = async () => {
    setLoading(true); // Start loading for quiz submission
    try {
      const response = await submitQuiz(quizId, answers, authToken);
      toast.success(
        `Quiz submitted successfully! Your score: ${response.score}`
      );
      navigate("/quiz/result", {
        state: {
          score: response.score,
          difficultyStats: response.stats,
          tagPerformance: response.tagPerformance,
          quiz: response.quiz,
        },
      });
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    if (!currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          handleSkip();
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion]);

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-white text-black shadow-lg py-2 px-4 rounded hover:text-white hover:bg-black my-8"
        >
          <CgChevronLeftO className="text-2xl" />
        </button>

        <div className="p-6 flex min-h-screen rounded-lg flex-col items-center justify-center bg-gray-100">
          <h1 className="text-3xl font-bold text-blue-600 mb-6">
            Ready to start the quiz?
          </h1>
          <button
            onClick={handleStartQuiz}
            className="bg-blue-500 flex gap-2 items-center shadow-lg text-gray-100 py-2 px-6 rounded-xl text-base font-semibold hover:bg-blue-600 hover:shadow-none transition"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion && questionsAttempted >= totalQuestions) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          Quiz Completed!
        </h1>
        <p className="text-lg text-gray-700 mb-4">
          Your final score is being calculated. Please wait...
        </p>
        <button
          onClick={handleSubmitQuiz}
          className="bg-green-500 text-white py-3 px-6 rounded-md text-lg hover:bg-green-600 transition duration-300"
        >
          Submit Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-blue-600">
            Quiz Attempt: Question {questionsAttempted} of {totalQuestions}
          </h1>
          <div
            className={`flex items-center gap-2 ${
              timeLeft <= 5 ? "text-red-500" : "text-green-500"
            }`}
          >
            <CgTimer className="text-2xl" />
            <span className="font-semibold text-lg">{timeLeft}s</span>
          </div>
        </div>
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          {currentQuestion.questionText}
        </h2>
        <ul className="space-y-4">
          {currentQuestion.options.map((option, index) => (
            <li
              key={index}
              className={`border py-2 px-4 rounded-md cursor-pointer ${
                selectedOption === index ? "bg-green-200" : "hover:bg-gray-400"
              }`}
              onClick={() => handleAnswer(index)}
            >
              {option}
            </li>
          ))}
        </ul>
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSkip}
            className="bg-black text-white shadow-lg py-2 px-4 rounded hover:text-black hover:bg-white hover:border hover:border-black md:m-8 my-6 ml-1"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttemptQuiz;
