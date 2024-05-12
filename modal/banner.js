const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    title:{
        type:String
    },
    bannerImage: {
        type: String
    },
    type: {
        type: String,
    },
    id:{
        type:String
    },
    bannerId: {
        type: String,
        // required: true
    },
    description:{
        type:String
    },
    counter: {
        type: Number,
        required: true
    }
},
    {
        timestamps: { createdOn: 'createdAt', updatedOn: 'updatedAt' },
    })

const banner = mongoose.model('banner', schema)
module.exports = banner