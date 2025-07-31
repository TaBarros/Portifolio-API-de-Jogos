module.exports = (err, req, res, next) => {
    console.error(err.stack); 
    res.status(err.statusCode || 500).json({
        message: err.message || 'Erro interno do servidor.',
        error: process.env.NODE_ENV === 'development' ? err : {} 
    });
};