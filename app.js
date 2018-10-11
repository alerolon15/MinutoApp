require('./global_functions');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('client-sessions');
const expressValidator = require('express-validator');
//const multer = require('multer');
const request = require('request');

const index = require('./routes/index');
const login = require('./routes/user/login');
const registrarse = require('./routes/user/registrarse');
const cambiarPassword = require('./routes/user/cambiarPassword');
const recuperar = require('./routes/user/recuperar');
const ABMusuarios = require('./routes/user/ABMusuarios');
const Importar = require('./routes/Archivos/Importar');
const Facturasjs = require('./routes/Facturas/Facturas');
const Clientesjs = require('./routes/Clientes/Clientes');
const APIClientes = require('./routes/Clientes/APIClientes');

const app = module.exports = express();

const io = require('socket.io')(80);
const Clienteio = io
  .of('/Cliente')
  .on('connection', function (socket) {
    socket.emit('cargados');
  });
emitir = (evento, msg) => {
  io.emit('cargados', msg)
};
// mongoose conexion
mongoose.connect('mongodb://localhost:27017/Minuto',{ useNewUrlParser: true, useCreateIndex:true });
mongoose.connection.on('error', function(err){
	console.log(' \x1b[41m%s\x1b[0m','Error al intentar conectar con MongoDB.', 'Mensaje: ' + err.message);
	process.exit();
});
// esta linea crea el usuario Administrador
const crear = require('./models/crearUsuarioAdmin');

//sesiones
app.use(session({
	cookieName: 'session',
	secret: 'h17hd87ahhd917793dgasdg6',
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 60 * 1000
}));

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');
app.use('/public', express.static('public'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', login);
app.use('/index', index);
app.use('/registrarse', registrarse);
app.use('/cambiarPassword', cambiarPassword);
app.use('/recuperar', recuperar);
app.use('/ABMusuarios', ABMusuarios);
app.use('/importar', Importar);
app.use('/Clientes', Clientesjs);
app.use('/Facturas', Facturasjs);
app.use('/APIClientes', APIClientes);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
