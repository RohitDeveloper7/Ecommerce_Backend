const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    fullName: {
        type: String
    },
    admin_id:{
        type:String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    counter:{
        type:Number
    },
    token: {
        type: String
    },
},
    {
        timestamps: { createdOn: 'createdAt', updatedOn: 'updatedAt' },
        
    })

    schema.methods.generateAuthToken = async function () {
        console.log("hello");
        try {
            let token = jwt.sign({ _id: this.id }, process.env.SECRET_KEY);
            //  process.env.SECRET_KEY is used as the secret key to sign the token. It's crucial to keep the secret key secure.
            this.token = token
            await this.save()
            return token
        } catch (err) {
            console.log(err);
        }
    }


const admin = mongoose.model('admin', schema)
module.exports = admin;