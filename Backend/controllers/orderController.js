const Order = require("../models/order_model");
const Product =  require("../models/product_model");
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require("../middleware/catchAsyncError");


//Creating a order
exports.newOrder = catchAsyncErrors(async(req,res,next)=>{
    const {shippingInfo,orderItems,paymentInfo,itemsPrice,taxPrice,shippingPrice,totalPrice} = req.body;
    const order = await Order.create({
        shippingInfo,orderItems,paymentInfo,itemsPrice,taxPrice,shippingPrice,totalPrice,paidAt:Date.now(),
        user:req.user._id,
    });
    res.status(201).json({
        success:true,
        order,
    });
    

})

// get single order
exports.getSingleOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id).populate("user","name email");
    // populate function here take the id of user from order and then search in users and will take name and email of the user.
    if(!order){
        return next(new ErrorHandler("order not found with id",404));
    }
    res.status(200).json({
        success:true,
        order,
    });
})

//get logged in user orders
exports.myOrders = catchAsyncErrors(async(req,res,next)=>{
    const orders = await Order.find({
        user:req.user._id
    });
    res.status(200).json({
        success:true,
        orders,
    });
});

//get all orders for admin
exports.getAllOrders = catchAsyncErrors(async(req,res,next)=>{
    const orders = await Order.find();
    let totalAmount = 0;
    orders.forEach((order)=>{
        totalAmount = totalAmount + order.taxPrice;
    });
    res.status(200).json({
        success:true,
        totalAmount,
        orders,
    });
});

//update order status admin
exports.updateOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("Order not found"),404);
    }
    if(order.orderStatus==="Delivered"){
        return next(new ErrorHandler("Order has been delivered",404));
    }
    // from array of orderItems if order is delivered then decrease it from array
    order.orderItems.forEach(async(order)=>{
        await updateStock(order.product,order.quantity);
    });

    order.orderStatus = req.body.status;
    if(req.body.status==="Delivered"){
    order.deliveredAt = Date.now()
    }
    await order.save({
        validateBeforeSave: false
    });

    res.status(200).json({
        success:true,
    });

})

async function updateStock(id,quantity){
    const product = await Product.findById(id);
    product.Stock -= quantity;
    await product.save({
        validateBeforeSave: false
    })


}

// delete order (Admin)
exports.deleteOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("Order not found"),404);
    }
    await order.remove();

    res.status(200).json({
        success:true,
       
    })
})








