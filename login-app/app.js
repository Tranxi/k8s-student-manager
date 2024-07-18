/*
This Node.js program is used to verify the 
user password entered on the login interface with the database. 

Upon successful login, it will redirect to successServiceUrl,
with the query of {role} and {username}
*/

const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// the url to connect the mongoDB
const username = process.env.MONGO_USERNAME || 'admin';
const password = process.env.MONGO_PASSWORD || 'password';


const url = `mongodb://${username}:${password}@mongo:27017/?authSource=admin`;


// After clicking the login button, if authenticating successfully, the page will jump to the following URL
const successServiceUrl = process.env.SUCCESS_SERVICE_URL;

const dbName = 'school';

// Asynchronously connecting to the database and starting the Express application.
async function connectDB() {
    try {
        const client = await MongoClient.connect(url);
        db = client.db(dbName); // select database
        console.log(`Connected to database: ${dbName}`);
        
        // setting up middleware
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(express.static(path.join(__dirname, 'public')));

        // set template engine
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'ejs');

        // login page
        app.get('/', (req, res) => {
            res.redirect('/login');
        });

        app.get('/login', (req, res) => {
            res.render('login');
        });

        app.post('/login', async (req, res) => {
            const { username, password, role } = req.body;

            try {
                const user = await db.collection('users').findOne({ username, password, role });

                if (user) {
                    res.redirect(`${successServiceUrl}?role=${role}&username=${username}`);
                } else {
                    res.redirect('/error');
                }
            } catch (err) {
                console.error('Error while logging in:', err);
                res.status(500).send('Server error');
            }
        });
        
        // failure page
        app.get('/error', (req, res) => {
            res.render('error');
        });


        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to connect to database:', err);
    }
}

connectDB();

// db.users.insertMany([
//     { username: 'student', password: 'student123', role: 'student' },
//     { username: 'teacher', password: 'teacher123', role: 'teacher' },
//     { username: 'admin', password: 'admin123', role: 'admin' }
//   ])
// mongo -u admin -p --authenticationDatabase admin
// use shcool
// db.createCollection('users')



