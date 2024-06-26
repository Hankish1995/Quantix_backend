let express = require('express')
let router = express.Router()
let userController = require('../controllers/userController')
let planController = require('../controllers/planController')
let aiController = require('../controllers/aiController')
let authentication = require("../middlewares/authMiddleware")
let {
    validateRegister,
    validateSignIn,
    validateForgetPassword,
    validateVerifyOTP,
    validateResetPassword,
    validateSocialLogin,
    validateAddPlans,
    validateDeletePlan
} = require("../middlewares/validationMiddleware")



// ********** AUTH
router.get('/testRoute', userController.testRoute)
router.post('/signUp', validateRegister, userController.signUp)
router.post('/signIn', validateSignIn, userController.signIn)
router.post('/forgetPassword', validateForgetPassword, userController.forgetPassword)
router.post('/verifyOTP', validateVerifyOTP, userController.verifyOTP)
router.put('/resetPassword', validateResetPassword, userController.resetPassword)
router.post('/socialLogin', validateSocialLogin, userController.socialLogin)



//**************** PLANS
router.post('/addPlans', authentication, validateAddPlans, planController.addPlans)
router.delete('/deletePlan', authentication, validateDeletePlan, planController.deletePlan)
router.get('/getAllPlans', authentication, planController.getAllPlans)


//**************** AI 
router.post("/getDimensions", authentication,aiController.getDimensions)

module.exports = router