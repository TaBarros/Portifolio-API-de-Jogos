const Game = require("../models/Game");

exports.criarJogo = async (req, res) => {
    try {
        const { titulo, descricao, categoria, lancamento } = req.body;

        if (!titulo || !lancamento) {

            return res.status(400).json({ message: "Título e ano de lançamento são obrigatórios." });
        }
        if (isNaN(lancamento)) {

            return res.status(400).json({ message: "Ano de lançamento deve ser um número." });
        }

        const novoJogo = new Game({
            titulo,
            descricao,
            categoria,
            lancamento,
            criadoPor: req.user.id
        });
        await novoJogo.save();

        res.status(201).json({ message: "Jogo criado com sucesso!", game: novoJogo });

    } catch (err) {

        console.error("Erro ao criar jogo:", err.message);

        if (err.name === 'ValidationError') {

            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });

        }
        res.status(500).json({ message: "Erro interno do servidor ao criar jogo." });
    }
};

exports.listarJogos = async (req, res) => {
    try {

        const jogos = await Game.find().populate("criadoPor", "username");
        res.status(200).json(jogos);

    } catch (err) {
        console.error("Erro ao buscar jogos:", err.message);
        res.status(500).json({ message: "Erro interno do servidor ao buscar jogos." });
    }
};

exports.buscarJogoPorId = async (req, res) => {
    try {

        const jogo = await Game.findById(req.params.id).populate("criadoPor", "username");
        
        if (!jogo) {
            return res.status(404).json({ message: "Jogo não encontrado." });
        }
        res.status(200).json(jogo);
    } catch (err) {
        console.error("Erro ao buscar jogo por ID:", err.message);
        res.status(500).json({ message: "Erro interno do servidor ao buscar jogo." });
    }
};

exports.atualizarJogo = async (req, res) => {
    try {
        const jogo = await Game.findById(req.params.id);

        if (!jogo) {
            return res.status(404).json({ message: "Jogo não encontrado." });
        }

        if (jogo.criadoPor.toString() !== req.user.id) {
            return res.status(403).json({ message: "Acesso negado: Você não é o criador deste jogo." });
        }

        const jogoAtualizado = await Game.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: "Jogo atualizado com sucesso!", game: jogoAtualizado });
    } catch (err) {
        console.error("Erro ao atualizar jogo:", err.message);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: "Erro interno do servidor ao atualizar jogo." });
    }
};

exports.deletarJogo = async (req, res) => {
    try {
        const jogo = await Game.findById(req.params.id);

        if (!jogo) {
            return res.status(404).json({ message: "Jogo não encontrado." });
        }

        if (jogo.criadoPor.toString() !== req.user.id) {
            return res.status(403).json({ message: "Acesso negado: Você não é o criador deste jogo." });
        }

        await Game.deleteOne({ _id: req.params.id });

        res.status(200).json({ message: "Jogo deletado com sucesso!" });
    } catch (err) {
        console.error("Erro ao deletar jogo:", err.message);
        res.status(500).json({ message: "Erro interno do servidor ao deletar jogo." });
    }
};