const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    user_id: {
        type: String,
    },
    username: {
        type: String
    },
    mobile_no: {
        type: String,
    },
    email: {
        type: String,
        required: true,
    },
    counter: {
        type: Number 
    },
    status: {
        type: String,
        default: "active"
    },
    password: {
        type: String
    },
    token: {
        type: String
    },
    planId:{
        type:String,
        default : null
    },
    playlist: []
},
    {
        timestamps: { createdOn: 'createdAt', updatedOn: 'updatedAt' },
    })
  

const Users = mongoose.model('users', schema)
module.exports = Users