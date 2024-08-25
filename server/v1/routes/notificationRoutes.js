const express = require('express');
const notiRouter = express.Router();
const notificationController = require('../controllers/notificationController');
const notiRepo = new notificationController();


notiRouter.route('/list').post((req,res)=>{
    notiRepo.notifictionList(req.body).then((noti)=>{
      return res.json({success:true,data:noti})
   }).catch(error=>{
      return res.json({success:false,data:error})
   })
})



module.exports = notiRouter;