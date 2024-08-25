const express =require('express');
const post = require('./postRoutes');
const user = require('./userRoutes');
const message = require('./mesageRoutes');
const notification = require('./notificationRoutes')

const route =express.Router();
console.log('router working');


route.use('/post',post);
route.use('/user',user);
route.use('/message',message)
route.use('/notification',notification)


module.exports =route;