import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getQuizById, updateQuiz } from "../../api/quiz";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { CgChevronLeftO } from "react-icons/cg";

const UpdateQuiz = () => {
  const navigate = useNavigate();
  const { authToken } = useAuth();
  const { id } = useParams();
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    questions: [],
  });

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await getQuizById(id, authToken); // API call to fetch quiz
        setQuizData({
          title: data.title,
          description: data.description,
          questions: [
            ...data.easyQuestions,
            ...data.mediumQuestions,
            ...data.hardQuestions,
          ],
        });
      } catch (error) {
        toast.error("Failed to fetch quiz data");
      }
    };

    fetchQuiz();
  }, [id, authToken]);

  const handleAddQuestion = () => {
    setQuizData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: "",
          options: ["", "", "", ""],
          correctOption: 0,
          difficulty: "easy",
          tags: [],
        },
      ],
    }));
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = quizData.questions.filter((_, i) => i !== index);
    setQuizData((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const handleAddTag = (index, tag) => {
    if (!tag || tag.trim() === "") {
      return; // Ignore empty tags
    }
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      if (!updatedQuestions[index].tags.includes(tag.trim())) {
        updatedQuestions[index].tags.push(tag.trim());
      }
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleRemoveTag = (index, tag) => {
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index].tags = updatedQuestions[index].tags.filter(
        (t) => t !== tag
      );
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleUpdateQuiz = async () => {
    try {
      await updateQuiz(id, quizData, authToken); // API call to update quiz
      toast.success("Quiz updated successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to update quiz");
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate("/dashboard")}
        className=" bg-white text-black shadow-lg py-2 px-4 rounded hover:text-white hover:bg-black my-8"
      >
        <CgChevronLeftO className="text-2xl" />
      </button>

      <div className="p-6 bg-white min-h-screen rounded-lg">
        <h1 className="text-3xl font-bold mb-6">Update Quiz</h1>
        <input
          type="text"
          placeholder="Quiz Title"
          value={quizData.title}
          onChange={(e) =>
            setQuizData((prev) => ({ ...prev, title: e.target.value }))
          }
          className="w-full mb-4 px-4 py-2 border rounded-md"
        />
        <textarea
          placeholder="Quiz Description"
          value={quizData.description}
          onChange={(e) =>
            setQuizData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="w-full mb-4 px-4 py-2 border rounded-md"
        />
        {quizData.questions.map((question, index) => (
          <div key={index} className="border p-4 mb-4 relative">
            {/* Improved Remove Button */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() => handleRemoveQuestion(index)}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-300"
              >
                Remove Question
              </button>
            </div>
            {/* Question Text */}
            <input
              type="text"
              placeholder="Question Text"
              value={question.questionText}
              onChange={(e) => {
                const updatedQuestions = [...quizData.questions];
                updatedQuestions[index].questionText = e.target.value;
                setQuizData((prev) => ({
                  ...prev,
                  questions: updatedQuestions,
                }));
              }}
              className="w-full mb-2 px-4 py-2 border rounded-md"
            />

            {/* Options */}
            {question.options.map((option, optIndex) => (
              <input
                key={optIndex}
                type="text"
                placeholder={`Option ${optIndex + 1}`}
                value={option}
                onChange={(e) => {
                  const updatedQuestions = [...quizData.questions];
                  updatedQuestions[index].options[optIndex] = e.target.value;
                  setQuizData((prev) => ({
                    ...prev,
                    questions: updatedQuestions,
                  }));
                }}
                className="w-full mb-2 px-4 py-2 border rounded-md"
              />
            ))}

            {/* Correct Option Selector */}
            <select
              value={question.correctOption}
              onChange={(e) => {
                const updatedQuestions = [...quizData.questions];
                updatedQuestions[index].correctOption = parseInt(
                  e.target.value
                );
                setQuizData((prev) => ({
                  ...prev,
                  questions: updatedQuestions,
                }));
              }}
              className="w-full mb-2 px-4 py-2 border rounded-md"
            >
              {question.options.map((_, optIndex) => (
                <option key={optIndex} value={optIndex}>
                  Correct Option {optIndex + 1}
                </option>
              ))}
            </select>

            {/* Difficulty Selector */}
            <select
              value={question.difficulty}
              onChange={(e) => {
                const updatedQuestions = [...quizData.questions];
                updatedQuestions[index].difficulty = e.target.value;
                setQuizData((prev) => ({
                  ...prev,
                  questions: updatedQuestions,
                }));
              }}
              className="w-full mb-2 px-4 py-2 border rounded-md"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Tags Section */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {question.tags?.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm flex items-center"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(index, tag)}
                      className="ml-2 text-xs"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add Tag"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag(index, e.target.value.trim());
                    e.target.value = "";
                  }
                }}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
          </div>
        ))}

        {/* Add Question and Update Quiz Buttons */}
        <div className="flex gap-10 items-start justify-start">
          <button
            onClick={handleAddQuestion}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mb-4"
          >
            Add Question
          </button>
          <button
            onClick={handleUpdateQuiz}
            className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600"
          >
            Update Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateQuiz;
