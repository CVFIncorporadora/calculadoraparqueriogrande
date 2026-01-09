require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

/* =========================
   MIDDLEWARES
========================= */
app.use(express.json());
app.use(cors({ origin: "*" }));

/* =========================
   MONGODB CONNECTION
========================= */
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ ERRO: MONGODB_URI não definida no arquivo .env");
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log("✅ Conectado ao MongoDB Atlas");
        seedData();
    })
    .catch((err) => console.error("❌ Erro ao conectar no MongoDB:", err));

/* =========================
   MODELO (SCHEMA)
========================= */
const LoteSchema = new mongoose.Schema({
    ID: { type: String, required: true, unique: true },
    Nome: { type: String, required: true },
    Area: { type: Number, required: true },
    Valor: { type: Number, required: true },
    Vendido: { type: Boolean, default: false }
});

const Lote = mongoose.model("Lote", LoteSchema);

/* =========================
   SEED (POPULAR DADOS)
========================= */
async function seedData() {
    try {
        const count = await Lote.countDocuments();
        if (count === 0) {
            console.log("📂 Banco vazio. Carregando dados do lotes.json...");
            const jsonPath = path.join(__dirname, "lotes.json");

            if (fs.existsSync(jsonPath)) {
                const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

                // Garante que o campo Vendido seja booleano (caso esteja como string "TRUE"/"FALSE")
                const lotesFormatados = jsonData.map(l => ({
                    ...l,
                    Vendido: l.Vendido === true || l.Vendido === "TRUE"
                }));

                await Lote.insertMany(lotesFormatados);
                console.log("✅ Dados carregados com sucesso!");
            } else {
                console.warn("⚠️ Arquivo lotes.json não encontrado para seed.");
            }
        } else {
            console.log(`ℹ️ Banco já contém ${count} lotes. Seed pulado.`);
        }
    } catch (err) {
        console.error("❌ Erro ao popular banco:", err);
    }
}

/* =========================
   ROTAS
========================= */

/* 🔹 LISTAR TODOS OS LOTES */
app.get("/lotes", async (req, res) => {
    try {
        const lotes = await Lote.find();
        res.json(lotes);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar lotes" });
    }
});

/* 🔹 BUSCAR LOTE POR ID */
app.get("/lotes/:id", async (req, res) => {
    try {
        const lote = await Lote.findOne({ ID: req.params.id });
        if (!lote) return res.status(404).json({ erro: "Lote não encontrado" });
        res.json(lote);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar lote" });
    }
});

/* 🔹 ATUALIZAR LOTE */
app.put("/lotes/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Atualiza e retorna o novo documento
        const loteAtualizado = await Lote.findOneAndUpdate(
            { ID: id },
            updates,
            { new: true }
        );

        if (!loteAtualizado) {
            return res.status(404).json({ erro: "Lote não encontrado" });
        }

        res.json({
            mensagem: "Lote atualizado com sucesso",
            lote: loteAtualizado
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao atualizar lote" });
    }
});

/* =========================
   SERVIDOR
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});