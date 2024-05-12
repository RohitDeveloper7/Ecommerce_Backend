const express = require("express");
const router = express.Router();
const userController = require('./userController')
const authenticate = require('../utility/authenticate')

//Password
// router.post("/changePassword", userController.changePassword)
// router.post("/forgotPassword", userController.forgotPassword)
// Password
router.post("/changePassword", userController.changePassword)
router.post("/forgotPassword", userController.forgotPassword)

//Otp Verification
router.post("/sendOtp", userController.sendOtpToEmail)
router.post("/verifyEmail", userController.verifyEmail)


//Register
// router.post("/sendOtpForUserVerification", userController.sendOtpForUserVerification)
// router.post("/verifyOTPforRegisteration", userController.verifyOTPforRegisteration)
// router.post("/signUp", userController.signUpByEmail)
// router.post("/verifyAndChangePassword", userController.verifyAndChangePassword)
router.post("/login", userController.login)
router.post("/register", userController.register)
router.post("/forgetPassword", userController.sendOtpForforgetPassword)

router.post("/sendOtpregisterByEmail", userController.sendOtpregisterByEmail) //otp send to register email 
router.post("/verifyOtp", userController.verifyOtp) //verifyOtp otp verfied and save the data in database 

//User
router.get("/getUser", userController.getUser)
router.get("/getUserList", userController.getUserList)
router.post("/updateUser", userController.updateUser)
router.post("/updateEmail", userController.updateEmail)
router.post('/updateMyProfile', userController.updateMyProfile)
router.post('/deleteUser', userController.deleteUser)

//Contact us
router.post('/addContactUs', userController.addContactUs)

//Download Video
router.post('/downloadVideo', userController.downloadVideo)
router.get('/getdownloadVideodeatail', userController.getdownloadVideodeatail)

module.exports = router