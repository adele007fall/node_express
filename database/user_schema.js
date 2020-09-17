const Schema = {};
Schema.createSchema = function(mongoose){
    console.log('user schema')
    const UserSchema = mongoose.Schema({
        id: {type: String, required: true, unique: true,},
        password: {type: String, required: true},
        name: {type: String, index: 'hashed'},
        age: {type: Number, 'default': -1},
        created_at: {type: Date, index:{unique:false},
        'default': Date.now()},
        updated_at: {type: Date, index:{unique:false},
        'default': Date.now()}
    })
    console.log('userSchma 정의됨');
    UserSchema.static('findAll', function(callback){
        return this.find({},callback);
    })
    UserModel = mongoose.model('users', UserSchema);
    console.log('userModel 정의됨');
    return UserSchema;
}
module.exports = Schema;