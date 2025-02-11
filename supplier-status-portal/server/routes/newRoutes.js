const express = require('express');
const router = express.Router();
const db = require('../DB/DB');

router.get('/api/suppliers/:VendorId', (req, res) => {
    const { VendorId } = req.params;
    const sanitizedVendorId = VendorId.trim(); // Remove any extra spaces or newline characters
    console.log('Sanitized VendorId:', sanitizedVendorId);

    db.query('SELECT * FROM suppliers WHERE Vendor_Id = ?', [sanitizedVendorId], (err, result) => {
        if (err) {
            console.log('Error:', err);
            res.status(500).send("Error fetching vendor bills");
        } else {
            res.json(result);
        }
    });
});

module.exports = router;