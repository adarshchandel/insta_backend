const express = require('express');
const UserRouter = express.Router();

const userController = require('../controllers/userController');
const userRepo = new userController();

const auth = require('../../auth/auth');
const multer = require('multer');
const constant = require('../../auth/constant')


var storage = multer.diskStorage({
  destination: ((req, file, cb) => {
    cb(null, 'server/uploads')
  }),
  filename: ((req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + file.originalname)

  })
})

const uploads = multer({ storage: storage })





UserRouter.route('/check').get(auth, (req, res) => {
  res.send('ronda checka rond checka');

})

UserRouter.route('/signup').post(uploads.single('profilePic'), (req, res) => {

  userRepo.userSignup(req.body, req.file).then(user => {
    return res.json({ success: true, data: user })
  }).catch(err => {
    return res.json({ success: false, data: err })
  })
})

UserRouter.route('/login').post((req, res) => {
  userRepo.userLogin(req.body).then(user => {
    return res.json({ success: true, data: user })
  }).catch(err => {
    return res.json({ success: false, data: err })
  })
})


UserRouter.route('/updateUserProfile').post(uploads.single('profilePic'), (req, res) => {
  userRepo.updateUserProfile(req.body,req.file).then(user => {
    return res.json({ success: true, data: user })
  }).catch(err => {
    return res.json({ success: false, data: err })
  })
})

UserRouter.route('/getUserById').post((req, res) => {

  userRepo.getUserById(req.body).then(user => {
    return res.json({ success: true, data: user })
  }).catch(err => {
    return res.json({ success: false, data: err })
  })
})

UserRouter.route('/profileWithPosts').post((req, res) => {

  userRepo.profileWithPosts(req.body).then(user => {
    return res.json({ success: true, data: user })
  }).catch(err => {
    return res.json({ success: false, data: err })
  })
})

UserRouter.route('/myUserList/:id').get((req, res) => {
  userRepo.getUsersList(req.params).then(user => {
    return res.json({ success: true, data: user })
  }).catch(error => {
    return res.json({ success: true, data: error })
  })
})



UserRouter.route('/forget-password').post((req, res) => {
  userRepo.forgetPassword(req.body).then(user => {
    return res.json({ success: true, data: user })
  }).catch(err => {
    return res.json({ success: false, data: err })
  })
})


UserRouter.route('/follow').post(auth,(req,res)=>{
  userRepo.addFollower(req.body).then(user=>{
    res.json({success:true,data:user})
  }).catch(err=>{
    res.json({success:false,data:err})
  })
})

UserRouter.route('/unfollow').post(auth,(req,res)=>{
  userRepo.removeFollower(req.body).then(user=>{
    res.json({success:true,data:user})
  }).catch(err=>{
    res.json({success:false,data:err})
  })
})
module.exports = UserRouter;