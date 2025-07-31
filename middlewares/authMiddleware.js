const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'Nenhum token fornecido, autorização negada.' });
    }


    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Formato de token inválido, autorização negada.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = decoded; 
        next(); 
    } catch (err) {
        console.error('Erro de verificação de token:', err.message);
        res.status(403).json({ message: 'Token inválido ou expirado. Faça login novamente.' });
    }
};