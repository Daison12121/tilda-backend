import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к Supabase (используем service_role из .env)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Базовые миддлвары
app.use(express.json());

// CORS (на будущее для Тильды; локально можно оставить *)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // поменяешь на домен Тильды при деплое
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Healthcheck — проверяем, что сервер жив
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Подсказка на корне
app.get("/", (req, res) => {
  res.send("✅ Сервер работает. Проверь: GET /health и GET /user?email=...");
});

// Получить пользователя по email (через query-параметр — удобнее для Postman/браузера)
app.get("/user", async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: "email is required" });

    const { data, error } = await supabase
      .from("users") // ⚠️ имя таблицы: см. шаг 2
      .select("*")
      .eq("email", email)
      .maybeSingle(); // не будет падать, если записи нет

    if (error) return res.status(500).json({ error: error.message });

    if (!data) return res.status(404).json({ error: "User not found" });

    res.json({ data });
  } catch (e) {
    res.status(500).json({ error: e.message || "Internal server error" });
  }
});

// Вариант с :email (на будущее). В Postman иногда проще через query, см. выше.
app.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "User not found" });

    res.json({ data });
  } catch (e) {
    res.status(500).json({ error: e.message || "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
});
