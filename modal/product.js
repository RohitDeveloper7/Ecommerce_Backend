const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    category_id: {
        type: String,
        // required: true
    },
    admin_id: {
        type: String,
    },
    subCategory_id: {
        type: String,
        // required: true
    },
    productName: {
        type: String
    },
    ProductPrice: {
        type: String
    },
    discountPrice: {
        type: String
    },
    productQuantity: {
        type: String
    },
    productDescription: {
        type: String
    },
    avaliability: {
        type: String
    },
    productImages:{
        type: []
    },
    product_id: {
        type: String,
        required: true
    },
    counter: {
        type: Number,
        required: true
    },
},
    {
        timestamps: { createdOn: 'createdAt', updatedOn: 'updatedAt' },
    })

const product = mongoose.model('product', schema)
module.exports = product