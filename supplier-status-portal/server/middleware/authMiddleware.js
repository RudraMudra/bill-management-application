// const authMiddleware = (req, res, next) => {
//     if(!req.session.Vendor_Id){
//         return res.status(401).json({success: false, message: "Unauthorized access"});
//     }
//     next(); // Call next() if Vendor_Id exists to proceed to the next middleware
// };

// module.exports = authMiddleware;