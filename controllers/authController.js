const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {

    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: "Por favor, preencha todos os campos obrigatórios." });
    }

    try {
        let user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) {
            if (user.username === username) {
                return res.status(409).json({ message: 'Nome de usuário já existe.' });
            }
            if (user.email === email) {
                return res.status(409).json({ message: 'E-mail já registrado.' });
            }
        }

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });

    } catch (err) {
        console.error('Erro no registro:', err.message);

        if (err.code === 11000) {

            return res.status(409).json({ message: 'Usuário ou e-mail já existe (duplicidade de índice).' });

        }
        res.status(500).json({ message: 'Erro interno do servidor ao registrar.' });
    }
};

exports.login = async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {

        return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }

    try {

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {

            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token, message: 'Login realizado com sucesso!' });

    } catch (err) {
        console.error('Erro no login:', err.message);
        res.status(500).json({ message: 'Erro interno do servidor ao fazer login.' });
    }
};