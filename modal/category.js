const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    category_id: {
        type: String,
    },
    categoryName: {
        type: String
    },
    catImage: {
        type: String
    },
    catDesc: {
        type: String
    },
    counter: {
        type: Number,
        required: true
    }
},
    {
        timestamps: { createdOn: 'createdAt', updatedOn: 'updatedAt' },
    })

const category = mongoose.model('category', schema)
module.exports = category