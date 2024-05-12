const mongoose  = require('mongoose')
const schema = new mongoose.Schema({
    planName:{
        type:String
    },
    amount:{
        type:Number
    },
    validity:{
        type:Number
    },
    description:{
        type:String
    },
    counter:{
        type:Number
    },
    planId:{
        type:String
    },
},
{
    timestamps:{ createdOn:'createdAt', updatedOn:'updatedAt'},
})

const subscription = mongoose.model('subscription',schema) 
module.exports = subscription 