const mongoose = require('../../database');

const ArticleSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		maxLength: 200,
	}, 
	subtitle: {
		type: String,
		required: true,
		maxLength: 400,
	},
	author: {
		type: Object,
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
}, {
	timestamps: true,
});

const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;