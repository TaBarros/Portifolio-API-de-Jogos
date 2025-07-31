const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, gameController.criarJogo);
router.get("/", authMiddleware, gameController.listarJogos);
router.get("/:id", authMiddleware, gameController.buscarJogoPorId);
router.put("/:id", authMiddleware, gameController.atualizarJogo);
router.delete("/:id", authMiddleware, gameController.deletarJogo);

module.exports = router;