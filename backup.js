// 기본 모듈
var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
// 미들웨어 모듈
var static = require('serve-static');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
// 오류 핸들러 모듈
var expressErrorHandler = require('express-error-handler');
// session 미들웨어 모듈
var expressSession = require('express-session');
// 설정을 위한 config 파일과 데이터베이스, 라우트 모듈
var config = require('./config');
var database_loader = require('./database/database_loader');
var route_loader = require('./route/route_loader');

// 기본속성 설정
var app = express();
// Body Parser 이용 x-www-form-urlencoded parsing
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
// 포트넘버를 config 파일에서 정의한 포트넘버로 설정
app.set('port', config.server_port || 3500);
// cookie-parser
app.use(cookieParser());
// session option
app.use(
    expressSession({
        secret: 'my key',
        resave: 'true',
        saveUninitialized: 'true'
    })
);
// public folder 를 static으로 오픈
app.use('/public',static(path.join(__dirname, 'public')));
// const user = require('./route/user');
route_loader.init(app, express.Router());
// Router 객체 참조
// var router = express.Router();

var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});
app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

http.createServer(app).listen(app.get('port'), () => {
    database_loader.init(app, config);
});