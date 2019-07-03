const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json');

module.exports = (req, res, next) => {

	const authHeaders = req.headers.authorization;

	if(!authHeaders)
		return res.status(401).send({ error: 'Token não encontrado' });

	const parts = authHeaders.split(' ');

	if(!parts.length === 2)
		return res.status(401).send({ error: 'Erro de token' });

	const [ scheme, token ] = parts;

	if(!/^Bearer$/i.test(scheme))
		return res.status(401).send({ error: 'Token mal formado' });

	jwt.verify(token, authConfig.secret, (err, decoded) => {
		if(err) return res.status(401).send({ error: 'Token invalido' });

		req.userId = decoded.id;

		return next();
	});

};