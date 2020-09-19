const database = {};
const mongoose = require("mongoose");

database.init = function (app, config) {
    console.log('init 호출');
    connect(app, config);
};
function connect(app, config) {
    console.log('connect called');
    mongoose.Promise = global.Promise;
    mongoose.connect(config.db_url, { useNewUrlParser: true });
    // connection 이란 객체는 내장되어있음
    database.db = mongoose.connection;
    // 이벤트가 발생했을때 처리할 함수 
    database.db.on('open', function () {
        // console.log('데이터베이스에 연결됨 : ' + db_url)
        createSchema(app, config);

    });
    database.db.on('disconnected', () => {
        console.log('데이터베이스 연결 끊어졌습니다. 5초 뒤 연결시도합니다.');
        setInterval(connectDB, 5000);
    });
    database.db.on('error', console.error.bind(console, 'error 발생'));

}
function createSchema(app, config) {
    var confLen = config.db_schemas.length;
    console.log('config 파일의 스키마수' + confLen);
    for (var i = 0; i < confLen; i++) {
        var curItem = config.db_schemas[i];
        var curSchema = require(curItem.file).createSchema(mongoose);
        var curModel = mongoose.model(curItem.collection, curSchema);
        database[curItem.schemaName] = curSchema;
        database[curItem.modelName] = curModel;
    }
    app.set('database', database);
}

module.exports = database;