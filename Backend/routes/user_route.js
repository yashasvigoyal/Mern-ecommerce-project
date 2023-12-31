const express  = require('express');
const {isAuthenticatedUser,authorizeRoles}= require("../protectedResource");
const { registerUser, loginUser, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getAllUser, getSingleUser, deleteUser } = require('../controllers/userController');
const router = express.Router();
router.route("/register").post(registerUser);

router.route("/login").post(loginUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthenticatedUser
    ,getUserDetails);

router.route("/password/update").put(isAuthenticatedUser,updatePassword);

router.route("/me/profile").put(isAuthenticatedUser,updateProfile);

router.route("/admin/users").get(isAuthenticatedUser,authorizeRoles("admin"),getAllUser);

router.route("/admin/user/:id").get(isAuthenticatedUser,authorizeRoles("admin"),getSingleUser);


router.route("/admin/user/:id").delete(isAuthenticatedUser,authorizeRoles("admin"),deleteUser);
module.exports = router;