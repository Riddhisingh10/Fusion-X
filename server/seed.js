const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Import models
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const QuestionPaper = require('./models/QuestionPaper');
const Note = require('./models/Note');
const PYQ = require('./models/PYQ');
const StudyGroup = require('./models/StudyGroup');
const Marathon = require('./models/Marathon');
const P2PSession = require('./models/P2PSession');
const LibraryBook = require('./models/LibraryBook');
const Result = require('./models/Result');
const Doubt = require('./models/Doubt');
const Alumni = require('./models/Alumni');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await Attendance.deleteMany({});
        await QuestionPaper.deleteMany({});
        await Note.deleteMany({});
        await PYQ.deleteMany({});
        await StudyGroup.deleteMany({});
        await Marathon.deleteMany({});
        await P2PSession.deleteMany({});
        await LibraryBook.deleteMany({});
        await Result.deleteMany({});
        await Doubt.deleteMany({});
        await Alumni.deleteMany({});

        console.log('Cleared existing data');

        // Create users
        const student = await User.create({
            name: 'Student One',
            email: 'student@test.com',
            password: 'password',
            role: 'student',
            usn: '1RV21CS001'
        });

        const teacher = await User.create({
            name: 'Teacher One',
            email: 'teacher@test.com',
            password: 'password',
            role: 'teacher'
        });

        console.log('Created users');

        // Create attendance records
        const courses = [
            { code: '1BMATE101', name: 'Applied Mathematics - I' },
            { code: '1BCHEE102', name: 'Applied Chemistry' },
            { code: '1BEECT103', name: 'Elements of Electronics Engineering' },
            { code: '1BAIAK104', name: 'Introduction to AI & its Applications' },
            { code: '1BIMEK105', name: 'Introduction to Mechanical Engineering' }
        ];

        const attendanceRecords = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            for (const course of courses) {
                attendanceRecords.push({
                    student: student._id,
                    courseCode: course.code,
                    courseName: course.name,
                    date: date,
                    status: Math.random() > 0.15 ? 'Present' : 'Absent',
                    term: '1',
                    curriculum: '2022 SCHEME',
                    markedBy: teacher._id
                });
            }
        }
        await Attendance.insertMany(attendanceRecords);
        console.log('Created attendance records');

        // Create PYQs
        const pyqs = [
            { question: "Derive Euler's Equation of Motion", subject: "Mechanical", yearsAsked: [2018, 2021, 2023] },
            { question: "Explain Heisenberg's Uncertainty Principle", subject: "Physics", yearsAsked: [2019, 2022] },
            { question: "Prove Divergence Theorem", subject: "Mathematics", yearsAsked: [2020, 2023, 2024] },
        ];
        await PYQ.insertMany(pyqs);
        console.log('Created PYQs');

        // Create notes
        const notes = [
            { title: 'Calculus Complete Notes', type: 'PDF', author: 'Prof. Smith', category: 'Teacher Note', verifiedBy: 'HOD', subject: 'Mathematics' },
            { title: 'Physics Mindmap - Unit 1', type: 'Image', author: 'Rank 1 Student', category: 'Best Student Note', verifiedBy: 'Prof. Jones', subject: 'Physics' },
        ];
        await Note.insertMany(notes);
        console.log('Created notes');

        // Create library books
        const books = [
            { title: 'Introduction to Algorithms', author: 'CLRS', status: 'Available' },
            { title: 'Clean Code: A Handbook', author: 'Robert C. Martin', status: 'Available' },
            { title: 'Artificial Intelligence', author: 'Stuart Russell', status: 'Available' },
        ];
        await LibraryBook.insertMany(books);
        console.log('Created library books');

        // Create results
        const results = [
            { student: student._id, type: 'Semester', title: 'Sem 1', score: '8.5 GPA', status: 'Pass', weakAreas: ['Mechanics'] },
            { student: student._id, type: 'Quiz', title: 'Physics Internal 1', score: '18/20', status: 'Excellent', weakAreas: [] },
        ];
        await Result.insertMany(results);
        console.log('Created results');

        // Create alumni
        const alumni = [
            { name: 'Sarah Connor', batch: 2020, company: 'Google', role: 'SWE', isAvailableForMentorship: true },
            { name: 'John Smith', batch: 2019, company: 'Microsoft', role: 'PM', isAvailableForMentorship: false },
        ];
        await Alumni.insertMany(alumni);
        console.log('Created alumni');

        console.log('\n✅ Database seeded successfully!');
        console.log('\nTest Credentials:');
        console.log('Student: student@test.com / password');
        console.log('Teacher: teacher@test.com / password');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
