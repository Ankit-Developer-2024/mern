const express =  require("express");
const {createUser,loginInUser, checkAuth, resetPasswordRequest, resetPassword, logout} =  require("../controller/Auth");
var passport = require('passport');

const router=express.Router();

//auth  router 
router.post('/signup',createUser)
      .post('/login',passport.authenticate('local'),loginInUser)
      .get('/check',passport.authenticate('jwt'),checkAuth)
      .post('/reset-password-request',resetPasswordRequest)
      .post('/reset-password',resetPassword)
      .get('/logout',logout)

exports.router=router;