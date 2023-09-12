const mongoose = require('mongoose');
const validator = require('validator');
const { validate } = require('./product_model');
const bcrypt = require('bcryptjs');
const jwt =  require('jsonwebtoken');
const { JWT_SECRET , JWT_EXPIRE ,COOKIE_EXPIRE } = require('../config');
const crypto = require('crypto');

const userSchema  = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your name"],
        maxLength:[30,"Name cannot have more than 30 characters"],
        minLength:[4,"Name should have more than 4 characters"]
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        unique:true,
        validate:[validator.isEmail,"Please enter a valid email"]

    },
    password:{
        type:String,
        required:[true,"Please enter your password "],
        minLength:[8,"Password should be greater than 8 characters"],
        select:false,
    },
    avatar: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true
        },
      },
      role: {
        type: String,
        default: "user",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    
      resetPasswordToken: String,
      resetPasswordExpire: Date,
    });

    userSchema.pre("save",async function(next){
        // if password is already hashed
        if(!this.isModified("password")){
            next();
        }



        this.password = await bcrypt.hash(this.password,10);
    });
    
    // jwtwebtoken
    userSchema.methods.getJWTToken = function (){
     //   const jwtToken = jwt.sign({ _id: userInDB._id }, JWT_SECRET);
        return jwt.sign({id:this._id},JWT_SECRET,{
            expiresIn: JWT_EXPIRE,
        });

    };

    // compare password
    userSchema.methods.comparePassword = async function(password){
        return await bcrypt.compare(password,this.password);
    }

    // Generating password reset token
    userSchema.methods.getResetPasswordToken = function(){
      //generating token
      const resetToken = crypto.randomBytes(20).toString("hex");
      // Hashing and adding to userSchema
      this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      this.resetPasswordExpire = Date.now() + 15*60*1000;
      return resetToken;
      


    };


    module.exports = mongoose.model("User",userSchema);