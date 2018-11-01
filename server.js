//Dependencias
var pg = require('./db'),
	expressLayouts = require('express-ejs-layouts'),
	ejs = require('ejs'),
	express = require('express'),
	bb = require('express-busboy'),
	auth = require('./auth'),
	cookieParser = require('cookie-parser'),
	session = require('express-session')
    //flash = require('express-flash');


//Usar o express, variável de porta e inicialização de sessão(ambiente de desenvolvimento)
var	app = express();
var port = process.env.PORT || 8080;
var sessionStore = new session.MemoryStore;


//Usar EJS
app.set('view engine', 'ejs');
app.use(expressLayouts);

//Usar busboy
bb.extend(app, {

    upload: true,
    allowedPath: /./

});

//Criar sessão
app.use(cookieParser('secret'));
app.use(session({
    cookie: { maxAge: 60000000 },
    store: sessionStore,
    saveUninitialized: true,
    resave: true,
    secret: 'secret',
    key: '', //id
    nome: '', //nome
    email: '', //email
    ctp: '', //tipo de conta
    flag:''
}));
//app.use(flash())

//Rotear o App
var router = require('./app/routes');
app.use('/', router);
//app.use('/auth', router)

//Encontrar arquivos estáticos
app.use(express.static(__dirname + '/public'));


//iniciar o servidor
app.listen(port, function(){
	console.log('App iniciado na porta 8080');
});
