// const express = require('express');
// const db = require('../DB/DB');
// const router = express.Router();

// router.post('/login', async(req, res) => {
//     const {user_id, password} = req.body;
//     // Check if user_id and password are provided

//     try{
//         const [user] = await db.query("SELECT * FROM user_account where user_id = ? and password = ?", [user_id, password]);

//         if(user.length > 0){
//             req.session.Vendor_Id = user[0].Vendor_Id; // Store Vendor_Id in session
//             return res.json({success: true, Vendor_Id: user[0].Vendor_Id});
//         } else {
//             return res.json({success: false, message: "Invalid user_id or password"});
//         }
//     } catch(error){
//         return res.status(500).json({message: "Internal server error"});
//     }
// });

// module.exports = router;