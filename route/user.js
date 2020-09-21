var login = function (req, res) {
    console.log('/process/login 이 호출됩니다.');
    var paramID = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var database = req.app.get('database');

    if (database) {
        authUser(database, paramID, paramPassword, function (err, result) {
            if (err) {
                console.log('login error')
                res.writeHead(200, { "Content-Type": "text/html; charset=utf8" })
                res.write(`<h1>login error</h1>`)
                res.end();
                return;
            }
            if (result) {
                var username = result[0].name;
                res.writeHead('200', { "Content-Type": 'text/html; charset=utf8' });
                res.write(`<h1>${username}님 반갑습니다.</h1>`)
                res.write(`<a href="/public/login.html">retry</a>`)
                res.end();
            } else {
                res.writeHead('200', { 'Content-Type': 'text/html; charset=utf8' });
                res.write(`<h1>로그인 실패</h1>`)
                res.write(`<p>아이디와 비밀번호를 확인해주세요.</p>`)
                res.write(`<a href="/login.html">retry</a>`)
                res.end();
            }
        })
    } else {
        res.writeHead('404', { 'Content-Type': 'text/html; charset=utf8' });
        res.write(`<h2>정보조회실패</h2>`)
        res.write(`<p>데이터 베이스에 연결하지 못하였습니다.</p>`)
        res.end();
    }
}
var adduser = function (req, res) {
    console.log('/process/adduser 이 호출됩니다.');
    var paramID = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var name = req.body.name || req.query.name;
    var database = req.app.get('database');

    if (database) {
        addUser(database, paramID, paramPassword, name, function (err, add) {
            if (err) {
                console.log('에러 발생')
                res.writeHead(200, { "Content-Type": "text/html; charset=utf8" })
                res.write(`<h1>에러 발생</h1>`)
                res.end();
                return;
            }
            if (add) {
                console.dir(add);
                res.writeHead('200', { "Content-Type": 'text/html; charset=utf8' });
                res.write(`<h1>사용자가 추가 되었습니다.</h1>`)
                res.write(`<p>${name}</p>`)
                res.end();
            } else {
                res.writeHead('200', { "Content-Type": 'text/html; charset=utf8' });
                res.write(`<h1>사용자 추가 실패</h1>`)
                res.end();
            }
        })
    } else {
        res.writeHead('404', { 'Content-Type': 'text/html; charset=utf8' });
        res.write(`<h2>정보조회실패</h2>`)
        res.write(`<p>데이터 베이스에 연결하지 못하였습니다.</p>`)
        res.end();
    }
};
var authUser = function (database, id, password, callback) {
    console.log(`authUser 호출`);
    // var database = req.app.get('database');
    database.UserModel.findById(id, function (err, results) {
        if (err) {
            callback(err, null);
            console.log("찾는 id가 없습니다");
            return;
        }
        console.log('아이디로 검색');
        if (results.length > 0) {
            var user = new database.UserModel({ id: id });
            var authenticated = user.authenticate(password, results[0]._doc.salt, results[0]._doc.hashed_password);
            if (authenticated) {
                console.log('비밀번호가 일치합니다.')
                callback(null, results);
            } else {
                console.log('비밀번호가 일치하지 않습니다.')
                callback(null, null);
            }
        } else {
            console.log('아이디 일치하는 사용자가 없습니다.')
            callback(null, null);
        };
    })
}

var addUser = function (database, id, password, name, callback) {
    console.log(`addUser 호출`)

    var user = new database.UserModel({ "id": id, "password": password, "name": name });
    user.save((err) => {
        if (err) {
            callback(err, null);
            return;
        }
        console.log('사용자 데이터 추가')
        callback(null, user);
    });
}

var userlist = function (req, res) {
    console.log('/process/userlist 이 호출됩니다.')
    var database = req.app.get('database');
    if (database) {
        database.UserModel.findAll(function (err, list) {
            if (err) {
                console.log('에러 발생')
                res.writeHead(200, { "Content-Type": "text/html; charset=utf8" });
                res.write(`<h1>에러 발생</h1>`)
                res.end();
                return;
            }
            if (list) {
                console.dir(list);
                res.writeHead(200, { "Content-Type": "text/html; charset=utf8" });
                res.write(`<h2>사용자 리스트</h2>`)
                res.write(`<div><ul>`)

                for (var i = 0; i < list.length; i++) {
                    var curId = list[i]._doc.id;
                    var curName = list[i]._doc.name;
                    res.write(`<li> #${i} -> ${curId}, ${curName} </li>`)
                }

                res.write('</ul></div>')
                res.end();
            } else {
                res.writeHead('200', { "Content-Type": 'text/html; charset=utf8' });
                res.write(`<h1>사용자 조회 실패</h1>`)
                res.end();
            }
        })
    } else {
        res.writeHead('404', { 'Content-Type': 'text/html; charset=utf8' });
        res.write(`<h2>정보조회실패</h2>`)
        res.write(`<p>데이터 베이스에 연결하지 못하였습니다.</p>`)
        res.end();
    }
};
module.exports.userlist = userlist;
module.exports.login = login;
module.exports.adduser = adduser;

