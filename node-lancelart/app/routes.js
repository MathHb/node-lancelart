//Requerimentos: Express e Postgre
const express = require('express'),
path = require('path'),
pool = require('../db'),
Router = require('express-promise-router'),
fs = require('fs');
var router = new Router();
module.exports = router;

//pagina home
router.get('/', function(req, ress){
	
	//Comandos pg
	const setImg = {
		name: 'set-img',
		text: 'SELECT id FROM public.usuario ORDER BY id ASC',
		rowMode: 'array'
	}
	 
	
	pool.query(setImg, (req, res)=>{
		//resultado do query
		var imgs = res.rows
		//console.log(imgs[0])
		//Texto html
		var bigTxt = ''
		//var data
		//pra cada conta, a imagem inicial
		for(var x = 0; x < imgs.length; x++){
			//Caminho pro FS da conta
			var newPath = path.dirname(__dirname) + "/public/img/"+imgs[x]+"/";
			newPath = newPath.replace(/\\/g,"/");
			//Ler os arquivos da pasta do usuario
			var files = fs.readdirSync(newPath)
			
			if(files.length <  2){

			}else{
				//Criação do texto
				bigTxt += '<img src="../img/'+imgs[x]+'/'+files[0]+'" width = "200" height="200"><div > <a href="/userpage/'+imgs[x]+'"> </a> </div> </img>'
			}
		}
		ress.render('pages/home', {bigTxt});
	})

	
});
//pagina 'sobre'
router.get('/about', function(req,res){
	res.render('pages/about')
});
//pagina cadastro
router.get('/cadastro', function(req,res){
	res.render('pages/cadastro', {message: ""})
});

//sair da conta atual
router.get('/logout', function(req,res){
	req.session.nome = ''
	req.session.key = ''
	req.session.texto = ''
	req.session.email = ''
	req.session.tp = ''
	res.redirect('/')
});

//pagina da area do usuario
router.get('/userarea/', function(req,res){	

	if(!req.session.key){
		res.redirect('/login')
	}

	if (req.session.tp){
		var tp = "Contratador"
	}else{
		var tp = "Artista"
	}
	//console.log(req.session)
	
	var t
	switch (req.session.flag){	
		case 1:
		t = 'Esse E-mail já está em uso'
		break;
		case 2:
		t = 'Esse nome já está em uso!'
		break;
		case 3:
		t = 'Parece que algo deu errado, tente novamente!'
		break;
		case 4:
		t= 'Limite de imagens excedido! (máximo de 5 imagens)'
		break;
		case 5:
		t= 'Editado com sucesso!'
		break;
		case 6:
		t= 'Escolha uma imagem antes!'
		break;
		case 7:
		t= 'Deletado com sucesso!'
		break;
		default:
		t = ''
		break;
	}
	delete req.session.flag
	var newPath = path.dirname(__dirname) + "/public/img/" + req.session.key +"/";
	newPath = newPath.replace(/\\/g,"/");
	console.log(newPath)
	var imgs = fs.readdirSync(newPath)
	var imhtml = ''
	imgs.splice(-1, 1)
	console.log(imgs)
	for(var i = 0; i < imgs.length; i++){
		imhtml += ' <div> <img src="../img/'+ req.session.key +'/'+imgs[i]+'" height="200" width="200"><form action="/delete/'+imgs[i]+'" method= "POST"><button type="submit"><div class = "delb"></div></button></form></img></div>'
	}
	res.render('pages/userarea',{tex:req.session.texto,email: req.session.email,nome: req.session.nome,tp,pwd: req.session.pwd.trim(), message: t, imhtml})
})

//pagina de login
router.get('/login', function(req,res){

	if (req.session.key) {
		res.redirect('/userarea')
	} else {
		res.render('pages/login', {message:""})

	}
});

router.get('/userpage/:idd', function(req,ress){
	
	var userpg = {
		name: 'userpge',
		text: 'SELECT nome, contatp, texto FROM public.usuario WHERE id = $1',
		values: [req.params.idd],
		rowMode: 'array'
	} 
	pool.query(userpg.text,userpg.values, (err,res) => {
		var imhtml = ''
		nome = res.rows[0].nome
		texto = res.rows[0].texto
		var tp, txtTp
		if (req.session.tp){
			tp = "Contratador"
			txtTp = "Sobre"
		}else{
			tp = "Artista"
			txtTp = "Bio"
		}
		var fpath = path.dirname(__dirname)+'/public/img/'+req.params.idd
		imgs = fs.readdirSync(fpath)
		for(var i = 0; i < imgs.length; i++){
			if(imgs[i] == "thumbs")
				{}else{
					imhtml += '<img src="../img/'+req.params.idd+'/'+imgs[i]+'" width="400" height="400" ><img>'
				}

			}
			console.log(imhtml)

			ress.render("pages/userpage",{nome:nome , texto:texto , tp: tp, txttp: txtTp, img:imhtml})
		})
})

//comando POST para cadastro
router.post('/cadastro', function(req, ress) {

	var text = 'INSERT INTO public.usuario(nome, email, login, senha, contatp) VALUES\
	($1, $2, $3, $4, $5) RETURNING *'
	var values = [req.body.nome, req.body.email, req.body.login, req.body.senha, req.body.contaTp]
	var senha2 = req.body.senha2

	if (values[3].toString() != senha2.toString()) { 
		ress.render('pages/cadastro', {message: "Suas senhas estão diferentes!"})
	}else 
	{
		pool.query(text, values, (err, res) => {
			if (err) 
			{
				console.log(err.stack)
				if (err.stack.toString().search('usuario_email_UN') > 0){
					ress.render('pages/cadastro', {message: "Email duplicado!"})
				} else if (err.stack.toString().search('usuario_login_UN') > 0) {
					ress.render('pages/cadastro', {message: "Esse login já é usado!"})

				} else if (err.stack.toString().search('usuario_nome_UN') > 0) {
					ress.render('pages/cadastro', {message: "Esse nome de usuário já existe!"})
				}
				else {
					ress.render('pages/cadastro', {message: "Algo deu errado! Por favor, tente novamente."})
				}
			} else {
					//console.log(res.rows[0])
					ress.render('pages/cadastro', {message:"Dados cadastrados, você já pode fazer login!"})
					fs.mkdirSync(path.dirname(__dirname) + '/public/img/' + res.rows[0].id.toString())
					fs.mkdirSync(path.dirname(__dirname) + '/public/img/' + res.rows[0].id.toString()+ '/thumbs')

				}
			})
	}
});

//comando POST para login
router.post('/login', function(req, ress){
	var findUser = {
		name:'find-user',
		text:'SELECT login, senha, texto, email, id, nome, contatp FROM public.usuario WHERE login = $1 AND senha = $2',
		values: [req.body.login, req.body.senha],
	}
	pool.query(findUser, (err,res) =>{
		if(res.rows[0] == undefined){//aehoo
			ress.render('pages/login', {message:"Login ou senha não consta no banco de dados"})
		}else{
			
			req.session.key = res.rows[0].id
			req.session.nome = res.rows[0].nome.trim()
			req.session.tp = res.rows[0].contatp
			req.session.email = res.rows[0].email
			req.session.texto = res.rows[0].texto
			req.session.pwd = res.rows[0].senha
			//console.log(req.session)
			ress.redirect('/userarea/')
		}
	})
});

//comando POST para atualizar biografia
router.post('/biografia', function(req,ress){

	var altBio = {
		name: 'alt-bio',
		text: 'UPDATE public.usuario SET texto = $1 WHERE id = $2',
		values: [req.body.texto.toString(), req.session.key],
		rowMode: 'array'
	} 
	pool.query(altBio, (err, res) => {
		if(err){
			console.log(err.stack)
		}
		req.session.texto = req.body.texto.toString()
		//console.log(req.session.key)
		ress.redirect('/userarea')
	})
});


router.post('/upload', function(req, res) {
	var newPath = path.dirname(__dirname) + "/public/img/" + req.session.key +"/";
	var flag
	flag =  fs.readdirSync(newPath)
	if(req.files.image == undefined){
		req.session.flag = 6
		res.redirect('/userarea')  
	}	

	if(flag.length < 5){
		fs.readFile(req.files.image.file, function (err, data) {
			//req.files.image.filename = "img"+flag+path.extname(req.files.image.filename)
			var imageName = req.files.image.filename
			if(!imageName){
				req.session.flag = 3
				res.redirect("/userarea");
			} else {
     			//console.log(newPath)
     			fs.writeFile(newPath+imageName, data, function (err) {
     				res.end()
     			})}
     			console.log(req.session.key)
     			res.redirect('/userarea');
     		});
	}else{
		req.session.flag = 4
		res.redirect('/userarea')
		res.end()
	}
});

router.post('/userarea/edit', function(req,ress){

	var chData = {
		text:'UPDATE public.usuario SET nome = $1, senha = $2, email = $3 WHERE id = $4',
		values: [req.body.nomeEd, req.body.senhaEd ,req.body.emailEd , req.session.key]
	}
	var nome = req.session.nome
	var tex = req.session.texto
	var email = req.session.email
	if (req.session.tp){
		var tp = "Contratador"
	}else{
		var tp = "Artista"
	}
	var pwd = req.session.pwd
	
	pool.query(chData, (err,res)=>{
		if(err){
			console.log(err.stack)
			if (err.stack.toString().search('usuario_email_UN') > 0){
				req.session.flag = 1
			} else if (err.stack.toString().search('usuario_nome_UN') > 0) {
				req.session.flag = 2
			}else{
				req.session.flag = 3
			}
		}else{
			req.session.nome = req.body.nomeEd
			req.session.pwd = req.body.senhaEd
			req.session.email = req.body.emailEd
			req.session.flag = 5
		}
		ress.redirect('/userarea')

	})
})

router.post('/delete/:flnm', function (req,res){
	var delIt = req.params.flnm
	var newPath = path.dirname(__dirname) + "/public/img/" + req.session.key +"/" + delIt
	fs.unlinkSync(newPath)
	req.session.flag = 7
	res.redirect('/userarea')
})

