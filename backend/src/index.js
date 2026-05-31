const express = require("express");
const cors = require("cors");
const { initDB } = require("./db");
const tasksRouter = require("./routes/tasks");
const { createClient } = require("redis");
const client = require("prom-client");

const app = express();
const PORT = process.env.PORT || 5000;

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://redis:6379",
});

redisClient.on("error", (err) => console.error("Błąd Redis:", err));
redisClient.on("connect", () => console.log("Połączono z Redis."));

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  req.redis = redisClient;
  next();
});

app.use("/api/tasks", tasksRouter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/redis-test", async (req, res) => {
  try {
    let visits = await redisClient.get("visits");
    visits = visits ? parseInt(visits) + 1 : 1;

    await redisClient.set("visits", visits);

    res.json({
      message: "Redis działa poprawnie.",
      visits: visits,
    });
  } catch (err) {
    res.status(500).json({ error: "Błąd połączenia z Redis" });
  }
});

app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.send(await client.register.metrics());
  } catch (err) {
    res.status(500).send("Błąd podczas generowania metryk");
  }
});

const start = async () => {
  await initDB();
  await redisClient.connect();
  app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
  });
};

start();
