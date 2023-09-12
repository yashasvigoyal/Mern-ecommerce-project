const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require("../middleware/catchAsyncError");
const User = require("../models/user_model");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require('crypto');

exports.registerUser = catchAsyncErrors(async(req,res,next)=>{
    const {name,email,password} = req.body;
    const user = await User.create({
        name,email,password,
        avatar:{
            public_id : "This is a sample id",
            url:"profilepicUrl",
        },
    
});
sendToken(user,201,res)

});

// login 
exports.loginUser = catchAsyncErrors(async(req,res,next)=>{
    const {email,password} = req.body;

    if(!email || !password){
        return next(new ErrorHandler("Please enter email and password",400));
        }
        const user = await User.findOne({email}).select("+password");
        if(!user){
            return next(new  ErrorHandler("Invalid email or password",401));
        }
        const isPasswordMatched = await user.comparePassword(password);
        if(!isPasswordMatched){
            return next(new ErrorHandler("Invalid email or password",401));

        }
        
    sendToken(user,200,res);
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email});
    if(!user){
        return next(new ErrorHandler("User not found",404));
    }

    // Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave:false});
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/reset/${resetToken}`;
    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

    try {
      await sendEmail({
        email: user.email,
        subject: `Ecommerce Password Recovery`,
        message,
      });
  
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
  
      await user.save({ validateBeforeSave: false });
  
      return next(new ErrorHandler(error.message, 500));
    }
  });

  //Reset password
  exports.resetPassword = catchAsyncErrors(async(req,res,next)=>{
    //Creating Token hash
    const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
     
    //Finding user in database

  const user = await User.findOne({
    resetPasswordToken,
    //gt - greater than
    resetPasswordExpire: { $gt: Date.now() },
  });

  // If user not found
  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }
// If password doesnot match confirm password
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match confirm password", 400));
  }

  //If matched

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  //login

  sendToken(user, 200, res);
});

// Get User Detail
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  // who is login can access this

  res.status(200).json({
    success: true,
    user,
  });
});

//Update user password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("password does not match confirm password", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

//Update User profile
exports.updateProfile = catchAsyncErrors(async (req,res,next)=>{
  const newUserData ={
    name:req.body.name,
    email:req.body.email,

  }
  const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
    new:true,
    runValidators:true,
    useFindAndModify:false,
  });
  res.status(200).json({
    success:true,
  })
});

//Get all users(admin)
exports.getAllUser = catchAsyncErrors(async(req,res,next)=>{
  const users = await User.find();
  res.status(200).json({
    success:true,
    users,
  })
});

//Get user details(admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//Delete user(Admin)
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }
  const imageId = user.avatar.public_id;
  await cloudinary.v2.uploader.destroy(imageId);
  await user.remove();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});




