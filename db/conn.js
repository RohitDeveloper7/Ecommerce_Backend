const mongoose = require('mongoose')
mongoose.set("strictQuery", false);

const databaseUrl = process.env.LOCALDB;
console.log("databaseUrl",databaseUrl);
options = {
    // "auth": {
    //     "authSource": "admin"
    // },
    // "user": "blingUser",
    // "pass": "blingUser123"
    family: 4
};
mongoose.connect(databaseUrl,options).then(() => {
    console.log('database connection successful')
}).catch((err) => {
    console.log("no connection", err)
})

