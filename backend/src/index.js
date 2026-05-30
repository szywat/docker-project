const express = require("express");
const cors = require("cors");
const { initDB } = require("./db");
const tasksRouter = require("./routes/tasks");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/tasks", tasksRouter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

const start = async () => {
  await initDB();
  app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
  });
};

start();
