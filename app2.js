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
// 기본속성 설정
var app = express();
app.set('port', process.env.PORT||3500);
// Body Parser 이용 x-www-form-urlencoded parsing 
app.use(bodyParser.urlencoded({extended:false})); 
app.use(bodyParser.json());  
// public folder 를 static으로 오픈
app.use('/public',static(path.join(__dirname, 'public')));
// cookie-parser 
app.use(cookieParser());
// session option
app.use(expressSession({
    secret: 'my key',
    resave: 'true',
    saveUninitialized: 'true'
}));
// var errorHandler = expressErrorHandler({
//     static: {
//         '404' : './public/404.html'
//     }
// });
// app.use(expressErrorHandler.httpError(404));
// app.use(errorHandler);

// mongoose 모듈
var mongoose = require('mongoose');
// 데이터 베이스 객체를 위한 변수
var database;
var UserSchma;
var UserModel;
// mongoose 사용하여 데이터 베이스에 연결하기
function connetDB(){
    var databaseUrl = 'mongodb://localhost:27017'

    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl);
    // connection 이란 객체는 내장되어있음
    database = mongoose.connection; 
    // 이벤트가 발생했을때 처리할 함수 
    database.on('open', ()=>{
        console.log('데이터베이스에 연결됨 : ' + databaseUrl)
        
        UserSchma = mongoose.Schema({
            id: String,
            name: String,
            password: String
        })
        console.log('userSchma 정의됨');
        UserModel = mongoose.model('users', UserSchma);
        console.log('userModel 정의됨');
    });
    database.on('disconnected',()=>{
        console.log('데이터베이스 연결 끊어졌습니다.')
    }); 
    database.on('error', console.error.bind(console, 'error 발생'))
}

var authUser = function(database, id, password, callback){
    console.log(`authUser 호출`);
    UserModel.find({'id': id,'password': password},function(err, docs){
        if(err){
            callback(err, null);
            return;
        }
        if(docs.length > 0){
            console.log(`${id} ${password}`, id, password);
            callback(null, docs);
        }else{
            console.log(`can't read`);
            callback(null,null);
        }
    });
}

var addUser = function(database, id, password, name, callback){
    console.log(`addUser 호출`)

    var user = new UserModel({"id":id, "password":password, "name":name});
    user.save((err)=>{
        if(err){
            callback(err,null);
            return;
        } 
        console.log('사용자 데이터 추가')
        callback(null, user);
    });
    // var users = database.collection('users');
    // users.insertMany(
    //     [{"id":id,"password":password,"name":name}],
    // function(err,res){
    //     if(err){
    //         callback(err,null);
    //         return;
    //     }
    //     if(res.insertedCount > 0){
    //         console.log('사용자가 추가되었습니다.'+ res.insertedCount);
    //         callback(null, res);
    //     }else{
    //         console.log(`추가된 문서 객체가 없습니다.`);
    //         callback(null, null); 
    //     } 
    // });
}

// Router 객체 참조
var router = express.Router();
// login route 함수 && 데이터베이스 정보 비교
router.route('/process/login').post(function(req,res){  
    console.log('/process/login 이 호출됩니다.');
    var paramID = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;

    if(database){
        authUser(database, paramID, paramPassword, function(err, docs){
            if(err){
                console.log('에러 발생')
                res.writeHead(200, {"Content-Type":"text/html; charset=utf8"})
                res.write(`<h1>에러 발생</h1>`)
                res.end();
                return;
            }
            if(docs){
                console.dir(docs);
                var username = docs[0].name;
                res.writeHead('200',{"Content-Type":'text/html; charset=utf8'});
                res.write(`<h1>${username}님 반갑습니다.</h1>`) 
                res.write(`<a href="/public/login.html">retry</a>`)
                res.end(); 
            }else{
                res.writeHead('200',{'Content-Type':'text/html; charset=utf8'});
                res.write(`<h1>로그인 실패</h1>`)
                res.write(`<p>아이디와 비밀번호를 확인해주세요.</p>`)
                res.write(`<a href="/public/login.html">retry</a>`)
                res.end(); 
            }
        })
    }else{
        res.writeHead('404',{'Content-Type':'text/html; charset=utf8'});
        res.write(`<h2>정보조회실패</h2>`)
        res.write(`<p>데이터 베이스에 연결하지 못하였습니다.</p>`) 
        res.end(); 
    }
}); 


router.route('/process/adduser').post(function(req,res){
    console.log('/process/adduser 이 호출됩니다.');
    var paramID = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var name = req.body.name || req.query.name;

    if(database){
        addUser(database, paramID, paramPassword, name, function(err,add){
            if(err){
                console.log('에러 발생')
                res.writeHead(200, {"Content-Type":"text/html; charset=utf8"})
                res.write(`<h1>에러 발생</h1>`)
                res.end();
                return;
            }
            if(add){
                console.dir(add);
                res.writeHead('200',{"Content-Type":'text/html; charset=utf8'});
                res.write(`<h1>사용자가 추가 되었습니다.</h1>`) 
                res.write(`<p>${name}</p>`)
                res.end();
            }else{ 
                res.writeHead('200',{"Content-Type":'text/html; charset=utf8'});
                res.write(`<h1>사용자 추가 실패</h1>`)  
                res.end(); 
            }
        })
    }else{
        res.writeHead('404',{'Content-Type':'text/html; charset=utf8'});
        res.write(`<h2>정보조회실패</h2>`)
        res.write(`<p>데이터 베이스에 연결하지 못하였습니다.</p>`) 
        res.end(); 
    }
});
// 라우터 객체 등록
app.use('/', router);
 

http.createServer(app).listen(3500, ()=>{
    connetDB()
})