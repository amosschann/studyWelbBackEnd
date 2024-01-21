
// Function to handle errors and return a JSON response
function handleServerError(res, err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
}


module.exports = {handleServerError};