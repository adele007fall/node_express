// 기본 모듈
const express = require('express');
const http = require('http');
const path = require('path'); 

// 미들웨어 모듈
const static = require('serve-static');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const errorHandler = require('errorhandler');
// 오류 핸들러 모듈
const expressErrorHandler = require('express-error-handler');
// session 미들웨어 모듈
const Session = require('express-session');
// 설정을 위한 config 파일과 데이터베이스, 라우트 모듈
const config = require('./config');
const database_loader = require('./database/database_loader');
const route_loader = require('./route/route_loader');

// 기본속성 설정
const app = express();
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
    Session({
        secret: 'my key',
        resave: 'true',
        saveUninitialized: 'true'
    })
);
// public folder 를 static으로 오픈
app.use('/',static(path.join(__dirname, 'public')));

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname, '/index.html'));
})
route_loader.init(app, express.Router()); 

const errorHandlers = expressErrorHandler({
    static: {
        '404': path.join(__dirname, '/404.html')
    }
});
app.use(expressErrorHandler.httpError(404));
app.use(errorHandlers);

http.createServer(app).listen(app.get('port'), () => {
    database_loader.init(app, config);
});