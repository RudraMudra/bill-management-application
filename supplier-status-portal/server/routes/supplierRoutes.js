// const express = require('express');
// const db = require('../DB/DB');
// const authMiddleware = require('../middleware/authMiddleware').default;
// const router = express.Router();

// router.get('/suppliers', authMiddleware, async(req, res)=> {
//     const VendorId = req.session.Vendor_Id;

//     try{
//         const [suppliers] = await db.query("SELECT * FROM suppliers WHERE Vendor_Id = ?", [VendorId]);
//         return res.json(suppliers);
//     } catch(error){
//         return res.status(500).json({message: "Internal server error"});
//     }
// });

// module.exports = router;