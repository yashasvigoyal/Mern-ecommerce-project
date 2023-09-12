const express = require('express');
const Product = require("../models/product_model");
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require("../middleware/catchAsyncError");
const ApiFeatures = require('../utils/apifeatures');
const {isAuthenticatedUser,authorizeRoles}= require("../protectedResource");
const { createProduct, getAllProducts ,logout,updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews, deleteReview } = require('../controllers/productController');
const router = express.Router();

// Getting all products
router.route("/products").get(getAllProducts);
// Adding a new product
router.route("/product/new").post(isAuthenticatedUser,authorizeRoles("admin"),createProduct);

// Updating a product
router.route("/product/:id").put(isAuthenticatedUser,authorizeRoles("admin"),updateProduct);
 

//Delect product
router.route("/product/:id").delete(isAuthenticatedUser,authorizeRoles("admin"), deleteProduct);
   

// Get product details
router.route("/product/:id").get(getProductDetails);


// Logout 
router.route("/logout").get(logout);

//Creating or updating review
router.route("/review").put(isAuthenticatedUser,createProductReview);

//Getting and Deleting the reviews
router.route("/reviews").get(getProductReviews).delete(isAuthenticatedUser,deleteReview);





















module.exports = router