import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Получаем __dirname для ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Инициализация Supabase (используй service_role в .env) ---
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// --- Базовые миддлвары ---
app.use(express.json());

// --- Статические файлы ---
app.use(express.static(__dirname));

// --- CORS (разрешаем Tilda; на локали можно всё) ---
app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  const isTilda = origin.endsWith(".tilda.ws") || origin.endsWith(".tilda.cc");
  const isLocal = origin.startsWith("http://localhost");
  const isCustom = origin === "https://YOUR_CUSTOM_DOMAIN"; // ← при необходимости

  if (isTilda || isLocal || isCustom) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// --- Health ---
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// --- Подсказка на корне ---
app.get("/", (_req, res) =>
  res.send("✅ Сервер работает. GET /health, GET /user/:email, GET /user?email=..., GET /profile?email=...")
);

// --- Страница профиля ---
app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "user-profile.html"));
});

// --- Вариант 1: /user/:email ---
app.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const { data, error } = await supabase
      .from("users")                // таблица: users
      .select("*")
      .eq("email", email)
      .maybeSingle();               // не упадёт, если нет записи

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "User not found" });

    res.json({ data });
  } catch (e) {
    res.status(500).json({ error: e.message || "Internal server error" });
  }
});

// --- Вариант 2: /user?email=... ---
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

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
});
