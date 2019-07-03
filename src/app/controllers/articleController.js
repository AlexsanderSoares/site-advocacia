const Article = require('../models/article');
const User = require('../models/user');


module.exports = {

	async index(req, res){
		try{

			const articles = await Article.find();
			
			return res.send(articles);

		}catch(err){

			return res.status(501).send({error: err});

		}
	},

	async view(req, res){
		try{

			const article = await Article.findOne({where: { id: req.params.id }});
			
			return res.json(article);

		}catch(err){

			return res.status(501).send({error: err});

		}
	},

	async store(req, res){

		try{

			req.body.author = await User.findOne({ _id: req.userId });

			const article = await Article.create(req.body);

			if(!article)
				res.status(500).send({ error: 'Erro ao tentar criar artigo' });

			return res.send(article);

		}catch(err){

			return res.status(400).send({ error: err });
			
		}

	},


	async update(req, res){

		try{

			Article.findByIdAndUpdate(req.params.id, req.body, (err, article) => {
				if(err)
					return res.status(501).send({error: err});
				
				return res.send(article);
			});

		}catch(err){

			return res.status(400).send({error: err});

		}
	},

	async remove(req, res){

		try{

			Article.findByIdAndRemove(req.params.id, (err, article) => {
				if(err)
					return res.status(501).send({error: err});
				
				return res.send(article);
			});

		}catch(err){

			return res.status(400).send({error: err});

		}
	},

};

