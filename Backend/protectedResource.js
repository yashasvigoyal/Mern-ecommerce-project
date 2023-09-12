const ErrorHandler = require('./utils/errorhandler');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('./config');
const User = require("./models/user_model");
const catchAsyncErrors = require("./middleware/catchAsyncError");
exports.isAuthenticatedUser = catchAsyncErrors(async(req,res,next)=>{
    const {token} = req.cookies;
   
    if(!token){
        return next(new  ErrorHandler("Please login",401));
    }
    const decodedData = jwt.verify(token,JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    next();

});

// for admin
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new ErrorHandler(
            `Role: ${req.user.role} is not allowed to access this resouce `,
            403
          )
        );
      }
  
      next();
    };
  };