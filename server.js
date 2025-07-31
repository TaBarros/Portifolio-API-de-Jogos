require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRoutes");
const ratingRoutes = require("./routes/ratingRoutes");

const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();


app.use(cors()); 
app.use(express.json());

app.use(express.static("public"));

app.use("/api/auth", authRoutes); 
app.use("/api/games", gameRoutes); 
app.use("/api/ratings", ratingRoutes); 

app.get("/", (req, res) => {
    res.send("API de Jogos funcionando! Acesse /login.html para o frontend.");
});

app.use(errorMiddleware);


const MONGODB_URI = process.env.MONGODB_URI; 
const PORT = process.env.PORT || 5000;


mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log("✅ Conectado ao MongoDB com sucesso.");

        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
            console.log(`Acesse o frontend em http://localhost:${PORT}/login.html`);
        });
    })
    .catch(err => {
        console.error("Erro na conexão com MongoDB:", err.message);
    });