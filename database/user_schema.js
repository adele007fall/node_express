const crypto = require("crypto");
const Schema = {};
Schema.createSchema = function (mongoose) {
    console.log('user schema')
    const UserSchema = mongoose.Schema({
        id: { type: String, required: true, unique: true, "default": "" },
        hashed_password: { type: String, required: true, index: 'hashed', "default": "" },
        salt: { type: String, required: true },
        name: { type: String, index: 'hashed', "default": "" },
        age: { type: Number, 'default': -1 },
        created_at: { type: Date, index: { unique: false }, 'default': Date.now() },
        updated_at: { type: Date, index: { unique: false }, 'default': Date.now() }
    })
    UserSchema.virtual('password').set(function (password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password);
        console.log('virtual password의 set 호출됨 : ' + this.hashed_password);
    })
        .get(function () {
            console.log('virtual password의 get 호출됨.');
            return this._password;
        });
    UserSchema.method('encryptPassword', function (plainText, inSalt) {
        if (inSalt) {
            return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
        } else {
            return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
        }
    });
    UserSchema.method('makeSalt', function () {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    });
    UserSchema.method('authenticate', function (plainText, inSalt, hashed_password) {
        if (inSalt) {
            return this.encryptPassword(plainText, inSalt)
                === hashed_password;
        } else {
            return this.encryptPassword(plainText)
                === this.hashed_password;
        }
    })
    console.log('userSchma 정의됨');
    UserSchema.static("findById", function (id, callback) {
        return this.find({ id: id }, callback);
    });
    UserSchema.static('findAll', function (callback) {
        return this.find({}, callback);
    })
    UserModel = mongoose.model('users', UserSchema);
    console.log('userModel 정의됨');
    return UserSchema;
}
module.exports = Schema;