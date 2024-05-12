const Users = require('./usersSchema')
const contactUs = require('../modal/contactUs')
require('../db/conn')
const downloads = require('../modal/downloadVideo')
const TemporaryUser = require('../modal/temporaryUser')
const sendMailController = require('../utility/mail')
const bcrypt = require('bcrypt')

let userController = {}

function generateOtp() {
    return Math.floor(1000 + Math.random() * 8000);
}

function findMissingFields(requestBody, requiredField) {
    let missingField = "";
    requiredField.forEach((field) => {
        if(!requestBody[field]) missingField += field + ", "
    });

    return missingField.substring(0, missingField.length-2)
}

//verification
userController.sendOtpToEmail = async (req, res) => {
    const { email } = req.body
    const requiredField = ["email"]
    const missingFields = findMissingFields(req.body, requiredField)
    if(missingFields !== "") return res.status(400).json({success: false, message: "Please provide following fields " + missingFields})
    try {
        let success;
        //generate otp
        const otp = generateOtp()
        // make subject and data for email
        const subject = 'OTP For User Verification - Trip Wire';
        const html = `<p>please use the following One Time Password (OTP):<p><h3>${otp}</h3><p>OTP's are secret. Therefore, do not disclose this to anyone.</p>`;
        // send email
        await sendMailController.sendMail(email, subject, html, async (err, status) => {
            console.log('====>>', status)
            if (status == "Success") {
                success = true
            } else {
                success = false
            }
            //create temporary user
            if (success) {
                const temp_user = await TemporaryUser.create({
                    email: email,
                    emailOtp: otp
                })
            } else {
                return res.status(200).json({ success: false })
            }
            // response
            return res.status(200).json(
                { success: true, otp: otp }
            )
        })
        console.log('success', success)
        console.log('OTP is', otp)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
    }
}

userController.verifyEmail = async (req, res) => {
    const { email, otp } = req.body
    const requiredField = ["email", "otp"]
    const missingFields = findMissingFields(req.body, requiredField)
    if(missingFields !== "") return res.status(400).json({success: false, message: "Please provide following fields " + missingFields})
    try {
        const temp_user = await TemporaryUser.findOne({ email: email })
        if (temp_user) {
            if (temp_user.emailOtp == otp) {
                return res.status(200).json({ success: true })
            } else {
                return res.status(200).json({ success: false })
            }
        } else {
            return res.status(404).json({ message: "User Not Found", success: false })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
    }
}

//password
userController.changePassword = async (req, res) => {
    const { previousPassword, newPassword, user_id } = req.body
    const requiredField = ["previousPassword", "newPassword", "user_id"]
    const missingFields = findMissingFields(req.body, requiredField)
    if(missingFields !== "") return res.status(400).json({success: false, message: "Please provide following fields " + missingFields})

    try {
        //find user
        const user = await Users.findOne({ user_id: user_id })
        //compare normal password with hash password
        const compare = await bcrypt.compare(previousPassword, user.password)
        //update password
        if (compare) {
            const hashPassword = await bcrypt.hash(newPassword, 12)
            await Users.updateOne({ user_id: user_id }, { password: hashPassword })
            return res.status(200).json({ success: true, message: "Password Changed Successfully" })
        } else {
            return res.status(200).json({ success: false, message: "Previous Password Doesn't Match" })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
    }
}

userController.forgotPassword = async (req, res) => {
    const { newPassword, email } = req.body
    const requiredField = ["newPassword", "email"]
    const missingFields = findMissingFields(req.body, requiredField)
    if(missingFields !== "") return res.status(400).json({success: false, message: "Please provide following fields " + missingFields})
    try {
        const hashPassword = await bcrypt.hash(newPassword, 12)
        const updateResponse = await Users.updateOne({ email: email }, { password: hashPassword });
        if (updateResponse.modifiedCount > 0) {
            return res.status(200).json({ sucess: true, message: "Password Updated Successfully" })
        } else {
            return res.status(404).json({ sucess: false, message: "User Not Found" })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
    }
}

//User
userController.getUser = async (req, res) => {
    // const { user_id } = req.params
    try {
        const user = await Users.find({}).sort({counter:-1})
        if (user) {
            return res.status(200).json({ success: true, message: "User data", data: user })
        } else {
            return res.status(404).json({ success: false, message: "User Not Found" })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
    }
}

userController.updateUser = async (req, res) => {
    const { user_id, name } = req.body
    try {
        const user = await Users.findOneAndUpdate({ user_id: user_id }, { userName: name }, { returnDocument: "after" })
        if (user) {
            return res.status(200).json({ success: true, message: "User Updated Successfully" })
        } else {
            return res.status(404).json({ success: false, message: "User Not Found" })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
    }
}

userController.updateEmail = async (req, res) => {
    const { user_id, email } = req.body
    const requiredField = ["email", "user_id"]
    const missingFields = findMissingFields(req.body, requiredField)
    if(missingFields !== "") return res.status(400).json({success: false, message: "Please provide following fields " + missingFields})
    try {
        const user = await Users.findOneAndUpdate({ user_id: user_id }, { email: email }, { returnDocument: "after" })
        if (user) {
            return res.status(200).json({ success: true, message: "User Email Updated Successfully" })
        } else {
            return res.status(404).json({ success: false, message: "User Not Found" })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
    }
}

//register and login
userController.register = async (req, res) => {
    const {username,email,mobile_no,password } = req.body
    const body = req.body
    const requiredField = ["username", "email", "mobile_no","password"]
    const missingFields = findMissingFields(body, requiredField)
    if(missingFields !== "") return res.status(400).json({success: false, message: "Please provide following fields " + missingFields})
    try {
        const lastUser = await Users.findOne({email:email}).sort({ counter: -1 })
        if (lastUser) {
            return res.status(422).json({ error: "User already exist" });
          }
          else{
        //    let sendotp =  await sendOtptoMail(email)
        //    console.log("sendotp",sendotp);
            //hashing password
        const hashPassword = await bcrypt.hash(body.password, 12)
        console.log(lastUser)
        //assiging hash password and counter and make user_id
        body.password = hashPassword
        body["counter"] = lastUser && lastUser.counter ? lastUser.counter + 1 : 1
        if (body["counter"] < 1000) {
            body["user_id"] = "TP" + String(body["counter"]).padStart(4, '0');
        } else {
            body["user_id"] = "TP" + body["counter"]
        }
        //creating new user or registering user
        await Users.create(body)
        //response
        return res.status(200).json({ success: true, message: "User Regsitered Successfully" })
          }
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
    }
}

userController.login = async (req, res) => {
    const { email, password } = req.body
    const requiredField = ["email", "password"]
    const missingFields = findMissingFields(req.body, requiredField)
    if(missingFields !== "") return res.status(400).json({success: false, message: "Please provide following fields " + missingFields})
    try {
        //find user by email
        const user = await Users.findOne({ email: email })
        if (user) {
            //compare hash password
            const isPasswordCorrect = await bcrypt.compare(password, user.password)
            //response
            if (isPasswordCorrect) {
                return res.status(200).json({ success: true, message: "User Login Successfully", data: user })
            } else {
                return res.status(200).json({ success: false, message: "User Login Unsuccessfull", data: null })
            }
        } else {
            return res.status(404).json({ success: false, message: "User Not Exist" })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
    }
}




async function sendOtptoMail(email) {
    const otp = generateOtp()
    console.log("otp is ",otp);
    // make subject and data for email
    const subject = 'OTP For User Register - Bling Movies - OTT - Server';
    const html = `<p>please use the following One Time Password (OTP):<p><h3>${otp}</h3><p>OTP's are secret. Therefore, do not disclose this to anyone.</p>`;
    // send email
    await sendMailController.sendMail(email, subject, html, async (err, status) => {
        console.log('====>>', status)
        if (status == "Success") {
            success = true
        } else {
            success = false
        }
        //create temporary user
        if (success) {
            const temp_user = await TemporaryUser.create({
                email: email,
                emailOtp: otp
            })
        } else {
            return res.status(200).json({ success: false })
        }
        // response
        return res.status(200).json(
            { success: true, otp: otp }
        )
    })
}

// ------------------------------------------------

// userController.signUpByEmail = async (req, res) => {
//     console.log(req.body);
//     const { userName, email } = req.body;

//     try {
//         // Check if the user already exists
//         const userExist = await Users.findOne({ email: email });
//         if (userExist) {
//             return res.status(422).json({ error: "User already exists.", success: false });
//         }

//         // Create a new user instance
//         const newUser = new user({
//             userName: userName,
//             email: email,
//             password: password, // Storing password in plain text
//             status: 'active',
//             counter: 0 // Include the counter field
//         });

//         // Save the new user
//         await newUser.save();

//         // Return success response
//         return res.status(201).json({ msg: "User registered successfully.", success: true });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: "Internal Server Error", errMessage: error.message, success: false });
//     }
// }

// userController.sendOtpForUserVerification = async (req, res) => {
//     const { email } = req.body
//     let randomPassword
//     if (!email) {
//         return res.status(422).json({ msg: "Please fill all the details.", success: false })
//     }
//     try {
//         const userExist = await Users.findOne({ email: email })
//         console.log("userExist", userExist);
//         if (userExist) {
//             if (userExist.status == 'active') {
//                 return res.status(422).json({ msg: "User already exist", success: false })
//             }
//             else {
//                 console.log("inside else userExist");
//                 randomPassword = Math.floor(1000 + Math.random() * 9000);
//                 let isMailSend = await sendOtp(randomPassword, email)
//                 console.log("isMailSend", isMailSend);
//                 if (isMailSend) {
//                     console.log("inside the isMailSend");
//                     let update = {
//                         otp: randomPassword
//                     }
//                     Users.updateOne({ email: email }, { $set: update }).then(data2 => {
//                         return res.status(200).json({ msg: "OTP send successfully", success: true })
//                     }, err => {
//                         return res.status(500).json({ msg: "Unable to send otp", success: false })
//                     })
//                 } else {
//                     console.log(">>>>>>>>>>");
//                     return res.status(500).json({ msg: 'Oops Something went wrong to send otp', success: false })
//                 }

//             }
//         } else {
//             console.log("inside else not userExist");
//             let user_id, counter, num
//             Users.findOne({}).sort({ counter: -1 }).then(count => {
//                 counter = count ? count.counter + 1 : 1;
//                 if (counter < 1000) {
//                     num = String(counter).padStart(4, '0');
//                 } else {
//                     num = counter
//                 }
//                 user_id = 'TP' + num;
//                 const newUser = new user({ user_id, email, counter })
//                 newUser.save().then(async (data) => {
//                     if (data) {
//                         randomPassword = Math.floor(1000 + Math.random() * 9000);
//                         let isMailSend = await sendOtp(randomPassword, email)
//                         console.log("isMailSend", isMailSend);
//                         if (isMailSend) {
//                             let update = {
//                                 otp: randomPassword
//                             }
//                             Users.updateOne({ email: email }, { $set: update }).then(data2 => {
//                                 return res.status(200).json({ msg: "OTP send successfully", otp: randomPassword, success: true })
//                             }, err => {
//                                 return res.status(400).json({ msg: "Unable to send otp", success: false })
//                             })
//                         } else {
//                             console.log("<<<<<<<<<<<<<<<<<");
//                             return res.status(400).json({ msg: 'Oops Something went wrong to send otp', success: false })
//                         }
//                     }
//                 })
//             })
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ error: "Internal Server Error", success: false })
//     }
// }

// async function sendOtp(randomPassword, email) {
//     console.log("inside the sendotp", randomPassword, email);
//     const subject = 'OTP For User Verification - Trip Wire';
//     const html = `<p>please use the following One Time Password (OTP):<p><h3>${randomPassword}</h3><p>OTP's are secret. Therefore, do not disclose this to anyone.</p>`;

//     try {
//         const info = await sendMailController.sendMail(email, subject, html);
//         console.log("Email sent successfully", info);
//         let update = {
//             otp: randomPassword
//         };
//         await Users.updateOne({ email: email }, { $set: update });
//         console.log("OTP updated successfully");
//         return true; // Indicate success
//     } catch (err) {
//         console.error("Error sending OTP:", err);
//         return false; // Indicate failure
//     }
// }

// userController.verifyOTPforRegisteration = async (req, res) => {
//     const { email, OTP } = req.body
//     if (!email || !OTP) {
//         return res.status(400).json({ error: "please fill all the details", success: false })
//     }
//     const userExist = await Users.findOne({ email: email })
//     const storedOtp = await options.findOne({ email: email })
//     if (userExist) {
//         if (OTP == storedOtp.onEmail) {
//             Users.updateOne({ email: email }, { $set: { verified: true } }).then(data => {
//                 return res.status(200).json({ msg: "Verified", success: true })
//             }, err => {
//                 return res.status(500).json({ err: err, success: false })
//             })
//         } else {
//             return res.status(500).json({ err: "OTP Does not Match", success: false })
//         }
//     } else {
//         return res.status(500).json({ err: 'User Not Found', success: false })
//     }
// }


// userController.verifyAndChangePassword = async (req, res) => {
//     const { email, OTP, newPassword, confirmPassword } = req.body
//     if (!email || !OTP || !newPassword || !confirmPassword) {
//         return res.status(400).json({ error: "please fill all the details", success: false })
//     }
//     try {
//         if (newPassword != confirmPassword) {
//             return res.status(422).json({ error: "Password are not matching", success: false })
//         }
//         const userExist = await Users.findOne({ email: email })
//         if (userExist) {
//             if (Number(OTP) == userExist.otp) {
//                 let update = {
//                     password: newPassword
//                 };
//                 Users.updateOne({ email: email }, { $set: update }).then((data) => {
//                     return res.status(200).json({ msg: "Password changed successfully", success: true })
//                 })
//             } else {
//                 return res.status(500).json({ err: "Incorrect OTP", success: false })
//             }
//         } else {
//             return res.status(422).json({ error: "User Does Not Exist", success: false })
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ error: "Internal Server Erroor", errMessage: error, success: false })
//     }
// }

// userController.login = async (req, res) => {
//     const { email, password } = req.body
//     if (!email || !password) {
//         return res.status(400).json({ error: "please fill all the details", success: false })
//     }
//     try {
//         const userlogin = await Users.findOne({ email: email })
//         console.log(userlogin);
//         if (userlogin.status == "active") {
//             if (password !== userlogin.password) {
//                 res.status(400).json({ erroe: "Invalid credential", success: false })
//             } else {
//                 const token = await userlogin.generateAuthToken()
//                 res.status(200).json({
//                     message: "User signin successfully", token: token, user_id: userlogin.user_id, userName: userlogin.userName, success: true
//                 })
//             }
//         } else {
//             res.status(400).json({ erroe: "Invalid credential", success: false })
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ error: "Internal Server Error", errMessage: error, success: false })
//     }
// }

userController.getUserList = async (req, res) => {
    try {
        let data = await Users.find({}).sort({ createdAt: -1 })
        return res.status(200).json({ userList: data, success: true })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Erroor", errMessage: error, success: false })
    }
}

userController.updateMyProfile = async (req, res) => {
    const { userName, email, password } = req.body
    if (!email) {
        return res.status(422).json({ error: "Please fill all the details." })
    }
    try {
        let update = { email: email }
        if (userName) {
            update['userName'] = userName
        }
        if (password) {
            // update['password'] = PassWord
            update['password'] = password
        }
        console.log(update);
        Users.updateOne({ email: email }, { $set: update }).then(data => {
            return res.status(200).json({ msg: "Updated Succesfully", success: true })
        }, err => {
            return res.status(500).json({ err: err, success: false })
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Erroor", errMessage: error, success: false })
    }
}

userController.addContactUs = async (req, res) => {
    const { fullName, email, message } = req.body
    if (!fullName || !email || !message) {
        return res.status(422).json({ error: "Please fill all the details." })
    }
    try {
        contactUs.insertMany({ fullName: fullName, email: email, message: message }).then(data => {
            return res.status(200).json({ msg: "added Successfully", success: true })
        }, err => {
            return res.status(500).json({ msg: "failed", success: false })
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Erroor", errMessage: error, success: false })
    }
}

userController.deleteUser = async (req, res) => {
    const { user_id } = req.body
    if (!user_id) {
        return res.status(422).json({ error: "Please fill all the details." })
    }
    try {
        let data = await Users.deleteOne({ user_id: user_id })
        if (data.acknowledged) {
            return res.status(200).json({ msg: "User has been deleted Successfully", success: true })
        } else {
            return res.status(200).json({ error: "Error in deleting User", success: false })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Erroor", errMessage: error, success: false })
    }
}

userController.downloadVideo = async (req, res) => {
    const { userName, userDetail, videoDetail } = req.body
    try {
        let counter, downloadId, num
        let count = downloads.findOne({}).sort({ counter: -1 })
        counter = count ? count.counter + 1 : 1;
        if (counter < 1000) {
            num = String(counter).padStart(4, '0');
        }
        else {
            num = counter
        }
        downloadId = 'downloadId' + num
        downloads.updateOne({ downloadId: downloadId }, { userName, userDetail, videoDetail, counter, downloadId }, { upsert: true }).then(resolve => {
            return res.status(200).json({ msg: "data added successfully", success: true })
        }, err => {
            console.log("error is ", err);
            return res.status(500).json({ error: err, success: true })
        })
    } catch (error) {
        return res.status(500).json({ error: error, success: true })
    }

}

userController.getdownloadVideodeatail = async (req,res) => { 
    const {downloadId} = req.body
    console.log("downloadId first ",downloadId);
    try {
    downloads.find({downloadId:downloadId}).sort({counter: -1}).then((data)=>{
        return res.status(200).json({msg:"data get succesfully", data:data})
    })
    } catch (error) {
        
    }

} 


// userController.forgetPassword = async (req,res) =>{
//     const {email} = req.body
//     const userExist = await Users.findOne({email:email}).sort({ counter: -1 })
//     if (!userExist) {
//         return res.status(422).json({ error: "User are not registerd with this email" , success:false});
//       }
//       else{
//         const otp = generateOtp()
//         console.log("otp is ",otp);
//         const subject = 'OTP For User Forget Password - Bling Movies - OTT - Server';
//         const html = `<p>please use the following One Time Password (OTP):<p><h3>${otp}</h3><p>OTP's are secret. Therefore, do not disclose this to anyone.</p>`;
//         await sendMailController.sendMail(email, subject, html, async (err, status) => {
//             console.log('====>>', status)
//             if (status == "Success") {
//                 success = true
//             } else {
//                 success = false
//             }
//             if (success) {
//                 const temp_user = await TemporaryUser.create({
//                     email: email,
//                     emailOtp: otp
//                 })
//             } else {
//                 return res.status(200).json({ success: false })
//             }
//             return res.status(200).json(
//                 { success: true, otp: otp }
//             )
//         })
//         console.log('OTP is', otp)
//       }
// }


userController.sendOtpForforgetPassword = async (req, res) => {
    const { email } = req.body;
    const userExist = await Users.findOne({ email: email });

    if (!userExist) {
        return res.status(422).json({ error: "User not Found", success: false });
    }
        
    try {
        const otp = generateOtp();
        console.log("otp is ", otp);
        const subject = 'OTP For User Forget Password - Bling Movies - OTT - Server';
        const html = `<p>Please use the following One Time Password (OTP):<p><h3>${otp}</h3><p>OTP's are secret. Therefore, do not disclose this to anyone.</p>`;
    
        const emailSent = await sendMail(email, subject, html);
    
        if (emailSent) {
            await TemporaryUser.create({
                email: email,
                emailOtp: otp
            });
            return res.status(200).json({ msg:"otp send successfully", success: true, otp: otp });
        } else {
            return res.status(400).json({ error: "Failed to send email", success: false });
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error", success: false });
    }

};


userController.sendOtpregisterByEmail = async (req, res) => {
    const { username , email } = req.body;

    try {
        const userExist = await Users.findOne({ email: email });
        if (userExist) {
            return res.status(422).json({ error: "User are registered with this email", success: false });
        }
        else{
            const otp = generateOtp();
            console.log("otp is ", otp);
            const subject = 'OTP For User Registered Email - Bling Movies - OTT - Server';
            const html = `<p>Please use the following One Time Password (OTP):<p><h3>${otp}</h3><p>OTP's are secret. Therefore, do not disclose this to anyone.</p>`;
        
            const emailSent = await sendMail(email, subject, html);
        
            if (emailSent) {
                 TemporaryUser.create({
                    email: email,
                    emailOtp: otp
                }).then(()=>{
                    return res.status(200).json({ msg:"otp send successfully", success: true, otp: otp })
                    // Users.updateOne({email:email}, {$set:{username,email}},{upsert:true}).then(()=>{
                    // })
                })
            } else {
                return res.status(400).json({ error: "Failed to send email", success: false });
            }
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal server error", success: false });
    }
 
   
};


userController.verifyOtp = async (req, res) => {
    const { username , email, Otp } = req.body;

    const userExist = await TemporaryUser.findOne({ email: email });
    if (userExist?.emailOtp == Otp) {
        Users.updateOne({email:email}, {$set:{username,email}},{upsert:true}).then(()=>{
        return res.status(422).json({ error: "User are Verified Successfully", success: false });
     })
    }
   else {
        return res.status(400).json({ error: "otp does not match please try again", success: false });
    }
};


async function sendMail(email, subject, html) {
    return new Promise((resolve, reject) => {
        sendMailController.sendMail(email, subject, html, (err, status) => {
            if (err) {
                console.error('Error sending email:', err);
                resolve(false);
            } else {
                console.log('Email status:', status);
                resolve(status === 'Success');
            }
        });
    });
}

module.exports = userController