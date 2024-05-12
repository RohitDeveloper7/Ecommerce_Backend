const express = require("express");
const router = express.Router();
const adminController = require('./adminController')
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Uploads Images 
const image = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const uploadImage = multer({
    storage: image,
    // limits: {
    //     fieldSize: 10 * 1024 * 1024, // Allow up to 10MB for field values (adjust as needed)
    //     fileSize: 5 * 1024 * 1024 // Allow up to 5MB for file size
    // }
})

// Uploads Images with video
const videoWithImage = multer.diskStorage({
    destination: function (req, file, cb) {
        const baseUploadPath = path.join('public');

        if (file.fieldname.includes('Image')) {
            const imageFolderPath = path.join(baseUploadPath, 'admin_image_upload');
            if (!fs.existsSync(imageFolderPath)) {
                fs.mkdirSync(imageFolderPath, {
                    recursive: true
                });
            }
            cb(null, imageFolderPath);
        } else {
            const videoFolderPath = path.join(baseUploadPath, 'admin_video_upload');
            if (!fs.existsSync(videoFolderPath)) {
                fs.mkdirSync(videoFolderPath, {
                    recursive: true
                });
            }
            cb(null, videoFolderPath);
        }
    },
    filename: function (req, file, cb) {
        const {
            catId,
            subCatId
        } = req.body;
        return cb(null, `${Date.now()}-${file.originalname}`);
    }
})
const uploadVideoWithImages = multer({
    storage: videoWithImage
})

// Middleware for parsing form data
router.use(express.urlencoded({
    extended: true
}));

// Admin
router.post('/register', adminController.register)
router.post('/login', adminController.login)
router.post('/changePassword', adminController.changePassword)

//category
router.post('/createCategory', uploadImage.single("file"), adminController.CreateCategory)
router.post('/updateCategory', uploadImage.single("file"), adminController.updateCategory)
router.delete('/deleteCategory', adminController.deleteCategory)
router.get('/getCategoriesList', adminController.getCategoriesList)

//sub Category
router.post('/addSubCategory', uploadImage.single("file"), adminController.addSubCategory)
router.post('/updateSubCategory', uploadImage.single("file"), adminController.updateSubCategory)
router.delete('/deleteSubCategoty', adminController.deleteSubCategoty)
router.get('/getAllSubCategoriesList', adminController.getAllSubCategoriesList)

//Product
router.post('/addProduct', uploadImage.fields([{name:'file',maxCount: 5}]), adminController.addProduct)
router.post('/updateProduct', uploadImage.fields([{name:'file',maxCount: 5}]), adminController.updateProduct)
router.get('/getProduct', adminController.getProduct)


//  BannerImage
router.post('/addBanner', uploadImage.single("file"), adminController.addBanner);
router.post('/updateBanner', uploadImage.single("file"), adminController.updateBanner);
router.delete('/deleteBanner', adminController.deleteBanner);
router.get('/getBanner', adminController.getBanner);

// Subscription
router.post('/addSubscription', adminController.addSubscription);
router.post('/updateSubscription', adminController.updateSubscription);
router.delete('/deleteSubscription', adminController.deleteSubscription);
router.get('/getSubscription', adminController.getSubscription);

// Contact us 
router.post('/addContact', adminController.addContact);
router.delete('/deleteContact', adminController.deleteContact);
router.get('/getContact', adminController.getContact);

// dahsboard us 
router.get('/getdahsboard', adminController.getdahsboard);


//get Subcategory 
router.get('/getSubCategorybyId', adminController.getSubCategorybyId);


//subscription to user
router.post('/addSubscriptionToUser', adminController.addSubscriptionToUser);

//addFreshDeal
router.post('/addFreshDeal', adminController.addFreshDeal);
router.post('/updateFreshDeal', adminController.updateFreshDeal);
router.post('/deleteFreshDeal', adminController.deleteFreshDeal);
router.get('/getFreshDeal', adminController.getFreshDeal);

//ourRecommends
router.post('/addourRecommends', adminController.addourRecommends);
router.post('/updateourRecommends', adminController.updateourRecommends);
router.post('/deleteourRecommends', adminController.deleteourRecommends);
router.get('/getourRecommends', adminController.getourRecommends);

//addTocart
router.post('/addToCart', adminController.addToCart)
router.post('/removeFromCart', adminController.removeFromCart)
router.get('/getCartData', adminController.getCartData)

module.exports = router