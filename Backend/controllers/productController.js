const Product = require("../models/product_model");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apifeatures");




// Get All Product
exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 5;
    const productCount = await Product.countDocuments(); 

    
    
    const apiFeature = new ApiFeatures(Product.find(),req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
    const products = await apiFeature.query;
    res.status(200).json({success:true,products});
});

// create new product


exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    req.body.user = req.user.id;
  const product = await Product.create(req.body);
  res.status(201).json({
      success:true,
      product
  });


})

//Update product details


  exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = Product.findById(req.params.id);
  if(!product){
      return next(new ErrorHandler("Product not found",404));

  }
  product = await Product.findByIdAndUpdate(req.params.id,req.body,{new:true,
  runValidators:true,
useFindAndModify:false})
res.status(200).json({
  success:true,
  product
})
})

// Get Product Details
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});





// Delete Product

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  

  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product Delete Successfully",
  });
});

//Logout 
exports.logout = catchAsyncErrors(async (req, res, next) => {

  res.cookie("token",null,{
      expires:new Date(Date.now()),
      httpOnly:true,
  });


  res.status(200).json({
      success:true,
      message:"Logged out",
  });

});

//Create new review or update review
exports.createProductReview = catchAsyncErrors(async(req,rex,next)=>{
  const {rating,comment,productId} = req.body;
  const review = {
    user:req.user._id,
    name:req.user.name,
    rating:Number(rating),
    comment,

  };
  const product = await Product.findById(productId);

  //If product is already reviewed
  const isReviewed = product.reviews.find(rev=>rev.user.toString()===req.user._id.toString());
  if(isReviewed){
    product.reviews.forEach(rev=>{
      if(rev.user.toString()===req.user._id.toString()){
      rev.rating=rating,
      rev.comment=comment
      }
    });


  }
  else{
    product.reviews.push(review);
    product.numofReviews = product.reviews.length
  }
  // ratings = average of all ratings
  let avg = 0;
  product.reviews.forEach(rev=>{
    avg = avg + rev.rating; 
  });
  product.ratings = avg/product.reviews.length;

  await product.save({validateBeforeSave:false});
  res.status(200).json({
    success:true,
  })
});

// Get All Reviews of a single product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
// reviews contain all that review that we dont want to delete
  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});



