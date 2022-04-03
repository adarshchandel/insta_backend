const express = require('express');
const messageRouter = express.Router();
const messageController = require('../controllers/messageController');
const messageRepo = new messageController();


messageRouter.route('/convo').post((req,res)=>{
    messageRepo.convoList(req.body).then((convo)=>{
      return res.json({success:true,data:convo.data,totalCount : convo.count})
   }).catch(error=>{
      return res.json({success:false,data:error})
   })
})



module.exports = messageRouter;