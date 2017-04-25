var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var expressWs = require('express-ws')(app);
var http = require('http').Server(app);
var io = require('socket.io')(http);

global.msocket = null;

io.on('connection', function (socket) {
    var _socket = socket;
    global.msocket = socket;
    setTimeout(function () {
        //socket.emit('news', { hello: 'world1232323' });
    },1000)
    socket.on('echo', function (data) {
        console.log(data);
    });
});
var index = require('./routes/index');
var users = require('./routes/users');
var upload = require('./routes/upload');
var ws = require('./routes/ws-stuff');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
var ejs = require('ejs');
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/upload', upload);
app.use("/ws-stuff", ws);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.set('port', process.env.PORT || 80);

var server = http.listen(app.get('port'), function () {
    console.log('start at port:' + server.address().port);
});
module.exports = app;
