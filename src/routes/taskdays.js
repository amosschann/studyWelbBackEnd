const express = require('express');
const taskDaysRouter = express.Router();
const database = require('../helpers/database');
const { handleServerError } = require('../helpers/errorHelper');
const authenticateToken = require('../helpers/tokenHelper');

//with middleware

//get all the user's taskdays within the given month 
/*
month is represented by integers - 1 = Jan, 12 = Dec
join on tasks and journals table to ensure that there exists one row with the taskdays id 
used to mark calendar - filter out those dates that have no tasks or journal
*/
taskDaysRouter.get('/get-user-taskdays', authenticateToken, async (req, res) => {
    const { user_id } = req.user;
    const { month, year } = req.query;
    try {
        let userQuery = `
            SELECT td.*
            FROM taskdays AS td
            LEFT JOIN tasks AS t ON td.id = t.taskdays_id
            LEFT JOIN journals AS j ON td.id = j.taskdays_id
            WHERE td.user_id = ? 
            AND MONTH(td.date) = ? 
            AND YEAR(td.date) = ?
            AND (
                EXISTS (SELECT 1 FROM tasks WHERE taskdays_id = td.id) 
                OR 
                EXISTS (SELECT 1 FROM journals WHERE taskdays_id = td.id)
            );
        `;
        database.query(userQuery, [user_id, month, year], (err, result) => {
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

module.exports = taskDaysRouter;
