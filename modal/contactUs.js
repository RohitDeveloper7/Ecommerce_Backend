const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    fullName: {
        type: String
    },
    email: {
        type: String
    },
    message: {
        type: String
    }
},
    {
        timestamps: { createdOn: 'createdAt', updatedOn: 'updatedAt' },
    })

const contactUs = mongoose.model('contactUs', schema)
module.exports = contactUs