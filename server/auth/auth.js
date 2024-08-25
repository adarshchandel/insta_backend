const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../keys')
const mongoose = require('mongoose');
const User = require('../model/user');


module.exports = (req, res, next) => {
    const { authorization } = req.headers
    if (!authorization) {
        return res.status(401).json({ err: 'User not loggedin' , status : false })
    }
    const token = authorization.replace("Bearer ", "")
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ err: 'User not loggedin' , status : false})
        }
        const { _id } = user
        User.findById(_id).then(userdata => {
            req.userdata = userdata
            next()  
        })
    })

}