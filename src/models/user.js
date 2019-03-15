const mogoose = require('../database');

const UserSchema = new mogoose.Schema({
	name: {
		type: String,
		require: true,
	},
	email: {
		type: String,
		unique: true,
		required: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: true,
		select: false,
	}
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const User = mogoose.model({'User', UserSchema});

module.exports = User;