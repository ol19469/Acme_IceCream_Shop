const express = require("express");
const pg = require("pg");

const { Client } = pg;
const client = new Client({
  user: "postgres",
  password: "ol121632", // Add password if your DB has one
  host: "localhost",
  port: 5432,
  database: "example",
});

const server = express();
const PORT = 3000;

server.use(express.json());

server.get("/", (req, res) => {
  res.send("Hello World!");
});

// GET all flavors
server.get("/api/flavors", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM flavors");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connect to DB, then start server
client
  .connect()
  .then(() => {
    console.log("Connected to the database");
    server.listen(PORT, () => {
      console.log(`Server is listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

server.post("/api/flavors", async (req, res) => {
  const { name, is_favorite } = req.body;

  try {
    const result = await client.query(
      `INSERT INTO flavors (name, is_favorite, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING *`,
      [name, is_favorite]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
server.delete("/api/flavors/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await client.query("DELETE FROM flavors WHERE id = $1", [id]);
    res.sendStatus(204); // No Content
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

server.get("/api/flavors/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await client.query("SELECT * FROM flavors WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Flavor not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
