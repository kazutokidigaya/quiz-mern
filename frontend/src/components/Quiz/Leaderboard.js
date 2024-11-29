import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLeaderboard } from "../../api/quiz";
import { CgChevronLeftO } from "react-icons/cg";
import Loading from "../Loading";

const Leaderboard = () => {
  const navigate = useNavigate();
  const { quizId } = useParams(); // Extract quizId from URL
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard(quizId); // Pass quizId to API call

        setLeaderboard(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [quizId]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <button
        onClick={() => navigate("/dashboard")}
        className=" bg-white text-black shadow-lg py-2 px-4 rounded hover:text-white hover:bg-black my-8"
      >
        <CgChevronLeftO className="text-2xl" />
      </button>

      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-6 pt-12">
          Leaderboard
        </h1>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Rank</th>
                <th className="py-2 px-4 border-b">User</th>
                <th className="py-2 px-4 border-b">Score</th>
                <th className="py-2 px-4 border-b">Easy</th>
                <th className="py-2 px-4 border-b">Medium</th>
                <th className="py-2 px-4 border-b">Hard</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard && leaderboard.length > 0 ? (
                leaderboard.map((entry, index) => (
                  <tr key={entry._id || index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{index + 1}</td>
                    <td className="py-2 px-4 border-b">
                      {entry.user?.name || "Unknown"}
                    </td>
                    <td className="py-2 px-4 border-b">{entry.score || 0}</td>
                    <td className="py-2 px-4 border-b">
                      {entry.stats?.easy || 0}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {entry.stats?.medium || 0}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {entry.stats?.hard || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    No data available for the leaderboard.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
