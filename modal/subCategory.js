const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    category_id: {
        type: String
    },
    subCategory_id: {
        type: String,
    },
    image: {
        type: String
    },
    subCategoryName: {
        type: String
    },
    subDisc: {
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

const subCategory = mongoose.model('subCategory', schema)
module.exports = subCategory