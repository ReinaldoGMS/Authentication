const db = require("./db");
const express = require("express");
const path = require("path");

const app = express();

// Para ler formulário HTML (POST)
app.use(express.urlencoded({ extended: true }));

// Para servir seus arquivos HTML/CSS
app.use(express.static(path.join(__dirname, "public")));

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.get("/ping-db", async (req, res) => {
  try {
    const r = await db.query("SELECT NOW() as agora");
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro no banco");
  }
});

const bcrypt = require("bcrypt");

app.post("/register", async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).send("Preencha todos os campos.");
  }

  try {
    // 1️⃣ Criptografar senha
    const hash = await bcrypt.hash(senha, 10);

    // 2️⃣ Inserir no banco
    await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [nome, email.toLowerCase(), hash]
    );

    res.send("Usuário cadastrado com sucesso!");
  } catch (err) {
    console.error(err);

    if (err.code === "23505") {
      return res.status(400).send("Email já cadastrado.");
    }

    res.status(500).send("Erro no servidor.");
  }
});

app.listen(3000, () => console.log("http://localhost:3000"));