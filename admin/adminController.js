require('../db/conn')
const admin = require('./adminSchema')
const categorys = require('../modal/category')
const subCategory = require('../modal/subCategory')
const products = require('../modal/product')
const banners = require('../modal/banner')
const subscriptions = require('../modal/subscription')
const bcrypt = require("bcrypt");
const contacts = require('../modal/contact')
const freshDeal = require('../modal/freshDeal')
const ourRecommend = require('../modal/ourRecommends')
const cart = require('../modal/addTocart')
const users = require('../users/usersSchema')
const fs = require('fs')
const {
    log
} = require('console')
const userController = require('../users/userController')

let adminController = {};

adminController.register = async (req, res) => {
    const {
        fullName,
        email,
        password
    } = req.body

    try {
        const userExist = await admin.findOne({
            email: email
        })
        if (userExist) {
            return res.status(422).json({
                error: "User Already Exist",
                success: false
            })
        } else {
            let admin_id, counter, num
            admin.findOne({}).sort({
                counter: -1
            }).then(async (count) => {
                counter = count ? count.counter + 1 : 1;
                if (counter < 1000) {
                    num = String(counter).padStart(4, '0');
                } else {
                    num = counter
                }
                admin_id = 'admin' + num;
                const passWord = await bcrypt.hash(password, 12);
                console.log("passWord", passWord);
                const newAdmin = new admin({
                    admin_id,
                    fullName,
                    email,
                    password: passWord,
                    counter
                })
                newAdmin.save().then(data => {
                    return res.status(200).json({
                        msg: "Register successfully",
                        success: true
                    })
                }, err => {
                    console.log("err", err);
                    return res.status(500).json({
                        error: "somethign went wrong",
                        success: false
                    })
                })
            })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal Server Error",
            errMessage: error,
            success: false
        })
    }
}

adminController.login = async (req, res) => {
    const {
        email,
        password
    } = req.body;
    try {
        const userlogin = await admin.findOne({
            email: email
        });
        if (userlogin) {
            console.log("ispassvalid", userlogin.password);
            const ispassvalid = await bcrypt.compare(password, userlogin.password);
            console.log("ispassvalid", ispassvalid);
            //   if (!ispassvalid) {
            //     res.status(400).json({ error: "Invalid credential", success: false });
            //   } else {
            const token = await userlogin.generateAuthToken();
            console.log("token >>>>>>>>", token);
            res.status(200).json({
                message: "Admin logged in succesfully",
                token: token,
                admin_id: userlogin.admin_id,
                email: userlogin.email,
                success: true,
            });
            //   }
        } else {
            res.status(400).json({
                error: "Invalid credential",
                success: false
            });
        }
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({
                error: "Internal server error",
                err: error,
                success: false
            });
    }
};

adminController.changePassword = async (req, res) => {
    const {
        email,
        currentPassword,
        password,
        confirmPassword
    } = req.body;
    if (!email || !password || !confirmPassword) {
        return res
            .status(422)
            .json({
                error: "Please fill all the details.",
                success: false
            });
    }
    try {
        const adminExist = await admin.findOne({
            email: email
        });
        if (adminExist) {
            const data = await bcrypt.compare(currentPassword, adminExist.password);
            const PassWord = await bcrypt.hash(password, 12);
            if (data) {
                admin
                    .updateOne({
                        email: email
                    }, {
                        $set: {
                            password: PassWord
                        }
                    })
                    .then(
                        (data) => {
                            return res
                                .status(200)
                                .json({
                                    msg: "Password Has been changed",
                                    success: true
                                });
                        },
                        (err) => {
                            return res.status(200).json({
                                msg: err,
                                success: false
                            });
                        }
                    );
            } else {
                return res
                    .status(401)
                    .json({
                        error: "Provide Correct Password",
                        success: false
                    });
            }
        } else {
            return res
                .status(401)
                .json({
                    error: "Provide Correct Email",
                    success: false
                });
        }
    } catch (error) {
        return res
            .status(500)
            .json({
                error: "Internal server error",
                err: error,
                success: false
            });
    }
};




//category
adminController.CreateCategory = async (req, res) => {
    const {
        categoryName,
        catDesc
    } = req.body
    console.log(" req.body", req.body);
    if (!categoryName, !catDesc) {
        return res.status(422).json({
            error: "Please fill all the details."
        })
    }
    try {
        const categoryExist = await categorys.findOne({
            categoryName: categoryName
        })
        if (categoryExist) {
            return res.status(422).json({
                error: "Category Already Exist",
                success: false
            })
        }
        let category_id, counter, num
        categorys.findOne({}).sort({
            counter: -1
        }).then(count => {
            counter = count ? count.counter + 1 : 1;
            if (counter < 1000) {
                num = String(counter).padStart(4, '0');
            } else {
                num = counter
            }
            category_id = 'CAT' + num;
            let catImage = process.env.filePath + req?.file?.path;
            const newCat = new categorys({
                category_id,
                categoryName,
                counter,
                catImage: catImage,
                catDesc,
            })
            newCat.save().then(data => {
                return res.status(200).json({
                    msg: "Category added successfully.",
                    success: true
                })
            }, err => {
                return res.status(500).json({
                    error: err,
                    success: false
                })
            })
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal Server Error",
            errMessage: error,
            success: false
        })
    }
}

adminController.updateCategory = async (req, res) => {
    const {
        categoryName,
        category_id,
        catDesc
    } = req.body
    if (!category_id) {
        return res.status(422).json({
            error: "Please fill category_id."
        })
    }
    let catImage
    if (req.file) {
        catImage = process.env.filePath + req?.file?.path;
    }
    try {
        categorys.updateOne({
            category_id: category_id
        }, {
            categoryName,
            catDesc,
            catImage
        }).then(resolve => {
            return res.status(200).json({
                msg: "Updated successfully.",
                success: true
            })
        }, reject => {
            return res.status(500).json({
                msg: "Unable to Update.",
                error: reject,
                success: true
            })
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal Server Error",
            errMessage: error,
            success: false
        })
    }
}

adminController.deleteCategory = async (req, res) => {
    const {
        category_id
    } = req.body
    if (!category_id) {
        return res.status(422).json({
            error: "Please fill all the details."
        })
    }
    try {
        categorys.deleteOne({
            category_id: category_id
        }).then(data => {
            subCategory.deleteMany({
                category_id: category_id
            }).then((data) => {
                return res.status(200).json({
                    msg: "Deleted successfully.",
                    success: true
                })
            })
        }, reject => {
            return res.status(500).json({
                msg: "Unable to Delete Category",
                error: reject,
                success: false
            })

        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal Server Error",
            errMessage: error,
            success: false
        })
    }
}

adminController.getCategoriesList = async (req, res) => {
    let categoriesList = await categorys.find({}).sort({
        counter: -1
    })
    return res.status(200).json({
        data: categoriesList,
        success: true
    })
}



//sub category
adminController.addSubCategory = async (req, res) => {
    const {
        category_id,
        subCategoryName,
        subDisc,
    } = req.body
    if (!category_id || !subCategoryName || !subDisc) {
        return res.status(422).json({
            error: "Please fill all the details."
        })
    }
    try {
        const SubCatExist = await subCategory.findOne({
            subCategoryName: subCategoryName
        })
        if (SubCatExist) {
            return res.status(422).json({
                error: "Sub Category already exist",
                success: false
            })
        }
        let category = await categorys.findOne({
            category_id: category_id
        }, {
            categoryName: 1
        })
        let categoryName = category?.categoryName
        subCategory.findOne({}).sort({
            counter: -1
        }).then(count => {
            let subCategory_id, counter, num
            counter = count ? count.counter + 1 : 1;
            if (counter < 1000) {
                num = String(counter).padStart(4, '0');
            } else {
                num = counter
            }
            subCategory_id = 'SUBCAT' + num;
            let add = {
                counter: counter,
                category_id: category_id,
                subCategoryName: subCategoryName,
                categoryName: categoryName,
                subDisc: subDisc,
            }
            console.log(add);
            if (req?.file) {
                add['image'] = process.env.filePath + req?.file?.path
            }
            subCategory.updateOne({
                subCategory_id: subCategory_id
            }, {
                $set: add
            }, {
                upsert: true
            }).then(data => {
                categorys.updateOne({
                    category_id: category_id
                }, {
                    $set: {
                        subCat: true
                    }
                }).then(data => {
                    return res.status(200).json({
                        msg: "Sub category Added successfully",
                        success: true
                    })
                }, err => {
                    return res.status(500).json({
                        error: err,
                        success: false
                    })
                })
            }, err => {
                return res.status(500).json({
                    error: err,
                    success: false
                })
            })
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal Server Error",
            errMessage: error,
            success: false
        })
    }
}

adminController.updateSubCategory = async (req, res) => {
    const {
        subCategoryName,
        subCategory_id,
        oldImagePath,
        subDisc
    } = req.body
    console.log(req.body);
    if (!subCategory_id) {
        return res.status(422).json({
            error: "Please fill all the details."
        })
    }
    try {
        let update = {}
        if (subCategoryName) {
            update['subCategoryName'] = subCategoryName
        }
        if (subDisc) {
            update['subDisc'] = subCategoryName
        }
        if (req?.file) {
            // if (oldImagePath) {
            //     // fs.unlinkSync(oldImagePath)
            // }
            update['image'] = process.env.filePath + req?.file?.path
        }
        console.log(update);
        subCategory.updateOne({
            subCategory_id: subCategory_id
        }, {
            $set: update
        }).then(resolve => {
            return res.status(200).json({
                msg: "Sub category updated succesfully!",
                success: true
            })
        }, err => {
            return res.status(500).json({
                error: 'Unable to update subcategory succesfully!',
                error: reject,
                success: false
            })
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal Server Error",
            errMessage: error,
            success: false
        })
    }
}

adminController.deleteSubCategoty = async (req, res) => {
    const {
        subCategory_id
    } = req.body
    if (!subCategory_id) {
        return res.status(422).json({
            error: "Please fill all the details."
        })
    }
    try {
        let bannerImages = await subCategory.findOne({
            subCategory_id: subCategory_id
        })
        if (bannerImages) {
            // Assuming bannerImage is a string
            const imagePath = bannerImages.image;
            const splitPath = imagePath.split('uploads\\')[1];
            console.log("bannerImages", splitPath);
            if (fs.existsSync(`uploads/${splitPath}`)) {
                fs.unlinkSync(`uploads/${splitPath}`)
            }

        } else {
            console.log("No banner found with the provided bannerId");
        }
        subCategory.deleteOne({
            subCategory_id: subCategory_id
        }).then(data => {
            return res.status(200).json({
                msg: "Subcategory deleted succesfully!",
                success: true
            })
        }, err => {
            return res.status(500).json({
                error: "Unable to Delete SubCategory",
                error: reject,
                success: false
            })
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal Server Error",
            errMessage: error,
            success: false
        })
    }
}

adminController.getAllSubCategoriesList = async (req, res) => {
    const {
        category_id
    } = req.query
    console.log("category_id", category_id);
    let condition = {}
    if (category_id != undefined && category_id != null && category_id != '') {
        condition['category_id'] = category_id
    }
    try {
        let data = await subCategory.aggregate([{
                $match: condition
            },
            {
                "$lookup": {
                    "from": "categories",
                    "localField": "category_id",
                    "foreignField": "category_id",
                    "as": "category"
                },
            },
            {
                $sort: {
                    counter: -1
                }
            },
            {
                $unwind: '$category'
            },
        ]).exec()
        return res.status(200).json({
            data: data,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal Server Error",
            errMessage: error,
            success: false
        })
    }
}


//product

adminController.addProduct = async (req, res) => {
    const {
        category_id,
        subCategory_id,
        productName,
        ProductPrice,
        discountPrice,
        productQuantity,
        productDescription,
        avaliability,
        admin_id
    } = req.body;
    console.log("req.body", req.body);
    console.log("req.files", req.files);
    // Now productImages is an array of file paths
    try {
        let product_id, counter, num
        let count = await products.findOne({}).sort({
            counter: -1
        });
        counter = count ? count.counter + 1 : 1;
        if (counter < 1000) {
            num = String(counter).padStart(4, '0')
        } else {
            num = counter
        }
        product_id = 'pid' + num;
        // const productImages = req.files.file.map(file => {
        //     return process.env.filePath + file.path;
        //   });
        let data = {
            category_id,
            subCategory_id,
            productName,
            ProductPrice,
            discountPrice,
            productQuantity,
            productDescription,
            avaliability,
            product_id,
            counter,
            admin_id
        }
        if (req.files && req.files.file && req.files.file.length > 0) {
            // Extract file paths from req.files.file and store them in an array
            const productImages = req.files.file.map(file => {
                return process.env.filePath + file.path;
            });
            data.productImages = productImages;
            console.log("productImages", productImages);
        }
        const newProduct = new products(data); // Create a new product document using the data object
        newProduct.save().then(() => {
            return res.status(200).json({
                msg: "Product added successfully.",
                success: true
            })
        }, err => {
            console.log("err", err);
            return res.status(400).json({
                error: "something went wrong while added the product",
                success: false
            })
        })
    } catch (error) {
        console.log("error", error);
        return res.status(400).json({
            error: "Internal Server Error",
            success: false
        })
    }
}

adminController.getProduct = async (req, res) => {
    // console.log(category_id ,subCategory_id) = req.query;
    // console.log(category_id);
    let data = req.query;
    const category_id = data['category_id'];
    const subCategory_id = data['subCategory_id'];
    console.log(data);
    console.log(category_id);
    console.log(subCategory_id);
    try {
        if (category_id && subCategory_id) {
            products.find({
                category_id: category_id,
                subCategory_id: subCategory_id
            }).sort({
                counter: -1
            }).then((data) => {
                return res.status(200).json({
                    msg: "data get successfully",
                    data: data,
                    success: true
                })
            }, err => (err => {
                return res.status(400).json({
                    msg: "something went wrong while get data",
                    success: false
                })
            }))
        } else {
            products.find({}).sort({
                counter: -1
            }).then((data) => {
                return res.status(200).json({
                    msg: "data get successfully",
                    data: data,
                    success: true
                })
            }, err => (err => {
                return res.status(400).json({
                    msg: "something went wrong while get data",
                    success: false
                })
            }))
        }
    } catch (error) {
        return res.status(500).json({
            msg: "internal server error",
            success: false
        })

    }

}

adminController.updateProduct = async (req,res) => {
    const {} = req.body;
    
}


//  BannerImage
// adminController.addBanner = async (req, res) => {
//     const { genere } = req.body
//     console.log("req.body is ", req.body);
//     try {
//         const videoExist = await banners.findOne({ path:req?.file.path })
//         if (videoExist) {
//             return res.status(422).json({ error: "Banner Image already exist", success: false })
//         } else {
//             let bannerId, counter, num
//             let count = await banners.findOne({}).sort({ counter: -1 })
//             counter = count ? count.counter + 1 : 1;
//             if (counter < 1000) {
//                 num = String(counter).padStart(4, '0');
//             } else {
//                 num = counter
//             }
//             bannerId = 'bannerId' + num;
//             console.log("req.file.path", req.file);
//             const imagePath = process.env.filePath + req.file.path;
//             console.log("imagePath", imagePath);
//             banners.updateOne({ bannerId: bannerId }, { bannerImage: imagePath, genere:genere, counter:counter }, { upsert: true }).then(resolve => {
//                 return res.status(200).json({ msg: "bannerImage data added successfully", success: true })
//             }, err => {
//                 console.log("error is ", err);
//                 return res.status(500).json({ msg: "Unable to add bannerImage data", error: err, success: true })
//             })
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
//     }
// }


adminController.addBanner = async (req, res) => {
    const {
        type,
        title,
        id,
        description
    } = req.body;
    // console.log("req.body:", JSON.parse(req.body));
    if (!type, !title, !id) {
        return res.status(400).json({
            error: "please provide all the details",
            success: false
        });
    }
    try {
        // Check if the banner with the same path exists
        let data = await banners.findOne({
            bannerImage: req.file.path
        })
        if (data) {
            return res.status(400).json({
                error: "Banner Image is Already Exist",
                success: false
            });
        } else {
            let num, counter, bannerId;
            let count = await banners.findOne({}).sort({
                counter: -1
            })
            counter = count ? count.counter + 1 : 1;
            if (counter < 1000) {
                num = String(counter).padStart(4, '0');
            } else {
                num = counter
            }
            bannerId = 'bannerId' + num;
            console.log("req.file.path", req.file);
            const imagePath = process.env.filePath + req.file.path;
            console.log("imagePath", imagePath);
            banners.updateOne({
                bannerId: bannerId
            }, {
                bannerImage: imagePath,
                type,title,id,
                counter,bannerId,description
            }, {
                upsert: true
            }).then(resolve => {
                return res.status(200).json({
                    msg: "bannerImage data added successfully",
                    success: true
                })
            }, err => {
                console.log("error is ", err);
                return res.status(500).json({
                    msg: "Unable to add bannerImage data",
                    error: err,
                    success: true
                })
            })
        }

    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({
            error: "Internal Server Error",
            errMessage: error,
            success: false
        });
    }
};

adminController.updateBanner = async (req, res) => {
    const {
        bannerId,
        genere
    } = req.body
    console.log("req.body is ", req.body);
    if (!bannerId) {
        // fs.unlinkSync(req?.file?.path)
        return res.status(400).json({
            error: "please provide bannerId to Upadate the data",
            success: false
        })
    }
    try {
        let imagePath
        if (req?.file) {
            imagePath = process.env.filePath + req.file.path;
        }
        console.log("imagePath", imagePath);
        banners.updateOne({
            bannerId: bannerId
        }, {
            bannerImage: imagePath,
            genere: JSON.parse(genere)
        }).then(resolve => {
            return res.status(200).json({
                msg: "bannerImage data updated successfully",
                success: true
            })
        }, err => {
            console.log("error is ", err);
            return res.status(500).json({
                msg: "Unable to updated bannerImage  data",
                error: err,
                success: true
            })
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal Server Error",
            errMessage: error,
            success: false
        })
    }
}

adminController.getBanner = async (req, res) => {
    banners.find({}).sort({
        counter: -1
    }).then((data) => {
        return res.status(200).json({
            data: data,
            success: true
        })
    }).catch((err) => {
        return res.status(400).json({
            msg: "cannot get the Banner data ",
            success: false
        })
    })
}

adminController.deleteBanner = async (req, res) => {
    const {
        bannerId
    } = req.body
    console.log("req.body", req.body);
    let bannerImages = await banners.findOne({
        bannerId: bannerId
    })
    if (bannerImages) {
        // Assuming bannerImage is a string
        const imagePath = bannerImages.bannerImage;
        const splitPath = imagePath.split('uploads\\')[1];
        console.log("bannerImages", splitPath);
        if (fs.existsSync(`uploads/${splitPath}`)) {
            fs.unlinkSync(`uploads/${splitPath}`)
        }

    } else {
        console.log("No banner found with the provided bannerId");
    }
    // bannerImages = (bannerImages.split('uploads\'));
    // console.log("bannerImages",bannerImages.bannerImage);

    if (!bannerId) {
        // fs.unlinkSync(req?.file?.path)
        return res.status(400).json({
            error: "please provide bannerId to delete the data",
            success: false
        })
    }
    banners.deleteOne({
        bannerId: bannerId
    }).then((data) => {
        return res.status(200).json({
            msg: "data deleted Successfullly",
            success: true
        })
    }).catch((err) => {
        return res.status(400).json({
            error: "cannot delete the data ",
            success: false
        })
    })
}

//subscription

adminController.
addSubscription = async (req, res) => {
    const {
        planName,
        amount,
        validity,
        description
    } = req.body
    console.log("req.body is ", req.body);
    try {
        let planId, counter, num
        let count = await subscriptions.findOne({}).sort({
            counter: -1
        })
        counter = count ? count.counter + 1 : 1;
        if (counter < 1000) {
            num = String(counter).padStart(4, '0');
        } else {
            num = counter
        }
        planId = 'planId' + num;
        subscriptions.updateOne({
            planId: planId
        }, {
            planName: planName,
            amount: amount,
            validity: validity,
            description: description,
            planId: planId,
            counter: counter
        }, {
            upsert: true
        }).then(resolve => {
            return res.status(200).json({
                msg: "Subscription data added successfully",
                success: true
            })
        }, err => {
            console.log("error is ", err);
            return res.status(500).json({
                error: "Unable to add Subscription data",
                error: err,
                success: true
            })
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal Server Error",
            errMessage: error,
            success: false
        })
    }
}

adminController.updateSubscription = async (req, res) => {
    const {
        planName,
        amount,
        validity,
        description,
        planId
    } = req.body
    console.log("req.body is ", req.body);
    if (!planId) {
        // fs.unlinkSync(req?.file?.path)
        return res.status(400).json({
            error: "please provide Subscription planId to Upadate the data",
            success: false
        })
    }
    try {
        subscriptions.updateOne({
            planId: planId
        }, {
            planName: planName,
            amount: amount,
            validity: validity,
            description: description
        }).then(resolve => {
            return res.status(200).json({
                msg: "Subscription data added successfully",
                success: true
            })
        }, err => {
            console.log("error is ", err);
            return res.status(500).json({
                error: "Unable to add Subscription data",
                error: err,
                success: true
            })
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal Server Error",
            errMessage: error,
            success: false
        })
    }
}

adminController.deleteSubscription = async (req, res) => {
    const {
        planId
    } = req.body
    console.log("req.body is ", req.body);
    if (!planId) {
        // fs.unlinkSync(req?.file?.path)
        return res.status(400).json({
            error: "please provide Subscription planId to Delete  the data",
            success: false
        })
    }
    try {
        subscriptions.deleteOne({
            planId: planId
        }).then(resolve => {
            return res.status(200).json({
                msg: "Subscription Deleted successfully",
                success: awa
            })
        }, err => {
            console.log("error is ", err);
            return res.status(500).json({
                error: "Unable to Delete Subscription",
                error: err,
                success: true
            })
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal Server Error",
            errMessage: error,
            success: false
        })
    }
}

adminController.getSubscription = async (req, res) => {
    try {
        subscriptions.find({}).then(data => {
            return res.status(200).json({
                msg: "Subscription data get  successfully",
                data: data,
                success: true
            })
        }, err => {
            console.log("error is ", err);
            return res.status(500).json({
                error: "Unable to get Subscription",
                error: err,
                success: true
            })
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal Server Error",
            errMessage: error,
            success: false
        })
    }
}

// Contact us 

adminController.addContact = async (req, res) => {
    const {
        name,
        email,
        number,
        message
    } = req.body
    try {
        let counter, contactId, num
        let count = await contacts.findOne({}).sort({
            counter: -1
        })
        console.log("count", count);
        counter = count ? count?.counter + 1 : 1;
        console.log("counter", counter);
        if (counter < 1000) {
            num = String(counter).padStart(4, '0');
        } else {
            num = counter
        }
        contactId = 'contactId' + num;
        console.log("contactId", contactId);
        contacts.updateOne({
            contactId: contactId
        }, {
            name,
            email,
            number,
            message,
            counter,
            contactId
        }, {
            upsert: true
        }).then(resolve => {
            return res.status(200).json({
                msg: "Contact data added successfully",
                success: true
            })
        }, err => {
            console.log("error is ", err);
            return res.status(500).json({
                msg: "Unable to add Contact data",
                error: err,
                success: true
            })
        })
    } catch (error) {

    }
}

adminController.deleteContact = async (req, res) => {
    const {
        contactId
    } = req.body
    console.log("req.body is ", req.body);
    if (!contactId) {
        // fs.unlinkSync(req?.file?.path)
        return res.status(400).json({
            error: "please provide coontact Id  to Delete  the data",
            success: false
        })
    }
    try {
        contacts.deleteOne({
            contactId: contactId
        }).then(resolve => {
            return res.status(200).json({
                msg: "Contact Deleted successfully",
                success: true
            })
        }, err => {
            console.log("error is ", err);
            return res.status(500).json({
                error: "Unable to Delete Contact",
                error: err,
                success: true
            })
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal Server Error",
            errMessage: error,
            success: false
        })
    }
}

adminController.getContact = async (req, res) => {
    try {
        contacts.find({}).then(data => {
            return res.status(200).json({
                msg: "contacts data get  successfully",
                data: data,
                success: true
            })
        }, err => {
            console.log("error is ", err);
            return res.status(500).json({
                error: "Unable to get contacts",
                error: err,
                success: true
            })
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal Server Error",
            errMessage: error,
            success: false
        })
    }
}


// dashboard


// adminController.getdahsboard = async (req, res) => {
//     try {
//         const contactsLength = await contacts.countDocuments();
//         const videosLength = await videos.countDocuments();
//         const subCategoryLength = await subCategory.countDocuments();
//         const categorysLength = await categorys.countDocuments();
//         const usersLength = await users.countDocuments();

//         const lengths = {
//             contacts: contactsLength,
//             videos: videosLength,
//             subCategory: subCategoryLength,
//             categorys: categorysLength,
//             users: usersLength
//         };

//         return res.status(200).json({ lengths, success: true });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false });
//     }
// };

adminController.getdahsboard = async (req, res) => {
    try {
        const contactsLength = await contacts.countDocuments();
        const videosLength = await videos.countDocuments();
        const subCategoryLength = await subCategory.countDocuments();
        const categorysLength = await categorys.countDocuments();
        const usersLength = await users.countDocuments();

        const details = {
            users: {
                title: "Users List", // Add title for users
                count: usersLength
            },
            contacts: {
                title: "Users Enquery",
                count: contactsLength
            },
            categorys: {
                title: "Category", // Add title for categories
                count: categorysLength
            },
            subCategory: {
                title: "Sub-Category", // Add title for subcategories
                count: subCategoryLength
            },
            videos: {
                title: "Videos", // Add title for videos
                count: videosLength
            }
            // Notifications: {
            //     title: "Notifications", // Add title for videos
            //     count: NotificationsLength
            // },

        };

        return res.status(200).json({
            details,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "Internal Server Error",
            errMessage: error,
            success: false
        });
    }
};


adminController.getSubCategorybyId = async (req, res) => {
    const {
        category_id
    } = req.body;
    console.log("category_id", category_id);
    let data = await subCategory.find({
        category_id: category_id
    }).sort({
        counter: -1
    })
    return res.status(200).json({
        data: data,
        success: true
    })
}


adminController.addSubscriptionToUser = async (req, res) => {
    const {
        user_id,
        planId
    } = req.body;
    if (!user_id && !planId) {
        return res.status(422).json({
            error: "Please provide all the details",
            success: false
        })
    }
    try {
        let userExist = await users.findOne({
            user_id: user_id
        })
        if (userExist) {
            users.updateOne({
                user_id: user_id
            }, {
                $set: {
                    planId: planId
                }
            }, {
                upsert: true
            }).then(() => {
                return res.status(200).json({
                    msg: "Subscrption added Successfully",
                    success: true
                })
            }).catch((error) => {
                return res.status(400).json({
                    error: "Something went wrong while Please try again",
                    success: false
                })
            })
        }
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            error: "Internal Server Error",
            success: false
        })
    }

}

//freshdeal

adminController.addFreshDeal = async (req, res) => {
    const {
        category_id,
        subCategory_id,
        admin_id,
        product_id,
        productName,
        ProductPrice,
        discountPrice,
        productDescription,
        productQuantity,
        avaliability,
        productImages
    } = req.body;
    if (!category_id && !subCategory_id) {
        return res.status(422).json({
            error: "Please provide all the details",
            success: false
        })
    }
    try {

        let fdealId, counter, num
        freshDeal.findOne({}).sort({
            counter: -1
        }).then(count => {
            counter = count ? count.counter + 1 : 1;
            if (counter < 1000) {
                num = String(counter).padStart(4, '0');
            } else {
                num = counter
            }
            fdealId = 'fid' + num;
            let data = {
                category_id,
                subCategory_id,
                fdealId,
                counter: counter,
                admin_id,
                product_id,
                productName,
                ProductPrice,
                discountPrice,
                productDescription,
                productQuantity,
                avaliability,
                productImages: JSON.parse(productImages)
            }
            let freshDeals = new freshDeal(data);
            freshDeals.save().then(() => {
                return res.status(200).json({
                    msg: "freshDeal added Successfully",
                    success: true
                })
            }).catch((error) => {
                console.log("error", error);
                return res.status(400).json({
                    error: "Something went wrong while Please try again",
                    success: false
                })
            })
        })

    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            error: "Internal Server Error",
            success: false
        })
    }

}

adminController.updateFreshDeal = async (req, res) => {
    const {
        category_id,
        subCategory_id,
        admin_id,
        product_id,
        productName,
        ProductPrice,
        discountPrice,
        productDescription,
        productQuantity,
        avaliability,
        productImages,
        fdealId
    } = req.body;
    if (!category_id && !subCategory_id) {
        return res.status(422).json({
            error: "Please provide all the details",
            success: false
        })
    }
    try {
        let data = {
            category_id,
            subCategory_id,
            product_id,
            productName,
            ProductPrice,
            discountPrice,
            productDescription,
            productQuantity,
            avaliability,
            productImages: JSON.parse(productImages)
        }
        freshDeal.updateOne({
            fdealId: fdealId
        }, {
            $set: data
        }, {
            upsert: true
        }).then(() => {
            return res.status(200).json({
                msg: "freshDeal added Successfully",
                success: true
            })
        }).catch((error) => {
            console.log("error", error);
            return res.status(400).json({
                error: "Something went wrong while Please try again",
                success: false
            })
        })
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            error: "Internal Server Error",
            success: false
        })
    }

}


adminController.deleteFreshDeal = async (req, res) => {
    const {
        fdealId
    } = req.body;
    if (!fdealId) {
        return res.status(422).json({
            error: "Please provide the FreshDeal Id to delete",
            success: false
        })
    }
    try {
        freshDeal.deleteOne({
            fdealId: fdealId
        }).then(() => {
            return res.status(200).json({
                msg: "freshDeal Deleted Successfully",
                success: true
            })
        }).catch((error) => {
            console.log("error", error);
            return res.status(400).json({
                error: "Something went wrong while Please try again",
                success: false
            })
        })

    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            error: "Internal Server Error",
            success: false
        })
    }

}


adminController.getFreshDeal = async (req, res) => {
    try {
        // Use aggregate pipeline to perform lookup and projection
        // {
        //     "$match": {category_id: category_id, subCatagory_id: subCatagory_id}
        // },
        // const data = await freshDeal.aggregate([
        //     {
        //         "$lookup": {
        //             "from": "categories",
        //             "localField": "category_id",
        //             "foreignField": "category_id",
        //             "as": "category"
        //         }
        //     },
        //     {
        //         "$lookup": {
        //             "from": "subcategories",
        //             "localField": "subCategory_id",
        //             "foreignField": "subCategory_id",
        //             "as": "subCategory"
        //         }
        //     },
        //     {
        //         "$unwind": "$category"
        //     },
        //     {
        //         "$unwind": "$subCategory"
        //     },
        //     {
        //         "$project": {
        //             "_id": 0,
        //             "category_id": 1,
        //             "subCategory_id": 1,
        //             "category": 1,
        //             "subCategory": 1,
        //         }
        //     }
        // ]);
        const data = await freshDeal.find({}).sort({
            counter: -1
        })
        if (data) {
            return res.status(200).json({
                msg: "Data retrieved successfully",
                data: data,
                success: true
            });
        } else {
            return res.status(400).json({
                msg: "something went while getting data",
                success: false
            });
        }
        // Return the aggregated data in the response

    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({
            error: "Internal Server Error",
            success: false
        });
    }
};

module.exports = adminController;





// ourRecommends
adminController.addourRecommends = async (req, res) => {
    const {
        category_id,
        subCategory_id,
        admin_id
    } = req.body;
    if (!category_id && !subCategory_id) {
        return res.status(422).json({
            error: "Please provide all the details",
            success: false
        })
    }
    try {

        let recommId, counter, num
        ourRecommend.findOne({}).sort({
            counter: -1
        }).then(count => {
            counter = count ? count.counter + 1 : 1;
            if (counter < 1000) {
                num = String(counter).padStart(4, '0');
            } else {
                num = counter
            }
            recommId = 'rid' + num;
            let data = {
                category_id,
                subCategory_id,
                fdealId,
                counter: counter,
                admin_id
            }
            let recommId = new freshDeal(data);
            freshDeals.save().then(() => {
                return res.status(200).json({
                    msg: "freshDeal added Successfully",
                    success: true
                })
            }).catch((error) => {
                console.log("error", error);
                return res.status(400).json({
                    error: "Something went wrong while Please try again",
                    success: false
                })
            })
        })

    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            error: "Internal Server Error",
            success: false
        })
    }

}

adminController.updateourRecommends = async (req, res) => {
    const {
        recommId,
        category_id,
        subCategory_id
    } = req.body;
    if (!recommId) {
        return res.status(422).json({
            error: "Please provide the FreshDeal Id to update",
            success: false
        })
    }
    try {
        let data = {
            category_id,
            subCategory_id,
        }
        ourRecommend.updateOne({
            recommId: recommId
        }, {
            $set: data
        }).then(() => {
            return res.status(200).json({
                msg: "freshDeal updeated Successfully",
                success: true
            })
        }).catch((error) => {
            console.log("error", error);
            return res.status(400).json({
                error: "Something went wrong while Please try again",
                success: false
            })
        })

    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            error: "Internal Server Error",
            success: false
        })
    }

}

adminController.deleteourRecommends = async (req, res) => {
    const {
        recommId
    } = req.body;
    if (!recommId) {
        return res.status(422).json({
            error: "Please provide the FreshDeal Id to delete",
            success: false
        })
    }
    try {
        ourRecommend.deleteOne({
            recommId: recommId
        }).then(() => {
            return res.status(200).json({
                msg: "freshDeal Deleted Successfully",
                success: true
            })
        }).catch((error) => {
            console.log("error", error);
            return res.status(400).json({
                error: "Something went wrong while Please try again",
                success: false
            })
        })

    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            error: "Internal Server Error",
            success: false
        })
    }

}

adminController.getourRecommends = async (req, res) => {
    try {
        ourRecommend.find({}).then((data) => {
            return res.status(200).json({
                msg: "data get Successfully",
                data: data,
                success: true
            })
        }).catch((error) => {
            console.log("error", error);
            return res.status(400).json({
                error: "Something went wrong while Please try again",
                success: false
            })
        })

    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            error: "Internal Server Error",
            success: false
        })
    }

}


//addToCart

adminController.addToCart = async (req, res) => {
    const {
        category_id,
        product_id,
        subCategory_id,
        productName,
        ProductPrice,
        productQuantity,
        productImages,
        avaliability,
        user_id
    } = req.body;
    console.log(req.body);
    if (!category_id && !subCategory_id && !product_id) {
        return res.status(422).json({
            error: "Please provide all the details",
            success: false
        })
    }
    try {
        let dataExist = await cart.findOne({
            product_id: product_id
        })
        if (dataExist) {
            return res.status(400).json({
                error: "data already Exist",
                success: false
            })
        }
        cart.findOne({}).sort({
            counter: -1
        }).then(count => {
            counter = count ? count.counter + 1 : 1;

            let data = {
                category_id,
                subCategory_id,
                product_id,
                counter,
                productName,
                ProductPrice,
                productQuantity,
                productImages: JSON.parse(productImages),
                avaliability,
                user_id
            }
            let carts = new cart(data);
            carts.save().then(() => {
                return res.status(200).json({
                    msg: "item added Successfully",
                    success: true
                })
            }).catch((error) => {
                console.log("error", error);
                return res.status(400).json({
                    error: "Something went wrong while Please try again",
                    success: false
                })
            })
        })

    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            error: "Internal Server Error",
            success: false
        })
    }

}

adminController.removeFromCart = async (req, res) => {
    const {
        product_id,
    } = req.body;
    console.log(req.body);
    if (!product_id) {
        return res.status(422).json({
            error: "Please provide all the details",
            success: false
        })
    }
    try {
        cart.deleteOne({
            product_id: product_id
        }).then(() => {
            return res.status(200).json({
                msg: "item remove Successfully",
                success: true
            })
        }).catch((error) => {
            console.log("error", error);
            return res.status(400).json({
                error: "Something went wrong while Please try again",
                success: false
            })
        })
    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            error: "Internal Server Error",
            success: false
        })
    }

}

adminController.getCartData = async (req, res) => {
    const {
        user_id
    } = req.query;
    try {
        let dataExist = await cart.find({}).sort({
            counter: -1
        })
        if (dataExist) {
            return res.status(200).json({
                error: "data get successfully",
                data: dataExist,
                success: true
            })
        } else {
            return res.status(400).json({
                error: "Something went wrong while Please try again",
                success: false
            })
        }

    } catch (error) {
        console.log("error", error);
        return res.status(500).json({
            error: "Internal Server Error",
            success: false
        })
    }

}



module.exports = adminController;