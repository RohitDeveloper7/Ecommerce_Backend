const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    category_id: {
        type: String,
    },
    admin_id: {
        type: String,
    },
    subCategory_id: {
        type: String
    },
    product_id: {
        type: String
    },
    productName: {
        type: String
    },
    ProductPrice: {
        type: Number
    },
    discountPrice: {
        type: Number
    },
    productDescription: {
        type: String
    },
    productQuantity: {
        type: Number
    },
    avaliability: {
        type: String
    },
    productImages: {
        type: []
    },
    fdealId: {
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

const freshDeal = mongoose.model('freshDeal', schema)
module.exports = freshDeal