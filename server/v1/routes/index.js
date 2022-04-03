const express =require('express');
const post = require('./postRoutes');
const user = require('./userRoutes');
const message = require('./mesageRoutes')
const route =express.Router();
console.log('router working');


route.use('/post',post);
route.use('/user',user);
route.use('/message',message)


module.exports =route;