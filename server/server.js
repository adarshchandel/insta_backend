const express = require('express');
const app = express();
app.use(express.json());
let body_parser = require('body-parser');
const v1 = require('./v1/routes');
const http = require('http').createServer(app);
const path = require('path');
const cors = require('cors');
var morgan = require('morgan');
const { rateLimit } = require("express-rate-limit");
const color = require("colors");
const serverLess = require("serverless-http");

function socket (){
   return io = require('socket.io')(http, {
        cors: {
            origin: '*',
            transports: ['websocket'],
            credential: true
        }
    });
}
const limiter = rateLimit({
    windowMs : 3 * 60 *  1000 , // 3 minutes
    limit : 50,
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false,
})

require('./mongo');

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
app.use(cors());
app.options('*', cors());
app.use(limiter)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type,x-requested-with, Accept,Authorization,token");
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT');
    next();
});

let port = process.env.PORT || 8000


let server = http.listen(port, () => {
    console.log(color.cyan('server started on ',port))
})


app.use('/v1', v1);

app.all("*",(req , res)=>{
    console.log(color.red(`NOT FOUND :: ${req.originalUrl}`))
    return res.status(404).send({ success :  false , message : `Not found on the server...` , data : req.originalUrl })
})
// require('./socket')
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extented: true }));
app.use('/static', express.static(path.join(__dirname, "/uploads")));


// exports.globalIo = socket()
require('../server/v1/socket').socket(socket())