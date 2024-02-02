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

//get journal entry
journalsRouter.get('/get-journal-entry', authenticateToken, async (req, res) => {
    const { user_id } = req.user;
    const { date } = req.query;

    try {
        //check if the current date has a taskday entry
        let taskdayQuery = 'SELECT id FROM taskdays WHERE user_id = ? AND date = ?';
        database.query(taskdayQuery, [user_id, date], (taskdayErr, taskdayResult) => {
            if (taskdayErr) {
                handleServerError(res, taskdayErr);
            } else {
                if (taskdayResult.length > 0) {
                    //if taskday entry exists, use its id to get journal
                    const taskdayId = taskdayResult[0].id;
                    let journalQuery = 'SELECT * FROM journals WHERE taskdays_id = ?';
                    database.query(journalQuery, [taskdayId], (journalErr, journalResult) => {
                        if (journalErr) {
                            handleServerError(res, journalErr);
                        } else {
                            res.status(200).json({ result: journalResult });
                        }
                    });
                } else {
                    //if taskday entry does not exist, create a new entry and continue with the same query
                    let createTaskdayQuery = 'INSERT INTO taskdays (user_id, date) VALUES (?, ?)';
                    database.query(createTaskdayQuery, [user_id, date], (createTaskdayErr, createTaskdayResult) => {
                        if (createTaskdayErr) {
                            handleServerError(res, createTaskdayErr);
                        } else {
                            //use the newly created taskday id get journal
                            const newTaskdayId = createTaskdayResult.insertId;
                            let journalQuery = 'SELECT * FROM tasks WHERE taskdays_id = ?';
                            database.query(journalQuery, [newTaskdayId], (journalErr, journalResult) => {
                                if (journalErr) {
                                    handleServerError(res, journalErr);
                                } else {
                                    res.status(200).json({ result: journalResult });
                                }
                            });
                        }
                    });
                }
            }
        });
    } catch (err) {
        handleServerError(res, err);
    }
});

//update || add journal entry
/* 
get taskdays id -> get journals id
if journals id -> update journals query
if not journals id -> add journals query
*/
journalsRouter.post('/update-journal-entry', authenticateToken, async (req, res) => {
    const { user_id } = req.user;
    const { date, gratitude, general, moodDescription, mood } = req.body;

    try {
        //check if the current date has a taskday entry
        let taskdayQuery = 'SELECT id FROM taskdays WHERE user_id = ? AND date = ?';
        database.query(taskdayQuery, [user_id, date], (taskdayErr, taskdayResult) => {
            if (taskdayErr) {
                handleServerError(res, taskdayErr);
            } else {
                if (taskdayResult.length > 0) {
                    //use taskday id to check if journal exists 
                    const taskdayId = taskdayResult[0].id;
                    console.log(taskdayId)
                    let journalQuery = 'SELECT * FROM journals WHERE taskdays_id = ?';
                    database.query(journalQuery, [taskdayId], (journalErr, journalResult) => {
                        if (journalErr) {
                            handleServerError(res, journalErr);
                        } else {
                            if (journalResult.length > 0) {
                                //update journal entry
                                const journalId = journalResult[0].id;
                                let updateJournalQuery = 'UPDATE journals SET gratitude = ?, general = ?, mood = ?, overallmood = ? WHERE id = ?';
                                database.query(updateJournalQuery, [gratitude, general, moodDescription, mood, journalId], (updateJournalErr, updateJournalResult) => {
                                    if (updateJournalErr) {
                                        handleServerError(res, updateJournalErr);
                                    } else {
                                        res.status(200).json({ result: updateJournalResult});
                                    }
                                });
                            } else {
                                //create new journal entry
                                let addJournalQuery = 'INSERT INTO journals (gratitude, general, mood, overallmood, taskdays_id) VALUES (?, ?, ?, ?, ?)';
                                database.query(addJournalQuery, [gratitude, general, moodDescription, mood, taskdayId], (addJournalErr, addJournalResult) => {
                                    if (addJournalErr) {
                                        handleServerError(res, addJournalErr);
                                    } else {
                                        res.status(200).json({ result: addJournalResult});
                                    }
                                });
                            }
                        }
                    });
                } 
            }
        });
    } catch (err) {
        handleServerError(res, err);
    }
});

module.exports = journalsRouter;
