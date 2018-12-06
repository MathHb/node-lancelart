//Requerimentos: Express e Postgre
const express = require('express'),
path = require('path'),
pool = require('../db'),
Router = require('express-promise-router'),
fs = require('fs');
var router = new Router();
module.exports = router;

//biografia


//pagina home
router.get('/', function(req, ress){
	
	//Comandos pg
	const setImg = {
		name: 'set-img',
		text: 'SELECT id FROM public.artista ORDER BY id ASC',
		rowMode: 'array'
	}

	var txt = ''
	
	pool.query(setImg, (err, res)=>{
		//resultado do query
		//console.log(err.stack)
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
				bigTxt += '<div style="display:inline-block;"> <a href="/userpage/'+imgs[x]+'"> <img src="../img/'+imgs[x]+'/'+files[0]+'" width = "200" height="200"><div >  </img> </a> </div>'
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
	console.log(req.session)
	if(req.session.key == ''){
		res.redirect('/userarea')
	}else{
		res.render('pages/cadastro', {message: ""})
	}
});

//sair da conta atual
router.get('/logout', function(req,res){
	req.session.nome = ''
	req.session.key = ''
	req.session.email = ''
	req.session.ctp = ''
	res.redirect('/')
});

//pagina da area do usuario
router.get('/userarea/', function(req,res){	

	if(!req.session.key){
		res.redirect('/login')
	}

	if(req.session.ctp == true){
		var txtpull = {
			name: 'txt-pull',
			text: 'SELECT info FROM public.contratador WHERE id = $1',
			values:[req.session.key],
			rowMode: 'array'
		}
	}else{
		var txtpull = {
			name: 'bio-pull',
			text: 'SELECT biografia, redsoc FROM public.artista WHERE id = $1',
			values:[req.session.key],
		}
	}

	//variavel de mensagem
	var t, txt, pwd
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
	//console.log(newPath)
	var imgs = fs.readdirSync(newPath)
	var imhtml = ''
	imgs.splice(-1, 1)
	//console.log(imgs)
	for(var i = 0; i < imgs.length; i++){
		imhtml += ' <div> <img src="../img/'+ req.session.key +'/'+imgs[i]+'" height="200" width="200"><form action="/delete/'+imgs[i]+'" method= "POST"><button type="submit"><div class = "delb"></div></button></form></img></div>'
	}

	var areapull = {
		name: 'area-pull',
		text: 'SELECT area FROM public.usuario WHERE id = $1',
		values:[req.session.key],
		rowMode: 'array'
	}

	pool.query(areapull, (err4, ress) => {

		var area = ress.rows[0]

		pool.query(txtpull, (req1, res1) => {
			txt = res1.rows[0]
			var pwdpull = {
				name: 'pwd-pull',
				text: 'SELECT senha FROM public.usuario WHERE id = $1',
				values:[req.session.key],
				rowMode: 'array'
			}

			pool.query(pwdpull, (req2, res2) => {
				pwd = res2.rows[0]

				if(req.session.ctp){
					var orgpull = {
						name: 'org-ppull',
						text: 'SELECT email, telefone, local, nome FROM public.organizacao WHERE usuario = $1',
						values: [req.session.key]
					}
					pool.query(orgpull, (err3, res3) => {
						if(err3){console.log(err3.stack)}


							var pedpull = {
								name: 'ped-pull',
								text: 'SELECT texto, id FROM public.pedido WHERE organizacao = $1',
								values: [req.session.key],
								rowMode: 'array'
							}
							pool.query(pedpull, (err4, res4) => {
								var email = res3.rows[0].email
								var telefone = res3.rows[0].telefone
								var local = res3.rows[0].local
								var nome = res3.rows[0].nome
								var pedlista = ''
								var txt = res1.rows[0]
								if(err4){console.log(err4.stack)}
									for (var i = 0; i < res4.rows.length; i++){
										pedlista += '<div class="delbt"><textarea class="pedtxt" rows="5">'+ res4.rows[i][0] +'</textarea> <a href="/userpage/delped/'+res4.rows[i][1]+'"><button type="button" class="delb"></button></a></div>'
									}
									res.render('pages/userarea', {email: req.session.email,nome: req.session.nome, message: t, tex: txt, pwd: pwd, tp: req.session.ctp, orgmail: email, orgtel: telefone, orgloc: local, orgloc: local, orgnome: nome, area: area, pedlista: pedlista})

								})
						})
				}else{

					var newPath = path.dirname(__dirname) + "/public/img/"+req.session.key+"/";
					var searchimg = fs.readdirSync(newPath);
					var trabpull = {
						name:'trabpll',
						text:'SELECT id, texto  FROM public.trabalhos WHERE usuario = $1 ORDER BY id ASC',
						values: [req.session.key],
						rowMode: 'array'
					}
					var txt = res1.rows[0]
					pool.query(trabpull, (errt, rest) =>{
						if(errt){console.log(errt.stack)}
							var textrab = rest.rows
						res.render('pages/userarea',{email: req.session.email,nome: req.session.nome, message: t, tex: txt, pwd: pwd, tp: req.session.ctp, area: area, trabtex: textrab, redsoc:res1.rows[0].redsoc})

					})
				}
			})
		})

	})
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
		text: 'SELECT nome, contatp FROM public.usuario WHERE id = $1',
		values: [req.params.idd]
	}
	pool.query(userpg, (err,res) => {
		var imhtml = ''
		nome = res.rows[0].nome
		if(res.rows[0].contatp == true){
			var contdisplay = {
				name: 'cont-display',
				text: 'SELECT info, organizacao FROM public.contratador WHERE id = $1',
				values: [req.params.idd]
			}
			pool.query(contdisplay, (err,res1) =>{
				info = res1.rows[0].info

				var orgpull = {
					name: 'org-ppull',
					text: 'SELECT email, telefone, local, nome FROM public.organizacao WHERE usuario = $1',
					values: [req.params.idd],
				}
				pool.query(orgpull, (err, res2) =>{
					var email = res2.rows[0].email
					var telefone = res2.rows[0].telefone
					var local = res2.rows[0].local
					var nome = res2.rows[0].nome
					ress.render("pages/userpage",{nome: res.rows[0].nome , texto: info , ctp: res.rows[0].contatp, orgmail: email, orgtel: telefone, orgloc: local, orgloc: local, orgnome: nome})	
				})

				

			})
		}else{
			var artisdisplay = {
				name: 'artis-display',
				text: 'SELECT biografia, redsoc FROM public.contratador WHERE id = $1',
				values: [req.params.idd]
			}


			var fpath = path.dirname(__dirname)+'/public/img/'+req.params.idd+"/trab1/"
			imgs = fs.readdirSync(fpath)
			for(var i = 0; i < imgs.length; i++){
				if(imgs[i] == "thumbs")
					{}else{
						imhtml += '<img src="../img/'+req.params.idd+'/trab1/'+imgs[i]+'" width="400" height="400" ><img>'
					}
				}

				pool.query(artisdisplay, (err3, res3)=>{

				ress.render("pages/userpage",{nome: res.rows[0].nome , texto:res3.rows[0].biografia , ctp: res.rows[0].contatp, redsoc:redsoc})	

				})
			

			}
		})
})

router.get('/userpage/delped/:idd', function(req,res){
	var delped = {
		name: 'del-ped',
		text: 'DELETE FROM public.pedido WHERE id = $1',
		values: [req.params.idd]
	}
	pool.query(delped, (err, ress) => {
		res.redirect('/userarea')
	}
	)
})

router.get('/pedidos', function(req,res){
	var pedidoall = {
		name: 'pedido-al',
		text: 'SELECT texto, organizacao FROM public.pedido',
	}

	var listaped = ''

	pool.query(pedidoall, (err, res1) =>{
		for (var i = 0; i < res1.rows.length; i++){
			if(err){console.log(err.stack)}
				listaped += '<div class="delbt"><label class="pedtxt">'+ res1.rows[i].texto +'</label> <a href="/orgreduser/'+res1.rows[i].organizacao+'"><button type="button" class="sitebtn">Visitar Usuario</button></a></div>'

		}

		res.render('pages/pedidos', {pedlista: listaped})
	})

})

router.get('/orgreduser/:idd', function(req,res){
	var orgreduser = {
		name: 'org-redir-user',
		text: 'SELECT id FROM public.contratador WHERE id = $1',
		values: [req.params.idd],
		rowMode: 'array'
	}

	pool.query(orgreduser, (err,res1) =>{
		if(err){console.log(err.stack)}
			res.redirect('/userpage/'+res1.rows[0])
	})
})

//comando POST para cadastro
router.post('/cadastro', function(req, ress) {


	areas = req.body.area
	

	var text 
	var values = [req.body.nome, req.body.email, req.body.login, req.body.senha, req.body.area, req.body.contaTp]
	var senha2 = req.body.senha2

	if (req.body.contaTp == true){

		text = 'INSERT INTO public.contratador(nome, email, login, senha, area, contatp) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *'
	}else{
		text = 'INSERT INTO public.artista(nome, email, login, senha, area, contatp) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *'
	}

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
					if (req.body.contaTp == true){
						var orgmk = {
							name: 'org-make',
							text: 'INSERT INTO public.organizacao (usuario) VALUES ($1)',
							values:[res.rows[0].id]

						}
						pool.query(orgmk)
					}else{
						var dirpath = path.dirname(__dirname) + '/public/img/' + res.rows[0].id.toString()+ '/trab' 
						
						for(var i = 0; i < 5; i++){
							fs.mkdirSync(dirpath+i)	
						}
						
						
						var trabmk = {
							name: 'trab-make',
							text: 'INSERT INTO public.trabalhos (usuario) VALUES ($1)',
							values:[res.rows[0].id]
						}

						for(var i = 0; i <5; i++){
							pool.query(trabmk, (err, res)=>{
								if(err){console.log(err.stack)}
							})
						}
					}


				}
			})
	}
	
});

//comando POST para login
router.post('/login', function(req, ress){
	var findUser = {
		name:'find-user',
		text:'SELECT id, nome, email, senha, contatp FROM public.usuario WHERE login = $1 AND senha = $2',
		values: [req.body.login, req.body.senha],
	}
	pool.query(findUser, (err,res) =>{
		if (err){
			console.log(err.stack)
		}
		if(res.rows[0] == undefined){//aehoo
			ress.render('pages/login', {message:"Login ou senha não consta no banco de dados"})
		}else{
			req.session.key = res.rows[0].id
			req.session.nome = res.rows[0].nome.trim()
			req.session.email = res.rows[0].email
			req.session.ctp = res.rows[0].contatp
			//console.log(req.session)
			ress.redirect('/userarea/')
		}
	})
});

//comando POST para atualizar biografia
router.post('/texto', function(req,ress){

	if(req.session.ctp == true){
		var altBio = {
			name: 'alt-bio',
			text: 'UPDATE public.contratador SET info = $1 WHERE id = $2',
			values: [req.body.texto.toString(), req.session.key],

		} 
	}else{
		var altBio = {
			name: 'alt-bio',
			text: 'UPDATE public.artista SET biografia = $1 WHERE id = $2',
			values: [req.body.texto.toString(), req.session.key],

		} 	
	}
	
	pool.query(altBio, (err, res) => {
		if(err){
			console.log(err.stack)
		}
		ress.redirect('/userarea')
	})
});

router.post('/userarea/edit', function(req,ress){

	var chData = {
		text:'UPDATE public.usuario SET nome = $1, senha = $2, email = $3, area = $5 WHERE id = $4',
		values: [req.body.nomeEd, req.body.senhaEd ,req.body.emailEd , req.session.key, req.session.area]
	}
	
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

router.post('/orgdata', function (req,res){
	var orgdata = 
	{
		name: 'org-data',
		text:'UPDATE public.organizacao SET email = $1, telefone = $2, local = $3, nome = $4 WHERE usuario = $5',
		values: [req.body.orgmail, req.body.orgtel, req.body.orgloc, req.body.orgnome, req.session.key],
		rowMode: 'array',
	}

	pool.query(orgdata, (err, res1) => {
		if(err){
			console.log(err.stack)
		}else{
			res.redirect('/userarea')
		}
	})

	
})

router.post('/novopedido', function(req,res){
	var nvped = {
		name: 'nv-ped',
		text: 'INSERT INTO public.pedido (texto, organizacao) VALUES ($1, $2)',
		values: [req.body.pedtexto, req.session.key]
	}

	pool.query(nvped, (err, ress) => {
		if(err){console.log(err.stack)}else{
			res.redirect('/userarea')
		}
	})
})

router.post('/userpage/trabup/:idd', function(req,res){

	var newPath = path.dirname(__dirname) + "/public/img/" + req.session.key +"/trab"+req.params.idd+"/";
	var flag
	flag =  fs.readdirSync(newPath) 	
	if(req.files.image == undefined){
		req.session.flag = 6
		res.redirect('/userarea') 
	}	
	if(flag.length < 5){
			console.log(req.files)
			console.log(req.files.trabinpt0)
			fs.readFile(req.files.trabpinpt0.file, function (err, data) {
			//req.files.image.filename = "img"+flag+path.extname(req.files.image.filename)
			var imageName = req.files.trabpinpt0.filename
			if(!imageName){
				req.session.flag = 3
				res.redirect("/userarea");
			} else {
				savedFile = newPath+imageName
				fs.writeFileSync(savedFile, data, function (err) {
					res.end()
				})}
				var trabloc = {
					name: 'trabloc',
					text: 'SELECT id from public.trabalhos WHERE usuario = $1 ORDER BY id ASC',
					values: [req.session.key],
					rowMode: 'array'
				}
				pool.query(trabloc, (err1,res1) =>{
					if(err1){console.log(err1.stack)}
					var savePath = {
						name: 'save-path',
						text: 'INSERT INTO public.imagem(path, trabalho) VALUES ($1,$2)',
						values:[savedFile, res1.rows[req.params.idd]]
					}
					pool.query(savePath)
				})

     			//console.log(req.session.key)
     			res.redirect('/userarea');
     		});
	}else{
		req.session.flag = 4
		res.redirect('/userarea')
		res.end()
	}

})

router.post('/userpage/texch/:idd', function(req,res){

	var trabloc = {
		name: 'trabloc',
		text: 'SELECT id from public.trabalhos WHERE usuario = $1 ORDER BY id ASC',
		values: [req.session.key],
		rowMode: 'array'
	}
	pool.query(trabloc, (err, res1) =>{
		var trabtex = [req.body.trabte1, req.body.trabte2, req.body.trabte3, req.body.trabte4, req.body.trabte5]
		var trabfocus = parseInt(res1.rows[req.params.idd])
		console.log(res1.rows)
		var trabch = {
		name:'trab-change',
		text:'UPDATE public.trabalhos SET texto = $1 WHERE id = $2',
		values: [trabtex[req.params.idd], trabfocus]
		}
		console.log(trabch)
		pool.query(trabch, (err2, res2) =>{
			if(err2){
				console.log(err2.stack)
			}
			res.redirect('/userarea')
		})
	})
	

})
