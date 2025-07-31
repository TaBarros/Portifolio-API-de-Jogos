const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    jogo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    nota: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    },
    dataAvaliacao: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Rating', RatingSchema);