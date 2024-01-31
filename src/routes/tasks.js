const express = require('express');
const tasksRouter = express.Router();
const database = require('../helpers/database');
const { handleServerError } = require('../helpers/errorHelper');
const authenticateToken = require('../helpers/tokenHelper');

//with middleware

//get all the user's tasks for the day
tasksRouter.get('/get-tasks', authenticateToken, async (req, res) => {
    // const { user_id } = req.user;
    const { taskDaysId } = req.query;
    try {
        let userQuery = 'SELECT * FROM tasks WHERE taskdays_id = ? ORDER BY start_time ASC';
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

//get all the user's to do tasks for the day
tasksRouter.get('/get-to-do-tasks', authenticateToken, async (req, res) => {
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
                    //if taskday entry exists, use its id to get tasks with mood = null
                    const taskdayId = taskdayResult[0].id;
                    let tasksQuery = 'SELECT * FROM tasks WHERE taskdays_id = ? AND mood IS NULL ORDER BY start_time ASC';
                    database.query(tasksQuery, [taskdayId], (tasksErr, tasksResult) => {
                        if (tasksErr) {
                            handleServerError(res, tasksErr);
                        } else {
                            res.status(200).json({ result: tasksResult });
                        }
                    });
                } else {
                    //if taskday entry does not exist, create a new entry and continue with the same query
                    let createTaskdayQuery = 'INSERT INTO taskdays (user_id, date) VALUES (?, ?)';
                    database.query(createTaskdayQuery, [user_id, date], (createTaskdayErr, createTaskdayResult) => {
                        if (createTaskdayErr) {
                            handleServerError(res, createTaskdayErr);
                        } else {
                            //use the newly created taskday id to get tasks with mood = null
                            const newTaskdayId = createTaskdayResult.insertId;
                            let tasksQuery = 'SELECT * FROM tasks WHERE taskdays_id = ? AND mood IS NULL ORDER BY start_time ASC';
                            database.query(tasksQuery, [newTaskdayId], (tasksErr, tasksResult) => {
                                if (tasksErr) {
                                    handleServerError(res, tasksErr);
                                } else {
                                    res.status(200).json({ result: tasksResult });
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


//get all the user's completed tasks for the day
/*
mood:
0: happy 
1: neutral
2: unhappy
*/
tasksRouter.get('/get-completed-tasks', authenticateToken, async (req, res) => {
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
                    //if taskday entry exists, use its id to get tasks with mood = null
                    const taskdayId = taskdayResult[0].id;
                    let tasksQuery = 'SELECT * FROM tasks WHERE taskdays_id = ? AND mood IS NOT NULL ORDER BY start_time ASC';
                    database.query(tasksQuery, [taskdayId], (tasksErr, tasksResult) => {
                        if (tasksErr) {
                            handleServerError(res, tasksErr);
                        } else {
                            res.status(200).json({ result: tasksResult });
                        }
                    });
                } else {
                    //if taskday entry does not exist, create a new entry and continue with the same query
                    let createTaskdayQuery = 'INSERT INTO taskdays (user_id, date) VALUES (?, ?)';
                    database.query(createTaskdayQuery, [user_id, date], (createTaskdayErr, createTaskdayResult) => {
                        if (createTaskdayErr) {
                            handleServerError(res, createTaskdayErr);
                        } else {
                            //use the newly created taskday id to get tasks with mood = null
                            const newTaskdayId = createTaskdayResult.insertId;
                            let tasksQuery = 'SELECT * FROM tasks WHERE taskdays_id = ? AND mood IS NOT NULL ORDER BY start_time ASC';
                            database.query(tasksQuery, [newTaskdayId], (tasksErr, tasksResult) => {
                                if (tasksErr) {
                                    handleServerError(res, tasksErr);
                                } else {
                                    res.status(200).json({ result: tasksResult });
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


tasksRouter.post('/add-task', authenticateToken, (req, res) => {
    try {
        const {user_id} = req.user;
        const { title, taskDescription, startTime, endTime, date} = req.body;
        //get taskday id
        let taskdayQuery = 'SELECT id FROM taskdays WHERE user_id = ? AND date = ?';
        database.query(taskdayQuery, [user_id, date], (taskdayErr, taskdayResult) => {
            if (taskdayErr) {
                handleServerError(res, taskdayErr);
            } else {
                const taskdayId = taskdayResult[0].id;
                // add to tasks
                let tasksQuery = 'INSERT INTO tasks (taskdays_id, task_title, task_description, start_time, end_time) VALUES (?, ?, ?, ?, ?)';
                database.query(tasksQuery, [taskdayId, title, taskDescription, startTime, endTime], (tasksErr, tasksResult) => {
                    if (tasksErr) {
                        handleServerError(res, tasksErr);
                    } else {
                        res.status(200).json({ result: tasksResult });
                    }
                });
            }
        });
       
        
    } catch (error) {
        handleServerError(res, error);
    }
  });





module.exports = tasksRouter;
