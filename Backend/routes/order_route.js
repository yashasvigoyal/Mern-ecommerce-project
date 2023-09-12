const express = require('express');
const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrder, deleteOrder } = require('../controllers/orderController');
const router =  express.Router();
const {isAuthenticatedUser , authorizeRoles} = require("../protectedResource");

//Creating new order
router.route("/order/new").post(isAuthenticatedUser,newOrder);

//get single order
router.route("/order/:id").get(isAuthenticatedUser,getSingleOrder);

//Get orders of logged in user
router.route("/orders/me").get(isAuthenticatedUser,myOrders);

//Get all orders for admin
router.route("/admin/orders").get(isAuthenticatedUser,authorizeRoles("admin"),getAllOrders);

//update order - admin
router.route("/admin/order/:id").put(isAuthenticatedUser,authorizeRoles("admin"),updateOrder);

//delete order - admin
router.route("/admin/order/:id").delete(isAuthenticatedUser,authorizeRoles("admin"),deleteOrder);







module.exports = router;