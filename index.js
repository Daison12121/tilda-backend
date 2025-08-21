import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import crypto from "crypto";

// Загрузка переменных окружения из файла .env
dotenv.config();

// Инициализация Express
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// Подключение к Supabase (используем service_role из .env)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Базовые миддлвары для обработки JSON и URL-кодированных данных
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Разрешаем CORS для всех доменов
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Healthcheck — проверяем, что сервер жив
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ✅ НОВЫЙ ЭНДПОИНТ: Обработка вебхука с формы Тильды (POST-запрос)
app.post("/api/login", async (req, res) => {
  try {
    const { email } = req.body; // Данные из формы приходят в теле запроса (req.body)
    if (!email) {
      return res.status(400).json({ status: "error", error: "email is required" });
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error || !data) {
      // ✅ Важно: При ошибке отправляем JSON-ответ с ошибкой, который Тильда может показать пользователю
      return res.status(404).json({ status: "error", error: "Пользователь не найден." });
    }

    // ✅ Генерируем уникальный токен
    const token = crypto.randomBytes(32).toString('hex');
    const { error: tokenError } = await supabase
      .from("tokens") // Убедитесь, что таблица 'tokens' создана в Supabase
      .insert({ token, email });

    if (tokenError) {
      return res.status(500).json({ status: "error", error: tokenError.message });
    }

    // ✅ Отправляем ответ, который перенаправит пользователя
    res.json({ status: "success", redirect: `/cabinet?token=${token}` });

  } catch (e) {
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
});

// ✅ СУЩЕСТВУЮЩИЙ ЭНДПОИНТ: Получение данных пользователя по email
app.get("/user", async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: "email is required" });

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

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
