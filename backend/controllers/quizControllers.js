import mongoose from "mongoose";
import redis from "../config/redisclient.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import jwt from "jsonwebtoken";

const extendTokenExpiration = async (userId, token) => {
  try {
    await redis.set(userId.toString(), token, "EX", 7200); // Extend by 1 hour
    return true; // Explicitly return true for success
  } catch (error) {
    console.error("Error updating token expiration in Redis:", error);
    return false; // Return false for failure
  }
};

const createQuiz = async (req, res) => {
  const { title, description, questions } = req.body;

  try {
    const easyQuestions = questions.filter((q) => q.difficulty === "easy");
    const mediumQuestions = questions.filter((q) => q.difficulty === "medium");
    const hardQuestions = questions.filter((q) => q.difficulty === "hard");

    const quiz = new Quiz({
      title,
      description,
      createdBy: req.user.id,
      easyQuestions,
      mediumQuestions,
      hardQuestions,
    });

    const response = await quiz.save();
    if (!response) console.log(response);

    res.status(201).json({ message: "quiz created successfully", quiz });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ message: "Failed to create quiz" });
  }
};

const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("createdBy", "name email");
    if (!quizzes) console.log("error while getting quizes", quizzes);
    res.status(200).json(quizzes);
  } catch (error) {
    console.error("Error catching quizzes:", error);
    res.status(500).json({ message: "Failed to fetch quizzes" });
  }
};

const getQuizById = async (req, res) => {
  const { id } = req.params;

  try {
    const quiz = await Quiz.findById(id).populate("createdBy", "name email");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    res.status(200).json(quiz);
  } catch (error) {
    console.error("Error Fetching quiz:", error);
    res.status(500).json({ message: "Failed to fetch quiz" });
  }
};

const updateQuiz = async (req, res) => {
  const { id } = req.params;
  const { title, description, questions } = req.body;

  try {
    // Categorize questions by difficulty
    const easyQuestions = questions.filter((q) => q.difficulty === "easy");
    const mediumQuestions = questions.filter((q) => q.difficulty === "medium");
    const hardQuestions = questions.filter((q) => q.difficulty === "hard");

    const quiz = await Quiz.findByIdAndUpdate(
      id,
      {
        title,
        description,
        easyQuestions,
        mediumQuestions,
        hardQuestions,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    res.status(200).json({ message: "Quiz updated successfully", quiz });
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).json({ message: "Failed to update quiz" });
  }
};

const deleteQuiz = async (req, res) => {
  const { id } = req.params;

  try {
    const quiz = await Quiz.findByIdAndDelete(id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    const response = await QuizAttempt.deleteMany({ quiz: id });
    if (!response) return console.log("Error deleting QuizAttempts", response);

    res
      .status(200)
      .json({ message: "Quiz and related attempts deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({ message: "Failed to delete quiz" });
  }
};

const getNextQuestion = async (req, res) => {
  const { id } = req.params; // quizId
  const {
    currentScore = 0,
    selectedOption,
    questionId,
    usedQuestions = [],
  } = req.query;

  try {
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const token = req.header("Authorization").split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const isExtended = await extendTokenExpiration(decoded.id, token);
    if (!isExtended) {
      console.error("Failed to extend token expiration");
    }

    let score = parseInt(currentScore) || 0;

    // Validate and update the score if the answer is correct
    if (selectedOption !== undefined && questionId) {
      const allQuestions = quiz.easyQuestions
        .concat(quiz.mediumQuestions)
        .concat(quiz.hardQuestions);

      const question = allQuestions.find(
        (q) => q._id.toString() === questionId
      );

      if (question && question.correctOption === parseInt(selectedOption)) {
        score +=
          question.difficulty === "easy"
            ? 1
            : question.difficulty === "medium"
            ? 2
            : 3;
      }
    }

    // Ensure `usedQuestions` is an array
    const usedQuestionSet = new Set(
      Array.isArray(usedQuestions)
        ? usedQuestions
        : usedQuestions.split(",").filter((id) => id) // Fallback for string input
    );

    // Combine all questions and filter out used ones
    const allQuestions = quiz.easyQuestions
      .concat(quiz.mediumQuestions)
      .concat(quiz.hardQuestions);

    // Check if there are any remaining questions within the limit
    const filteredQuestions = allQuestions.filter(
      (question) => !usedQuestionSet.has(question._id.toString())
    );

    const totalQuestions = Math.min(20, allQuestions.length);

    if (
      usedQuestionSet.size >= totalQuestions ||
      filteredQuestions.length === 0
    ) {
      return res
        .status(200)
        .json({ message: "All questions have been attempted.", score });
    }

    // Dynamically set difficulty based on score
    let difficulty = "easy";
    if (score > 10) difficulty = "medium";
    if (score > 20) difficulty = "hard";

    // Filter questions based on difficulty
    const difficultyPool =
      difficulty === "easy"
        ? quiz.easyQuestions
        : difficulty === "medium"
        ? quiz.mediumQuestions
        : quiz.hardQuestions;

    const remainingQuestions = difficultyPool.filter(
      (q) => !usedQuestionSet.has(q._id.toString())
    );

    if (remainingQuestions.length === 0) {
      return res
        .status(200)
        .json({ message: "All questions have been attempted.", score });
    }

    // Select a random question from the remaining ones
    const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
    const nextQuestion = remainingQuestions[randomIndex];

    res.status(200).json({
      question: {
        questionText: nextQuestion.questionText,
        options: nextQuestion.options,
        tags: nextQuestion.tags,
        timeLimit: nextQuestion.timeLimit || 30,
        questionId: nextQuestion._id,
        difficulty: nextQuestion.difficulty,
      },
      score,
      totalQuestions,
      questionsAttempted: usedQuestionSet.size + 1,
    });
  } catch (error) {
    console.error("Error fetching next question:", error);
    res.status(500).json({ message: "Failed to fetch next question." });
  }
};

// 2. submitQuiz
const submitQuiz = async (req, res) => {
  const { id } = req.params; // Quiz ID
  const { answers } = req.body; // Submitted answers

  try {
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let score = 0;
    let stats = { easy: 0, medium: 0, hard: 0 };
    let tagPerformance = {}; // Initialize tag performance tracker
    const enrichedAnswers = [];

    // Process each answer
    answers.forEach((answer) => {
      const questionPool = quiz.easyQuestions
        .concat(quiz.mediumQuestions)
        .concat(quiz.hardQuestions);

      const question = questionPool.find(
        (q) => q._id.toString() === answer.questionId
      );

      if (question) {
        // Add enriched answer details
        enrichedAnswers.push({
          questionId: question._id.toString(),
          selectedOption: answer.selectedOption,
          difficulty: question.difficulty,
          tags: question.tags,
        });

        // Update score if the answer is correct
        if (answer.selectedOption === question.correctOption) {
          score +=
            question.difficulty === "easy"
              ? 1
              : question.difficulty === "medium"
              ? 2
              : 3;

          // Increment correct answers for each tag
          question.tags.forEach((tag) => {
            if (!tagPerformance[tag]) {
              tagPerformance[tag] = { correct: 0, total: 0 };
            }
            tagPerformance[tag].correct++;
          });
        }

        // Increment total attempts for each tag
        question.tags.forEach((tag) => {
          if (!tagPerformance[tag]) {
            tagPerformance[tag] = { correct: 0, total: 0 };
          }
          tagPerformance[tag].total++;
        });

        // Update difficulty stats
        stats[question.difficulty]++;
      }
    });

    const quizAttempt = new QuizAttempt({
      user: req.user.id,
      quiz: id,
      score,
      answers: enrichedAnswers,
      stats,
      completed: true,
    });

    await quizAttempt.save();

    // Format tagPerformance for the response
    const formattedTagPerformance = Object.entries(tagPerformance).reduce(
      (acc, [tag, performance]) => {
        acc[tag] = {
          accuracy: ((performance.correct / performance.total) * 100).toFixed(
            2
          ), // Calculate accuracy percentage
          correct: performance.correct,
          total: performance.total,
        };
        return acc;
      },
      {}
    );

    res.status(200).json({
      message: "Quiz submitted successfully",
      score,
      stats,
      tagPerformance: formattedTagPerformance, // Include tag performance
      answers,
      quiz,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({ message: "Failed to submit quiz." });
  }
};

const getUserQuizAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user.id })
      .populate("quiz", "title easyQuestions mediumQuestions hardQuestions")
      .sort({ createdAt: -1 });

    const enrichedAttempts = attempts.map((attempt) => {
      const enrichedAnswers = attempt.answers.map((answer) => {
        const allQuestions = attempt.quiz.easyQuestions
          .concat(attempt.quiz.mediumQuestions)
          .concat(attempt.quiz.hardQuestions);

        const question = allQuestions.find(
          (q) => q._id.toString() === answer.questionId
        );

        if (question) {
          return {
            ...answer,
            questionText: question.questionText,
            correctAnswer: question.options[question.correctOption], // Map correct option to text
            yourAnswer:
              answer.selectedOption !== undefined
                ? question.options[answer.selectedOption]
                : "Skipped", // Handle skipped casexx
            tags: question.tags,
          };
        }

        return answer; // Fallback if question not found
      });

      return {
        ...attempt._doc, // Retain original attempt data
        answers: enrichedAnswers, // Replace with enriched answers
      };
    });

    res.status(200).json(enrichedAttempts);
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    res.status(500).json({ message: "Failed to fetch quiz attempts" });
  }
};

const getLeaderboard = async (req, res) => {
  const { quizId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid Quiz ID." });
    }

    const leaderBoard = await QuizAttempt.find({ quiz: quizId })
      .populate("user", "name email")
      .sort({ score: -1 })
      .limit(10);

    res.status(200).json(leaderBoard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard." });
  }
};

export {
  createQuiz,
  getAllQuizzes,
  getLeaderboard,
  getUserQuizAttempts,
  submitQuiz,
  getNextQuestion,
  deleteQuiz,
  updateQuiz,
  getQuizById,
};
