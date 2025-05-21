const express = require('express'); 
const router = express.Router();
const authRouter = require('./auth');

router.get('/', (req, res) => { 
    res.json({ message: 'Welcome to StudyNest API' }); 
});

router.use('/auth', authRouter);

module.exports = router;