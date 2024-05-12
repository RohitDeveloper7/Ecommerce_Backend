const mongoose  = require('mongoose')
const schema = new mongoose.Schema({
    userName:{
        type:String
    },
    userDetail:{
        type:Number
    },
    videoDetail:{
        type:Number
    },
    counter:{
        type:Number
    },
    downloadId:{
        type:String
    },
},
{
    timestamps:{ createdOn:'createdAt', updatedOn:'updatedAt'},
})

const download = mongoose.model('download',schema) 
module.exports = download 