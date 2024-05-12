const express = require('express')
const app = express()
const path = require('path')
const dotenv = require('dotenv')
const cors = require('cors')
const bodyParser = require('body-parser');
dotenv.config()

require('./db/conn')

const corsOptions = {
    origin: '*', 
    credentials: true,
    optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));

const PORT = process.env.PORT
const httpServer = require('http').createServer(app); 


// app.use('/admin/public/admin_image_upload', express.static(path.join(__dirname, 'admin', 'public', 'admin_image_upload')));
app.use('/uploads', express.static('uploads'))
const imageUploadPath = path.join(__dirname, 'public', 'admin_image_upload');
app.use('/public/admin_image_upload', express.static(imageUploadPath));
const videoUploadPath = path.join(__dirname, 'public', 'admin_video_upload');
app.use('/public/admin_video_upload', express.static(videoUploadPath));


app.use(bodyParser.urlencoded({ limit: '50mb', parameterLimit: 500000, extended: true }));
app.use(bodyParser.json());
// app.use(express.json());


httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`));

const user = require('./users/userRoute')
const admin = require('./admin/adminRoute')

app.use('/admin', admin);
app.use('/user', user);

app.get('/', (req, res) => {
    res.send("Welcome to Bling Movies OTT")
})