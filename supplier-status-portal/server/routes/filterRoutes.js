const express = require('express');
const router = express.Router();
const db = require('../DB/DB');

// Route to fetch suppliers based on Bill_Id, Bill_Date, and Bill_Amount
router.get('/api/suppliers', (req, res) => {
    let query = 'SELECT * FROM suppliers WHERE 1=1';
    const params = [];

    const { Bill_Id, Bill_Date, Bill_Amount } = req.query;

    if (Bill_Date && !/^\d{4}-\d{2}-\d{2}$/.test(Bill_Date)) {
        return res.status(400).json({ message: 'Invalid Bill_Date format. Use YYYY-MM-DD.' });
    }

    if (Bill_Id) {
        query += ' AND Bill_Id = ?';
        params.push(Bill_Id);
    }

    if (Bill_Date) {
        query += ' AND Bill_Date = ?';
        params.push(Bill_Date);
    }

    if (Bill_Amount) {
        query += ' AND Bill_Amount = ?';
        params.push(Bill_Amount);
    }

    db.query(query, params, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error retrieving data');
        }
        res.json(result);
    });
});

module.exports = router;