 
var express = require('express');
var http = require('http'); 
var path = require('path');
var static = require('serve-static'); 
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var expressErrorHandler = require('express-error-handler'); 

var app = express();

app.set('port', process.env.PORT || 3500);
app.use('/uploads', static(path.join(__dirname, 'uploads')));
app.use(static (path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended:false})); 
app.use(bodyParser.json());  

app.use(cookieParser()); 
app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
})); 

var router = express.Router();
app.use('/', router);

app.use('/',(req,res,next)=>{

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;

    res.writeHead('200',{'content-Type': 'text/html;charset=utf8'})
    res.write('<h1>express server response is</h1>');
    res.write(`<div><p> ${paramId} </p></div>`);
    res.write(`<div><p> ${paramPassword} <p></div>`);
    res.end();
})
 
http.createServer(app).listen(3500)