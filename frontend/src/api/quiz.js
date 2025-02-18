import axios from "axios";

const API = axios.create({
  baseURL: "https://quiz-mern-dr93.vercel.app/api",
});

export const createQuiz = async (quizData, authToken) => {
  const response = await API.post("/quiz", quizData, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data;
};

export const updateQuiz = async (quizId, quizData, authToken) => {
  const response = await API.put(`/quiz/update/${quizId}`, quizData, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data;
};

export const deleteQuiz = async (quizId, authToken) => {
  const response = await API.delete(`/quiz/del/${quizId}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data;
};

export const getAllQuizzes = async (authToken) => {
  const response = await API.get("/quiz/all", {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data;
};

export const getQuizById = async (quizId, authToken) => {
  const response = await API.get(`/quiz/${quizId}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data;
};

export const submitQuiz = async (quizId, answers, authToken) => {
  const response = await API.post(
    `/quiz/${quizId}/attempt`,
    { answers },
    {
      headers: { Authorization: `Bearer ${authToken}` },
    }
  );
  return response.data;
};

export const getUserQuizAttempts = async (authToken) => {
  const response = await API.get("/quiz/attempts", {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data;
};

export const getLeaderboard = async (quizId, authToken) => {
  if (!quizId) {
    throw new Error("Quiz ID is required");
  }
  const response = await API.get(`/quiz/leaderboard/${quizId}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data;
};

export const getNextQuestion = async (
  quizId,
  currentScore,
  authToken,
  usedQuestions = [],
  selectedOption = null,
  questionId = null
) => {
  const response = await API.get(`/quiz/${quizId}/next-question`, {
    params: {
      currentScore,
      usedQuestions: usedQuestions.join(","), // Send as comma-separated IDs
      selectedOption,
      questionId,
    },
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data;
};
