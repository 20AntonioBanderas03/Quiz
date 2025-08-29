const express = require("express");
const cors = require("cors");
const db = require("./database");

require("dotenv").config();
const PORT = process.env.SERVER_PORT || process.env.RESERVE_SERVER_PORT;

const app = express();

app.use(cors());
app.use(express.json());

// Простая проверка авторизации через сессию
const checkAuth = (req, res, next) => {
  const userId = req.headers["user-id"];

  if (!userId) {
    return res.status(401).json({ error: "User ID required" });
  }

  // Проверяем существование пользователя
  db.get("SELECT id FROM users WHERE id = ?", [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.userId = userId;
    next();
  });
};

// Регистрация пользователя
app.post("/api/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    db.run(
      "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
      [username, password, email],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE constraint failed")) {
            return res
              .status(400)
              .json({ error: "Username already exists" });
          }
          return res.status(500).json({ error: "Database error" });
        }

        res.status(201).json({
          message: "User created successfully",
          userId: this.lastID,
          username: username,
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Авторизация пользователя
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = user.password === password;
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({
        userId: user.id,
        username: user.username,
        email: user.email,
      });
    }
  );
});

// Получение всех квизов
app.get("/api/quizzes", (req, res) => {
  db.all("SELECT * FROM quizzes", (err, quizzes) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    // Парсим вопросы из JSON строки
    const quizzesWithQuestions = quizzes.map((quiz) => ({
      ...quiz,
      questions: JSON.parse(quiz.questions),
    }));

    res.json(quizzesWithQuestions);
  });
});

// Получение прогресса пользователя
app.get("/api/progress", checkAuth, (req, res) => {
  const userId = req.userId;

  db.all(
    `SELECT up.*, q.title as quiz_title 
         FROM user_progress up 
         JOIN quizzes q ON up.quiz_id = q.id 
         WHERE up.user_id = ?`,
    [userId],
    (err, progress) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      res.json(progress);
    }
  );
});

// Сохранение результата квиза
app.post("/api/quiz/attempt", checkAuth, (req, res) => {
  const userId = req.userId;
  const { quizId, score, totalQuestions, answers, timeSpent } = req.body;

  db.serialize(() => {
    // Сохраняем попытку
    db.run(
      `INSERT INTO quiz_attempts (user_id, quiz_id, score, total_questions, answers, time_spent)
             VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        quizId,
        score,
        totalQuestions,
        JSON.stringify(answers),
        timeSpent,
      ],
      function (err) {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }

        // Обновляем прогресс
        db.run(
          `INSERT OR REPLACE INTO user_progress 
                     (user_id, quiz_id, score, total_questions, completed, last_attempt)
                     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [userId, quizId, score, totalQuestions, score === totalQuestions],
          function (err) {
            if (err) {
              return res.status(500).json({ error: "Database error" });
            }

            res.json({
              message: "Quiz attempt saved successfully",
              attemptId: this.lastID,
            });
          }
        );
      }
    );
  });
});

// Получение истории попыток пользователя
app.get("/api/quiz/history", checkAuth, (req, res) => {
  const userId = req.userId;
  const { quizId } = req.query;

  let query = `SELECT qa.*, q.title as quiz_title 
                 FROM quiz_attempts qa 
                 JOIN quizzes q ON qa.quiz_id = q.id 
                 WHERE qa.user_id = ?`;
  let params = [userId];

  if (quizId) {
    query += " AND qa.quiz_id = ?";
    params.push(quizId);
  }

  query += " ORDER BY qa.completed_at DESC";

  db.all(query, params, (err, attempts) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    // Парсим answers из JSON строки
    const attemptsWithAnswers = attempts.map((attempt) => ({
      ...attempt,
      answers: JSON.parse(attempt.answers),
    }));

    res.json(attemptsWithAnswers);
  });
});

// Создание тестового квиза (для демонстрации)
app.post("/api/quiz/create-demo", (req, res) => {
  const demoQuiz = {
    title: "Тестовый квиз",
    description: "Пример квиза для тестирования",
    questions: [
      {
        question: "Столица России?",
        options: ["Москва", "Санкт-Петербург", "Казань", "Новосибирск"],
        correctAnswer: 0,
      },
      {
        question: "2 + 2 = ?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 1,
      },
      {
        question: "Самый большой океан?",
        options: ["Атлантический", "Индийский", "Северный Ледовитый", "Тихий"],
        correctAnswer: 3,
      },
    ],
  };

  db.run(
    "INSERT INTO quizzes (title, description, questions) VALUES (?, ?, ?)",
    [demoQuiz.title, demoQuiz.description, JSON.stringify(demoQuiz.questions)],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Demo quiz created", quizId: this.lastID });
    }
  );
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
