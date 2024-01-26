const express = require('express');
const journalsRouter = express.Router();
const database = require('../helpers/database');
const { handleServerError } = require('../helpers/errorHelper');
const authenticateToken = require('../helpers/tokenHelper');

//with middleware

//get all the user's tasks for the day
journalsRouter.get('/get-journal-available', authenticateToken, async (req, res) => {
    // const { user_id } = req.user;
    const { taskDaysId } = req.query;
    try {
        let userQuery = 'SELECT COUNT(*) AS journalCount FROM journals WHERE taskdays_id = ?';
        database.query(userQuery, [taskDaysId], (err, result) => {
            if (err) {
                handleServerError(res, err);
            } else {
                res.status(200).json({ result });
            }
        });
    } catch (err) {
        handleServerError(res, err);
    }
});

module.exports = journalsRouter;
