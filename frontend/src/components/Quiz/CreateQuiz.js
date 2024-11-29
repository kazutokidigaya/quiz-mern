import { useState } from "react";
import { createQuiz } from "../../api/quiz";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { CgChevronLeftO } from "react-icons/cg";

const CreateQuiz = () => {
  const navigate = useNavigate();
  const { authToken } = useAuth();
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    questions: [],
  });

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
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, qIndex) => qIndex !== index),
    }));
  };

  const handleAddTag = (index, tag) => {
    if (!tag || tag.trim() === "") {
      console.log("Tag is empty or invalid. Ignoring.");
      return; // Ignore empty tags
    }

    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      if (!updatedQuestions[index].tags.includes(tag)) {
        updatedQuestions[index].tags.push(tag);
      } else {
        console.log(`Tag "${tag}" already exists for question ${index}.`);
      }
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleRemoveTag = (index, tag) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[index].tags = updatedQuestions[index].tags.filter(
      (t) => t !== tag
    );
    setQuizData((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const handleCreateQuiz = async () => {
    try {
      await createQuiz(quizData, authToken);
      toast.success("Quiz created successfully!");
      navigate("/dashboard");
      setQuizData({ title: "", description: "", questions: [] });
    } catch (error) {
      console.error("Failed to create quiz:", error);
      toast.error("Failed to create quiz.");
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

      <div className="p-6 bg-white rounded-lg min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Create Quiz</h1>
        {/* Quiz Title and Description */}
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
        {/* Questions Section */}
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
                {question.tags.map((tag, tagIndex) => (
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
                    const tagValue = e.target.value.trim(); // Get and trim the value
                    if (tagValue) {
                      handleAddTag(index, tagValue); // Pass the tag value
                      e.target.value = ""; // Clear the input after adding the tag
                    }
                  }
                }}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
          </div>
        ))}

        {/* Add Question and Create Quiz Buttons */}
        <div className="flex gap-10 items-start justify-start">
          <button
            onClick={handleAddQuestion}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mb-4"
          >
            Add Question
          </button>
          <button
            onClick={handleCreateQuiz}
            className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600"
          >
            Create Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
