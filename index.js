var express = require('express');
var http = require('http'); 
var path = require('path');
var static = require('serve-static'); 
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

var app = express();
app.set('port', process.env.PORT || 3000);
app.use(static (path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized:true
}))

app.use(bodyParser.urlencoded({extended:false})); 
app.use(bodyParser.json()); 

app.use('/',(req,res,next)=>{

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;

    res.writeHead('200',{'content-Type': 'text/html;charset=utf8'})
    res.write('<h1>express server response is</h1>');
    res.write(`<div><p> ${paramId} </p></div>`);
    res.write(`<div><p> ${paramPassword} <p></div>`);
    res.end();
})
http.createServer(app).listen(3000)