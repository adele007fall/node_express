
// 기본 모듈
var express = require('express');
var http = require('http'); 
var path = require('path');
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
app.set('port', process.env.PORT||3000);
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

// 몽고디비 모듈
var MongoClient = require('mongodb').MongoClient;
// 데이터 베이스 객체를 위한 변수
var database;
// 데이터 베이스에 연결하기
function connetDB(){
    var databaseUrl = 'mongodb://localhost:27017'
    MongoClient.connect(databaseUrl, {
        useNewUrlParser:true,
        useUnifiedTopology:true
    },(err, client) => {
        if (err) {
            console.log('DB 에러 발생!!')
            return
        } 
        console.log('DB에 성공적으로 연결되었습니다.'+ databaseUrl);
        var db = client.db("local");
        database = db;
    })
}
var authUser = function(database, id, password, callback){
    console.log(`authUser 호출`);
    var users = database.collection('users');
    users.find({"id": id, "password": password}).toArray(function(err,docs){
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
    })
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
// 라우터 객체 등록
app.use('/', router);

// app.post('/process/login', function(req,res){
//     console.log('login 호출');
//     var paramID = req.param('id');
//     var paramPassword = req.param('password');

//     if(database){
//         authUser(database, paramID, paramPassword, function(err, docs){
//             if(err){
//                 throw err;
//             }
//             if(docs){
//                 console.dir(docs);
//                 var username = docs[0].name;
//                 res.writeHead('200',{'content-type':'text/html; charset=utf8'}); 
//                 res.write(`<a href="/public/login.html">retry</a>`)
//                 res.end();
//             }else{
//                 res.writeHead('200',{'content-type':'text/html; charset=utf8'});
//                 res.write(`<h1>로그인 실패</h1>`)
//                 res.write(`<p>아이디와 비밀번호를 확인해주세요.</p>`)
//                 res.write(`<a href="/public/login.html">retry</a>`)
//                 res.end();
//             }
//         })
//     }else{
//         res.writeHead('200',{'content-type':'text/html; charset=utf8'});
//         res.write(`<h2>정보조회실패</h2>`)
//         res.write(`<p>데이터 베이스에 연결하지 못하였습니다.</p>`) 
//         res.end();
//     }
// });


http.createServer(app).listen(3500, ()=>{
    connetDB()
})