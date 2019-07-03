const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const User = require('../models/user');
const authConfig = require('../../config/auth');
const mailer = require('../../modules/mailer');

function generateToken(params = {}){
	return jwt.sign(params, authConfig.secret, {
		expiresIn: 86400,
	});
}

module.exports = {

	async index(req, res){
		try{

			const users = await User.find();
			
			return res.send(users);

		}catch(err){

			return res.status(501).send({error: err});

		}
	},

	async store(req, res){

		const { email } = req.body;

		try{

			const authUser = await User.findOne({ _id: req.userId });

			if(authUser.nivel !== 1)
				return res.status(401).send({ error: 'Unauthorized' });

			if(await User.findOne({ email }))
				return res.status(400).send({ error: "User already exists"});

			const user = await User.create(req.body);

			user.password = undefined;

			return res.send({ 
				user,
				token: generateToken({id: user.id}),
			});

		}catch(err){
			console.log(err);
			return res.status(400).send({ error: 'Registration failed' });
		
		}
	},

	async login(req, res) {
		const { email, password } = req.body;

		const user = await User.findOne({ email }).select('+password');

		if(!user)
			return res.status(400).send({ error: 'User not found' });

		if(!await bcrypt.compare(password, user.password))
			return res.status(400).send({ error: 'Invalid password' });

		user.password = undefined;

		return res.send({
			user, 
			token: generateToken({id: user.id}),
		});

	},

	async update(req, res){

		try{

			const authUser = await User.findOne({ _id: req.userId });

			if(authUser._id != req.params.id)
				return res.status(401).send({ error: 'Unauthorized' });

			const user = await User.findOne({_id: req.params.id}).select('+password');

			if(!await bcrypt.compare(req.body.password, user.password))
				return res.status(401).send({error:'Invalid password'});

			if(req.body.new_password){
				if(req.body.confirm_password !== req.body.new_password)
					return res.status(400).send({error:'Confirm password invalid'});
				else
					req.body.password = await bcrypt.hash(req.body.new_password, 10);
			}else{

				req.body.password = await bcrypt.hash(req.body.password, 10);
				
			}

			User.findOneAndUpdate({_id: req.params.id}, req.body, function(err, user){
				if(err)
					return res.status(501).send({ error: 'Update error' });

				return res.send(user);

			});
			
		}catch(err){

			return res.status(400).send({error: err});

		}
	},

	async remove(req, res){

		try{

			const authUser = await User.findOne({ _id: req.userId });
			const user = await User.findOne({ _id: req.params.id });


			if(authUser.nivel !== 1 && authUser._id != req.params.id)
				return res.status(401).send({ error: 'Unauthorized' });

			if(user.nivel === 1 && authUser._id != req.params.id)
				return res.status(401).send({ error: 'Unauthorized' });

			User.findOneAndRemove({_id: req.params.id}, (err, userRemoved) => {
				if(err)
					return res.status(501).send({error: 'Remove user failed'});
				
				return res.send(userRemoved);
			});

		}catch(err){
			console.log(err);
			return res.status(400).send({error: 'Remove user error'});

		}
	},

	async forgotPass(req, res){

		const { email } = req.body;

		try{
		
			const user = await User.findOne({ email });

			if(!user)
				return res.status(400).send({ error: 'User not found' });

			const token = crypto.randomBytes(20).toString('hex');

			const now = new Date();
			now.setHours(now.getHours() + 1);

			await User.findByIdAndUpdate(user._id, {
				'$set': {
					passwordResetToken: token,
					passwordResetExpires: now,
				}
			});

			console.log(token);

			mailer.sendMail({
				to: email,
				from: 'alexsander@gmail.com',
				subject: 'Alterar senha',
				template: 'auth/forgot_password',
				context: { token },
			}, (err) => {
				if(err){
					console.log(err);
					return res.status(400).send({ error: 'Cannot send forgot password email' });
				}

				return res.send();
			});

		}catch(err){
			console.log(err);
			res.status(400).send({ error: 'Error forgot password, try again' });

		}

	},

	async resetPass(req, res){

		const { email, new_password, confirm_new_password } = req.body;
		const token = req.params.token;

		try{

			const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires');

			if(!user)
				return res.status(400).send({ error: 'User not found' });

			if(token !== user.passwordResetToken)
				return res.status(400).send({ error: 'Invalid token' });

			const now = new Date();

			if(now > user.passwordResetExpires)
				return res.status(400).send({ error: 'Token expired' });

			if(new_password !== confirm_new_password)
				return res.status(400).send({ error: 'Confirm password error' });

			user.password = new_password;

			await user.save();

			return res.send();

		}catch(err){

			return res.status(400).send({error: 'Cannot reset password, try again'});

		}
	}

}