require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Batch = require('../models/Batch');

const TimetableEntry = require('../models/TimetableEntry');
const Attendance = require('../models/Attendance');
const Test = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');
const Doubt = require('../models/Doubt');
const Notification = require('../models/Notification');
const FeeRecord = require('../models/FeeRecord');
const Announcement = require('../models/Announcement');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('📦 Connected to MongoDB for seeding...');
};

const seed = async () => {
  await connectDB();

  // Clean existing data
  console.log('🧹 Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Batch.deleteMany({}),

    TimetableEntry.deleteMany({}),
    Attendance.deleteMany({}),
    Test.deleteMany({}),
    TestAttempt.deleteMany({}),
    Doubt.deleteMany({}),
    Notification.deleteMany({}),
    FeeRecord.deleteMany({}),
    Announcement.deleteMany({}),
  ]);

  // ── 1. Batches ──────────────────────────────────────────────────────────────
  console.log('📘 Seeding batches...');
  const [batchA, batchB, batchC, batchD] = await Batch.insertMany([
    { name: 'Morning Elite', class: '10th', schedule: 'Mon-Sat 4-6 PM', teacher: 'Dr. Vivek Gupta', isActive: true },
    { name: 'Evening Star', class: '9th', schedule: 'Mon-Fri 6-8 PM', teacher: 'Mrs. Joshi', isActive: true },
    { name: 'Weekend Class', class: '8th', schedule: 'Sat-Sun 10 AM-12 PM', teacher: 'Mr. Verma', isActive: true },
    { name: 'Foundation Batch', class: '7th', schedule: 'Tue-Thu 4-5 PM', teacher: 'Ms. Sonia', isActive: true },
  ]);

  // ── 2. Admin ─────────────────────────────────────────────────────────────────
  console.log('👤 Seeding admin user...');
  const admin = await User.create({
    name: 'Dr. Vivek Gupta',
    email: 'admin@eduflow.com',
    passwordHash: 'Admin@123',
    role: 'admin',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vivek',
  });

  // ── 3. Students ───────────────────────────────────────────────────────────────
  console.log('👥 Seeding students...');
  const studentDefs = [
    { name: 'Rahul Sharma', email: 'rahul@student.com', class: '10th', batch: batchA._id, phone: '9876543210', parentName: 'Mr. Sharma', parentPhone: '9876543211', status: 'active' },
    { name: 'Sneha Gupta', email: 'sneha@example.com', class: '9th', batch: batchB._id, phone: '9876543220', status: 'active' },
    { name: 'Aryan Singh', email: 'aryan@abc.com', class: '10th', batch: batchA._id, phone: '9876543230', status: 'inactive' },
    { name: 'Pooja Verma', email: 'pooja@students.com', class: '8th', batch: batchC._id, phone: '9876543240', status: 'active' },
    { name: 'Vikram Kumar', email: 'vikram@example.com', class: '10th', batch: batchA._id, phone: '9876543250', status: 'pending' },
    { name: 'Ishita Roy', email: 'ishita@example.com', class: '9th', batch: batchB._id, phone: '9876543260', status: 'active' },
    { name: 'Kabir Vats', email: 'kabir@example.com', class: '10th', batch: batchA._id, phone: '9876543270', status: 'active' },
    { name: 'Aditi Khanna', email: 'aditi@example.com', class: '10th', batch: batchA._id, phone: '9876543280', status: 'active' },
  ];

  // Note: insertMany bypasses pre-save hooks, so we must hash passwords manually
  const hashedStudentPwd = await bcrypt.hash('Student@123', 12);
  const students = await User.insertMany(
    studentDefs.map((s) => ({ ...s, passwordHash: hashedStudentPwd, role: 'student', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}` }))
  );
  const rahul = students[0]; // primary test student



  // ── 5. Timetable ──────────────────────────────────────────────────────────────
  console.log('📅 Seeding timetable...');
  await TimetableEntry.insertMany([
    { day: 'Monday', time: '04:00 PM - 05:00 PM', subject: 'Mathematics', teacher: 'Mr. Verma', batchId: batchA._id },
    { day: 'Monday', time: '05:15 PM - 06:15 PM', subject: 'Science', teacher: 'Dr. Khanna', batchId: batchA._id },
    { day: 'Tuesday', time: '04:00 PM - 05:00 PM', subject: 'English', teacher: 'Ms. Sonia', batchId: batchA._id },
    { day: 'Wednesday', time: '04:00 PM - 05:00 PM', subject: 'Mathematics', teacher: 'Mr. Verma', batchId: batchA._id },
    { day: 'Thursday', time: '05:00 PM - 06:00 PM', subject: 'SST', teacher: 'Mrs. Joshi', batchId: batchA._id },
    { day: 'Friday', time: '04:15 PM - 05:15 PM', subject: 'Physics', teacher: 'Dr. Khanna', batchId: batchA._id },
    { day: 'Saturday', time: '10:00 AM - 11:00 AM', subject: 'Mathematics', teacher: 'Mr. Verma', batchId: batchB._id },
    { day: 'Saturday', time: '11:15 AM - 12:15 PM', subject: 'Science', teacher: 'Dr. Khanna', batchId: batchB._id },
  ]);

  // ── 6. Tests ──────────────────────────────────────────────────────────────────
  console.log('📝 Seeding tests...');
  const [test1, test2, test3] = await Test.insertMany([
    {
      title: 'Periodic Table Mastery',
      subject: 'Science',
      date: new Date('2024-05-15'),
      duration: 30,
      totalMarks: 25,
      status: 'completed',
      class: '10th',
      targetBatches: [batchA._id],
      createdBy: admin._id,
      questions: [
        { text: 'What is the atomic number of Carbon?', options: ['6', '8', '12', '14'], correctAnswer: 0 },
        { text: 'Which element has the symbol Fe?', options: ['Fluorine', 'Iron', 'Francium', 'Fermium'], correctAnswer: 1 },
        { text: 'What is the valency of Oxygen?', options: ['1', '2', '3', '4'], correctAnswer: 1 },
        { text: 'Which gas is most abundant in Earth\'s atmosphere?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], correctAnswer: 2 },
        { text: 'The pH of pure water is:', options: ['5', '7', '9', '11'], correctAnswer: 1 },
      ],
    },
    {
      title: 'Chapter 1: Chemical Reactions',
      subject: 'Science',
      date: new Date('2024-05-10'),
      duration: 60,
      totalMarks: 50,
      status: 'completed',
      class: '10th',
      targetBatches: [batchA._id],
      createdBy: admin._id,
      questions: [
        { text: 'What is a chemical reaction?', options: ['Physical change', 'Change in state', 'Formation of new substances', 'Mixing of substances'], correctAnswer: 2 },
        { text: 'Which of these is an exothermic reaction?', options: ['Electrolysis of water', 'Burning of coal', 'Melting of ice', 'Dissolving ammonium chloride'], correctAnswer: 1 },
        { text: 'CaCO3 → CaO + CO2 is an example of:', options: ['Combination reaction', 'Displacement reaction', 'Decomposition reaction', 'Double displacement'], correctAnswer: 2 },
      ],
    },
    {
      title: 'Calculus & Algebra Prep',
      subject: 'Mathematics',
      date: new Date(Date.now() + 7 * 86400000), // 7 days from now
      duration: 60,
      totalMarks: 50,
      status: 'upcoming',
      class: '10th',
      targetBatches: [batchA._id],
      createdBy: admin._id,
      questions: [
        { text: 'What is the value of x in 2x + 5 = 15?', options: ['5', '10', '15', '20'], correctAnswer: 0 },
        { text: 'Which of the following is a prime number?', options: ['4', '9', '13', '15'], correctAnswer: 2 },
        { text: 'Area of circle with radius 7 (π=22/7):', options: ['154', '44', '49', '121'], correctAnswer: 0 },
      ],
    },
  ]);

  // ── 7. Test Attempts (Rahul's results) ───────────────────────────────────────
  console.log('✅ Seeding test attempts...');
  await TestAttempt.insertMany([
    {
      testId: test1._id,
      studentId: rahul._id,
      answers: [
        { questionIndex: 0, selectedOption: 0 },
        { questionIndex: 1, selectedOption: 1 },
        { questionIndex: 2, selectedOption: 1 },
        { questionIndex: 3, selectedOption: 2 },
        { questionIndex: 4, selectedOption: 1 },
      ],
      score: 22,
      totalMarks: 25,
      submittedAt: new Date('2024-05-15'),
      status: 'submitted',
    },
    {
      testId: test2._id,
      studentId: rahul._id,
      answers: [
        { questionIndex: 0, selectedOption: 2 },
        { questionIndex: 1, selectedOption: 1 },
        { questionIndex: 2, selectedOption: 2 },
      ],
      score: 45,
      totalMarks: 50,
      submittedAt: new Date('2024-05-10'),
      status: 'submitted',
    },
  ]);

  // ── 8. Attendance ─────────────────────────────────────────────────────────────
  console.log('📋 Seeding attendance...');
  const attRecords = [];
  const attDates = [
    { date: '2024-05-15', status: 'present' },
    { date: '2024-05-14', status: 'present' },
    { date: '2024-05-13', status: 'absent' },
    { date: '2024-05-12', status: 'present' },
    { date: '2024-05-11', status: 'present' },
    { date: '2024-05-10', status: 'present' },
    { date: '2024-05-09', status: 'late' },
    { date: '2024-05-08', status: 'present' },
    { date: '2024-05-07', status: 'present' },
    { date: '2024-05-06', status: 'present' },
  ];
  for (const { date, status } of attDates) {
    attRecords.push({
      studentId: rahul._id,
      batchId: batchA._id,
      date: new Date(date),
      status,
      subject: 'Mathematics',
      markedBy: admin._id,
    });
  }
  await Attendance.insertMany(attRecords);

  // ── 9. Doubts ─────────────────────────────────────────────────────────────────
  console.log('💬 Seeding doubts...');
  await Doubt.insertMany([
    {
      studentId: rahul._id,
      subject: 'Mathematics',
      question: 'How to solve quadratic equations using completing the square method? Specifically, why do we add half of the coefficient of x squared?',
      status: 'resolved',
      replies: [
        {
          authorId: admin._id,
          authorName: 'Dr. Vivek Gupta',
          authorRole: 'admin',
          text: 'You need to add and subtract (b/2a)^2 to make it a perfect square. This comes from the identity (x+k)^2 = x^2 + 2kx + k^2.',
          createdAt: new Date('2024-05-11'),
        },
      ],
      createdAt: new Date('2024-05-10'),
    },
    {
      studentId: rahul._id,
      subject: 'Science',
      question: 'Difference between Mitosis and Meiosis in simple terms for boards?',
      status: 'pending',
      createdAt: new Date('2024-05-18'),
    },
    {
      studentId: students[1]._id,
      subject: 'Mathematics',
      question: 'Complex integration help needed for solving definite integrals with trigonometric substitution.',
      status: 'pending',
      createdAt: new Date('2024-05-19'),
    },
  ]);

  // ── 10. Notifications ─────────────────────────────────────────────────────────
  console.log('🔔 Seeding notifications...');
  await Notification.insertMany([
    { userId: rahul._id, title: 'Algebra Prep Resource Update', message: 'New practice sets for Algebra have been uploaded.', type: 'info', date: new Date('2024-05-19'), isRead: false },
    { userId: rahul._id, title: 'Maths Test Scheduled', message: 'Weekly test on Algebra scheduled for Monday at 4:30 PM.', type: 'test', date: new Date('2024-05-18'), isRead: false },
    { userId: rahul._id, title: 'Fee Payment Success', message: 'We have received your payment of ₹5,000 for May 2024. Transaction ID: #TXN12345.', type: 'fee', date: new Date('2024-05-17'), isRead: true },
    { userId: null, title: 'Holiday Announcement', message: 'The institute will remain closed on 25th May on account of regional festival.', type: 'warning', date: new Date('2024-05-15'), isRead: false },
  ]);

  // ── 11. Fees ──────────────────────────────────────────────────────────────────
  console.log('💰 Seeding fees...');
  await FeeRecord.insertMany([
    { studentId: rahul._id, amount: 5000, month: 'April 2024', status: 'paid', dueDate: new Date('2024-04-05'), paidDate: new Date('2024-04-03'), method: 'UPI', transactionId: 'TXN11111' },
    { studentId: rahul._id, amount: 5000, month: 'May 2024', status: 'paid', dueDate: new Date('2024-05-05'), paidDate: new Date('2024-05-02'), method: 'UPI', transactionId: 'TXN12345' },
    { studentId: rahul._id, amount: 5000, month: 'June 2024', status: 'pending', dueDate: new Date('2024-06-05') },
    { studentId: students[1]._id, amount: 4500, month: 'May 2024', status: 'pending', dueDate: new Date('2024-05-05'), method: 'Bank Transfer' },
    { studentId: students[5]._id, amount: 4000, month: 'April 2024', status: 'overdue', dueDate: new Date('2024-04-05') },
    { studentId: students[6]._id, amount: 5000, month: 'May 2024', status: 'paid', dueDate: new Date('2024-05-05'), paidDate: new Date('2024-05-01'), method: 'Cash', transactionId: 'TXN22222' },
  ]);

  // ── 12. Announcements ─────────────────────────────────────────────────────────
  console.log('📢 Seeding announcements...');
  await Announcement.insertMany([
    { title: 'Summer Vacation Schedule', content: 'The institute will remain closed from May 20th to June 5th for summer holidays. Enjoy your break!', target: 'all', type: 'Holiday', status: 'sent', views: 124, createdBy: admin._id },
    { title: 'Mock Test - Mathematics', content: 'A comprehensive mock test for Class 10th Geometry will be conducted this Sunday at 10:00 AM.', target: 'class', targetClass: '10th', type: 'Academic', status: 'scheduled', scheduledAt: new Date(Date.now() + 3 * 86400000), views: 0, createdBy: admin._id },
    { title: 'New Physics Faculty Joining', content: 'We are excited to welcome Dr. H.C. Ray as our new Senior Physics Mentor. Sessions start next Monday.', target: 'all', type: 'Update', status: 'sent', views: 89, createdBy: admin._id },
  ]);

  console.log('\n✅ Seed completed successfully!');
  console.log('──────────────────────────────────────');
  console.log('Admin login:   admin@eduflow.com / Admin@123');
  console.log('Student login: rahul@student.com / Student@123');
  console.log('──────────────────────────────────────\n');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
