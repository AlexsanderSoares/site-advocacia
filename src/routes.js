const express = require('express');
const authController = require('./app/controllers/authController');
const articleController = require('./app/controllers/articleController');

const authMiddleware = require('./app/middlewares/auth');

const routes = express.Router();

routes.get('/', (req, res) => { res.send('ok') });

routes.post('/login', authController.login);
routes.get('/articles/list', articleController.index);

routes.use(authMiddleware);

routes.post('/auth/register', authController.store);
routes.get('/auth/list', authController.index);
routes.put('/auth/:id/update', authController.update);
routes.delete('/auth/:id/remove', authController.remove);
routes.post('/auth/forgot_password', authController.forgotPass);
routes.post('/auth/reset_password/:token', authController.resetPass);

routes.post('/articles', articleController.store);
routes.put('/articles/:id/update', articleController.update);
routes.delete('/articles/:id/remove', articleController.remove);
routes.get('/articles/:id/view', articleController.view);

module.exports = routes;