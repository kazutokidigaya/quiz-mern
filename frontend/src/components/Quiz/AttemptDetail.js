import React from "react";
import { CgChevronLeftO } from "react-icons/cg";
import { useLocation, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const AttemptDetail = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { quiz, score, stats, answers } = state;

  const difficultyData = Object.entries(stats).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize difficulty
    value,
  }));

  return (
    <div>
      <button
        onClick={() => navigate("/quiz/history")}
        className=" bg-white text-black shadow-lg py-2 px-4 rounded hover:text-white hover:bg-black my-8"
      >
        <CgChevronLeftO className="text-2xl" />
      </button>
      <div className="p-8 rounded-lg flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          Quiz Details - {quiz.title}
        </h1>
        <p className="text-lg text-gray-700 mb-4">
          Your final score: <span className="font-bold">{score}</span>
        </p>

        {/* Performance Breakdown */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
          <div>
            <h2 className="text-lg font-bold mb-2">Performance Breakdown</h2>
            <PieChart width={300} height={300}>
              <Pie
                data={difficultyData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {difficultyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Difficulty Summary:</h3>
            <ul className="list-disc list-inside">
              {difficultyData.map(({ name, value }) => (
                <li key={name}>
                  <span className="font-bold">{name}:</span> {value} questions
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Answers Section */}
        <h2 className="text-xl font-bold mb-4">Answers</h2>
        <div className="w-full max-w-4xl">
          {answers.map((answer, index) => (
            <div
              key={index}
              className={`p-4 mb-4 rounded shadow-md ${
                answer.correctAnswer === answer.yourAnswer
                  ? "bg-green-100"
                  : "bg-red-100"
              }`}
            >
              <h3 className="font-bold text-gray-800">
                Question {index + 1}: {answer.questionText}
              </h3>
              <p>Your Answer: {answer.yourAnswer}</p>
              <p>Correct Answer: {answer.correctAnswer}</p>
              <p>
                Tags: {answer.tags.length ? answer.tags.join(", ") : "None"}
              </p>
              <p>Difficulty: {answer._doc.difficulty}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate("/quiz/history")}
          className="bg-blue-500 flex gap-2 items-center shadow-lg text-gray-100 px-4 py-2 rounded-xl text-base font-semibold hover:bg-blue-600 hover:shadow-none transition"
        >
          <CgChevronLeftO className="text-2xl" />
          Back to History
        </button>
      </div>
    </div>
  );
};

export default AttemptDetail;
