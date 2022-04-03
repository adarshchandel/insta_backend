const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../keys')
const mongoose = require('mongoose');
const User = require('../model/user');


module.exports = (req, res, next) => {
    const { authorization } = req.headers
    if (!authorization) {
        return res.status(401).json({ err: 'you must be logged in' })
    }
    const token = authorization.replace("Bearer ", "")
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ err: 'you must be logged in' })
        }
        const { _id } = user
        User.findById(_id).then(userdata => {
            req.user = userdata
            next()  
        })



    })

}