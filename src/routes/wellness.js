const express = require('express');
const wellnessRouter = express.Router();
const database = require('../helpers/database');
const { handleServerError } = require('../helpers/errorHelper');
const authenticateToken = require('../helpers/tokenHelper');

//with middleware

//get all the user's tasks for the day
wellnessRouter.get('/get-wellness', authenticateToken, async (req, res) => {
    const { user_id } = req.user;
    
    let predeterminedWellness = [
        { title: 'Take a Walk', description: 'Take a Break. Go for a short 20 minutes walk around your neighbourhood to take a breather.' },
        { title: 'Read a Book', description: 'Pick up a book you enjoy and spend some time reading to relax and unwind for 20 minutes.' },
        { title: 'Watch a TV series', description: "Find or continue watching your favourite shows. Don't forget the popcorn and relax for the next 20 minutes." },
        { title: 'Listen to Music', description: 'Put on your favorite playlist or album and let the music transport you to a place of relaxation and enjoyment. Let loose for 20 minutes.' },
        { title: 'Short Exercise', description: "Engage in a 20-minute workout session, focusing on either cardio or strength training exercises that you may have overlooked recently. Take this opportunity to prioritize your physical well-being and get back into your fitness routine." }
    ];

    try {
        let wellnessQuery = 'SELECT * FROM wellness WHERE user_id = ?';
        database.query(wellnessQuery, [user_id], (err, result) => {
            if (err) {
                handleServerError(res, err);
            } else {
                if (result.length === 0) {
                    //if no wellness entries found, insert predetermined wellness activities
                    let insertQueries = predeterminedWellness.map(activity => {
                        return 'INSERT INTO wellness (user_id, title, description) VALUES (?, ?, ?)';
                    });

                    let insertValues = predeterminedWellness.map(activity => [user_id, activity.title, activity.description]);

                    //chain insert query
                    database.query(insertQueries[0], insertValues[0], (insertErr1, insertResult1) => {
                        if (insertErr1) {
                            handleServerError(res, insertErr1);
                        } else {
                            //execute the next insert query... 
                            database.query(insertQueries[1], insertValues[1], (insertErr2, insertResult2) => {
                                if (insertErr2) {
                                    handleServerError(res, insertErr2);
                                } else { //next
                                    database.query(insertQueries[2], insertValues[2], (insertErr3, insertResult3) => {
                                        if (insertErr3) {
                                            handleServerError(res, insertErr3);
                                        } else { //next
                                            database.query(insertQueries[3], insertValues[3], (insertErr4, insertResult4) => {
                                                if (insertErr4) {
                                                    handleServerError(res, insertErr4);
                                                } else { //next
                                                    database.query(insertQueries[4], insertValues[4], (insertErr5, insertResult5) => {
                                                        if (insertErr5) {
                                                            handleServerError(res, insertErr5);
                                                        } else { //next
                                                            //all activities inserted successfully, query again for the results
                                                            database.query(wellnessQuery, [user_id], (queryErr, queryResult) => {
                                                                if (queryErr) {
                                                                    handleServerError(res, queryErr);
                                                                } else {
                                                                    res.status(200).json({ result: queryResult });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    //if wellness entries found, return the result
                    res.status(200).json({ result });
                }
            }
        });
    } catch (err) {
        handleServerError(res, err);
    }
});


//update wellness tab
wellnessRouter.post('/update-wellness', authenticateToken, async (req, res) => {
    const { user_id } = req.user;
    const {title, description, wellness_id} = req.body;

    try {
        //check if the current date has a taskday entry
        let updateWellnessQuery = 'UPDATE wellness SET title = ?, description = ? WHERE id = ?';
        database.query(updateWellnessQuery, [title, description, wellness_id], (updateWellnessErr, updateWellnessResult) => {
            if (updateWellnessErr) {
                handleServerError(res, updateWellnessErr);
            } else {
                res.status(200).json({ result: updateWellnessResult});
            }
        });
    } catch (err) {
        handleServerError(res, err);
    }
});



module.exports = wellnessRouter;
