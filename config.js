module.exports = {
    server_port:8080,
    db_url:'mongodb+srv://adele007fall:ans123@myfirstback.lbrdw.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority',
    db_schemas: [
        {file: './user_schema', collection: 'users',
    schemaName:'UserSchema', modelName: 'UserModel'}
    ],
    route_info: [ 
        {file: './user', path: '/process/login', method:'login',type:'post'},
        {file: './user', path: '/process/adduser', method:'adduser',type:'post'},
        {file: './user', path: '/process/userlist', method:'userlist',type:'post'},
    ]
}