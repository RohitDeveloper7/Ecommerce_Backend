const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    user_id:{
        type: String,
    },
    category_id: {
        type: String,
        // required: true
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
    productQuantity: {
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

const cart = mongoose.model('cart', schema)
module.exports = cart