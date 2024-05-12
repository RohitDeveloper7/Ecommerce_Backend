const mongoose  = require('mongoose')
const schema = new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String
    },
    number:{
        type:Number
    },
    message:{
        type:String
    },
    contactId:{
        type:String
    },
    counter:{
        type:Number
    },
},
{
    timestamps:{ createdOn:'createdAt', updatedOn:'updatedAt'},
})

const contact = mongoose.model('contact',schema) 
module.exports = contact 