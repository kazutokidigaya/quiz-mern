import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import {
  createQuiz,
  deleteQuiz,
  getAllQuizzes,
  getLeaderboard,
  getNextQuestion,
  getQuizById,
  getUserQuizAttempts,
  submitQuiz,
  updateQuiz,
} from "../controllers/quizControllers.js";

const router = express.Router();

// to create a quiz
router.post("/", authMiddleware, adminMiddleware, createQuiz);

// to update the exsisting quiz
router.put("/update/:id", authMiddleware, adminMiddleware, updateQuiz);

// to delete the exsisting quiz
router.delete("/del/:id", authMiddleware, adminMiddleware, deleteQuiz);

// to attempt a exsisting quiz
router.post("/:id/attempt", authMiddleware, submitQuiz);

// to get the attempts made by the user
router.get("/attempts", authMiddleware, getUserQuizAttempts);

// to get the leaderboard for a quiz
router.get("/leaderboard/:quizId", getLeaderboard);

// to get all the quizes made
router.get("/all", authMiddleware, getAllQuizzes);

// to get a particular quiz
router.get("/:id", authMiddleware, getQuizById);

// to get the next question for the quiz
router.get("/:id/next-question", authMiddleware, getNextQuestion);

export default router;
