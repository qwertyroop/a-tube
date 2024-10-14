import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
    },
    fullName : {
        type : String,
        required : true,
        trim : true,
        index : true
    },
    avatar : {
        type : String, // cloudinary URL
        required : true,
    },
    coverImage : {
        type : String,
    },
    watchHistory : [
        {
            types : Schema.Types.ObjectId,
            ref : "Video"
        }
    ],
    password : {
        type : String,
        required : [true, 'Password is required']
    },
    refreshToken : {
        type : String
    }

}, {timestamps : true})

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    // here we can see if the field is modified or not by
    // using .isModified hook from the middleware section of mongoose.
    // we will pass a string which is the field name i.e("password")
    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password)
    // returns boolean
}

userSchema.methods.generateAccessToken = function(){
    jwt.sign({
        _id:this._id,
        email : this.email,
        username : this.username,
        fullName : this.fullName
    })
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn : ACCESS_TOKEN_EXPIRY
    }
}
userSchema.methods.generateRefreshToken = function(){
    jwt.sign({
        _id:this._id,
        email : this.email,
        username : this.username,
        fullName : this.fullName
    })
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn : REFRESH_TOKEN_EXPIRY
    }
}

export const User = mongoose.model('User', userSchema)