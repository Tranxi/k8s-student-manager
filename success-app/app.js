const express = require('express');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');

const app = express();
const username = process.env.MONGO_USERNAME || 'admin';
const password = process.env.MONGO_PASSWORD || 'password';

const url = `mongodb://${username}:${password}@mongo-course:27018/?authSource=admin`;
// const url = 'mongodb://localhost:27017/';
const dbName = 'courseDB'; 
let db;

app.use(bodyParser.urlencoded({ extended: true }));

async function connectDB() {
    try {
        const client = await MongoClient.connect(url);
        db = client.db(dbName);
        console.log(`Connected to database: ${dbName}`);

        app.use(express.static(path.join(__dirname, 'public')));

        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'ejs');

        // Redirect the root path to /success
        app.get('/', (req, res) => {
            res.redirect('/success');
        });

        app.get('/success', async (req, res) => {
            const role = req.query.role;
            const username = req.query.username;

            if (role === 'student') {
                try {
                    const courses = await db.collection('courses').find({ "students.username": username }).toArray();
                    const grades = courses.map(course => {
                        const student = course.students.find(s => s.username === username);
                        return { courseName: course.courseName, grade: student.grade };
                    });
                    res.render('student-success', { grades });
                } catch (err) {
                    console.error('Error fetching grades:', err);
                    res.status(500).send('Error fetching grades from database.');
                }
            } else if (role === 'teacher') {
                res.render('teacher-success');
            } else if (role === 'admin') {
                res.render('admin-success');
            } else {
                res.render('generic-success');
            }
        });
        
        app.get('/admin/add-course', (req, res)=>{
            res.render('add-course');
        })
        
        // handle post request of /admin/add-course
        app.post('/admin/add-course', async(req, res)=>{
            const courseName = req.body.courseName;
            try{
                await db.collection('courses').insertOne({courseName: courseName, students: []});
                res.redirect('/admin/all-courses');
            }catch (err) {
                console.error('Error adding course:', err);
                res.status(500).send('Error adding course to database.');
            }
        });

        app.get('/admin/all-courses', async (req, res) => {
            try {
                const courses = await db.collection('courses').find().toArray();
                res.render('all-courses', { courses });
            } catch (err) {
                console.error('Error fetching courses:', err);
                res.status(500).send('Error fetching courses from database.');
            }
        });

        // handle post request of /teacher/update-grade
        app.post('/teacher/update-grade', async (req, res) => {
            const studentName = req.body.studentName;
            const courseName = req.body.courseName;
            const grade = req.body.grade;
            
            // Retrieve from the database
            try {
                const course = await db.collection('courses').findOne({ courseName: courseName });
                if (!course) {
                    return res.render('teacher-error', { message: 'Course not found.' });
                }
        
                const student = course.students.find(student => student.username === studentName);
                if (!student) {
                    return res.render('teacher-error', { message: 'Student not found in this course.' });
                }
        
                
                await db.collection('courses').updateOne(
                    { "courseName": courseName, "students.username": studentName },
                    { $set: { "students.$.grade": grade } }
                );
        
                res.redirect(`/teacher/grade-updated?student=${studentName}&course=${courseName}`);
            } catch (err) {
                console.error('Error updating grade:', err);
                res.render('teacher-error', { message: 'Error updating grade.' });
            }
        });

        app.get('/teacher/grade-updated', (req, res) => {
            const studentName = req.query.student;
            const courseName = req.query.course;
            res.render('grade-updated', { studentName, courseName });
        });

        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`Success service running on port ${PORT}`);
        });

        // Add health check route
        app.get('/healthz', async (req, res) => {
            try {
                const result = await db.command({ ping: 1 });
                if (result.ok === 1) {
                    res.status(200).send('Database is reachable.');
                } else {
                    res.status(500).send('Database connection issue.');
                }
            } catch (err) {
                console.error('Health check error:', err);
                res.status(500).send('Health check failed.');
            }
        });
 
        // Add readiness probe and liveness probe
        app.get('/ready', (req, res) => {
            if (db) {
                res.status(200).send('Ready');
            } else {
                res.status(500).send('Not ready');
            }
        });
 
        app.get('/live', (req, res) => {
            if (db) {
                res.status(200).send('Live');
            } else {
                res.status(500).send('Not live');
            }
        });
    } catch (err) {
        console.error('Failed to connect to database:', err);
    }
}

connectDB();
