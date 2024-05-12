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
    recommId: {
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

const ourRecommend = mongoose.model('ourRecommend', schema)
module.exports = ourRecommend