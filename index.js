import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

// Загрузка переменных окружения из файла .env
dotenv.config();

// Получаем __dirname для ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Инициализация Express
const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к Supabase (используем service_role из .env)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Базовые миддлвары для обработки JSON и URL-кодированных данных
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы
app.use(express.static(__dirname));

// Разрешаем CORS для всех доменов
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ✅ ЭНДПОИНТ: Простая проверка Webhook
// Этот эндпоинт просто возвращает успешный ответ,
// даже если данные не переданы
app.post("/api/login", (req, res) => {
  console.log("Получен запрос POST на /api/login");
  console.log("Данные запроса (req.body):", req.body);
  // Вместо 400 Bad Request мы возвращаем 200 OK
  res.status(200).json({ status: "success", message: "Webhook received data successfully." });
});

// ✅ ЭНДПОИНТ: Получение данных пользователя по токену (остается без изменений)
app.get("/api/user", async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { data: tokenData, error: tokenError } = await supabase
      .from("tokens")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (tokenError || !tokenData || new Date(tokenData.expires_at) < new Date()) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", tokenData.email)
      .maybeSingle();

    if (userError || !userData) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ data: userData });
  } catch (e) {
    res.status(500).json({ error: e.message || "Internal server error" });
  }
});

// ✅ ЭНДПОИНТ: Страница личного кабинета (остается без изменений)
app.get("/cabinet", (req, res) => {
  res.sendFile(path.join(__dirname, "cabinet.html"));
});

// ✅ КОРНЕВАЯ СТРАНИЦА: Информация о сервере
app.get("/", (req, res) => {
  res.send(`
    <h1>🚀 Tilda-Backend Server</h1>
    <p>Сервер работает успешно!</p>
    <h2>Доступные эндпоинты:</h2>
    <ul>
      <li><strong>GET /health</strong> - Проверка работоспособности</li>
      <li><strong>POST /api/login</strong> - Авторизация пользователя</li>
      <li><strong>GET /api/user?token=...</strong> - Получение данных пользователя по токену</li>
    </ul>
    <p>Проверьте логи, чтобы увидеть запросы с Тильды.</p>
  `);
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
