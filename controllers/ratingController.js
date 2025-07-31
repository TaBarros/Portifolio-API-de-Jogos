const Rating = require("../models/Rating");
const Game = require("../models/Game");
const mongoose = require('mongoose'); // Importar mongoose para Types.ObjectId

exports.avaliarJogo = async (req, res) => {
    const { nota } = req.body;
    const { id } = req.params; // Renomeado de jogoId para id para consistência com req.params.id
    const usuarioId = req.user.id;

    if (nota === undefined || nota < 0 || nota > 10) {
        return res.status(400).json({ message: 'A nota deve ser um número entre 0 e 10.' });
    }

    try {
        const game = await Game.findById(id);
        if (!game) {
            return res.status(404).json({ message: 'Jogo não encontrado.' });
        }

        let rating = await Rating.findOne({ jogo: id, usuario: usuarioId });

        if (rating) {
            rating.nota = nota;
            rating.dataAvaliacao = Date.now();
            await rating.save();
            res.status(200).json({ message: 'Avaliação atualizada com sucesso!', rating });
        } else {
            rating = new Rating({
                jogo: id,
                usuario: usuarioId,
                nota: nota
            });
            await rating.save();
            res.status(201).json({ message: 'Avaliação registrada com sucesso!', rating });
        }
    } catch (err) {
        console.error("Erro ao processar avaliação:", err.message);
        res.status(500).json({ message: 'Erro interno do servidor ao processar avaliação.' });
    }
};

exports.mediaDoJogo = async (req, res) => {
    const { id } = req.params; // Renomeado de jogoId para id

    try {
        const result = await Rating.aggregate([
            { $match: { jogo: new mongoose.Types.ObjectId(id) } },
            {
                $group: {
                    _id: '$jogo',
                    media: { $avg: '$nota' },
                    total: { $sum: 1 }
                }
            }
        ]);

        if (result.length === 0) {
            return res.status(200).json({ media: 0, total: 0, message: 'Nenhuma avaliação para este jogo ainda.' });
        }

        res.status(200).json({ media: result[0].media.toFixed(2), total: result[0].total });

    } catch (err) {
        console.error("Erro ao calcular média das avaliações:", err.message);
        res.status(500).json({ message: 'Erro interno do servidor ao calcular média das avaliações.' });
    }
};