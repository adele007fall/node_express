module.exports = {
    server_port:3500,
    db_url:'mongodb://localhost:27017',
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