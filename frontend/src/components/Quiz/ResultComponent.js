import React from "react";
import { CgChevronLeftO } from "react-icons/cg";
import { useLocation, useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ResultComponent = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); // Access passed data
  const { score, difficultyStats, tagPerformance } = state;

  // Prepare data for the difficulty breakdown
  const difficultyData = Object.entries(difficultyStats).map(
    ([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize difficulty
      value,
    })
  );

  // Prepare data for tag performance
  const tagData = Object.entries(tagPerformance).map(([tag, value]) => ({
    name: tag,
    accuracy: parseFloat(value.accuracy), // Convert to a number
    correct: value.correct,
    total: value.total,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]; // Colors for pie chart sections

  return (
    <div>
      <button
        onClick={() => navigate("/dashboard")}
        className=" bg-white text-black shadow-lg py-2 px-4 rounded hover:text-white hover:bg-black my-6"
      >
        <CgChevronLeftO className="text-2xl" />
      </button>

      <div className="p-6 flex rounded-lg flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">Quiz Results</h1>
        <p className="text-lg text-gray-700 mb-4">
          Your final score: <span className="font-bold">{score}</span>
        </p>

        {/* Container for the charts */}
        <div className="w-full max-w-5xl bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Difficulty Breakdown */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-bold mb-4">Difficulty Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={difficultyData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Tag Performance */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-bold mb-4">Tag Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tagData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Legend verticalAlign="top" />
                  <Bar
                    dataKey="accuracy"
                    fill="#82ca9d"
                    barSize={30}
                    name="Accuracy (%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Tag Performance */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-4">Detailed Tag Performance</h3>
            <ul className="list-disc pl-6">
              {tagData.map(({ name, accuracy, correct, total }) => (
                <li key={name} className="text-gray-700">
                  <strong>{name}</strong>: Accuracy: {accuracy}%, Correct:{" "}
                  {correct}, Total: {total}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-500 mt-8 shadow-lg text-gray-100 px-4 py-2 rounded-full text-base font-semibold hover:bg-blue-600 hover:shadow-none"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ResultComponent;
