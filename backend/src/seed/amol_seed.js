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
const Assignment = require('../models/Assignment');
const Source = require('../models/Source');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('📦 Connected to MongoDB for seeding...');
};

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyaansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Rishabh', 'Kabir', 'Ritvik', 'Aaryan', 'Dhruv', 'Darsh', 'Ananya', 'Diya', 'Aadhya', 'Saanvi', 'Avni', 'Kavya', 'Pari', 'Piyush', 'Karan', 'Sneha', 'Riya', 'Neha', 'Pooja', 'Shruti', 'Simran', 'Rahul', 'Rohit', 'Yash', 'Aryan', 'Vikram', 'Sahil', 'Mohit', 'Nikhil', 'Gaurav', 'Manish', 'Kunal', 'Deepak', 'Saurabh', 'Amit', 'Sumit'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Joshi', 'Patel', 'Jain', 'Mehta', 'Mishra', 'Chauhan', 'Thakur', 'Yadav', 'Rajput', 'Bhatia', 'Kaur', 'Das', 'Roy', 'Sen', 'Kapoor'];

const generateStudents = (count, batches) => {
  const students = [];
  for (let i = 0; i < count; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const batch = batches[i % batches.length];
    students.push({
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}${i}@student.com`,
      phone: `9${Math.floor(Math.random() * 900000000 + 100000000)}`,
      class: batch.class,
      batch: batch._id,
      parentName: `Mr. ${ln}`,
      parentPhone: `8${Math.floor(Math.random() * 900000000 + 100000000)}`,
      status: 'active',
    });
  }
  return students;
};

const seed = async () => {
  await connectDB();

  console.log('🧹 Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}), Batch.deleteMany({}), TimetableEntry.deleteMany({}),
    Attendance.deleteMany({}), Test.deleteMany({}), TestAttempt.deleteMany({}),
    Doubt.deleteMany({}), Notification.deleteMany({}), FeeRecord.deleteMany({}),
    Announcement.deleteMany({}), Assignment.deleteMany({}), Source.deleteMany({})
  ]);

  // 1. Admin
  console.log('👤 Seeding admin (Amol Sir)...');
  const admin = await User.create({
    name: 'Amol Sir',
    email: 'amol@eduflow.com',
    passwordHash: 'Password@123',
    role: 'admin',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amol',
  });

  // 2. Batches
  console.log('📘 Seeding batches...');
  const batches = await Batch.insertMany([
    { name: 'Class 10 - Science Explorer', class: '10th', schedule: 'Mon-Wed-Fri 4-6 PM', teacher: 'Amol Sir', isActive: true },
    { name: 'Class 12 - Mathematics Pro', class: '12th', schedule: 'Tue-Thu-Sat 5-7 PM', teacher: 'Amol Sir', isActive: true },
    { name: 'JEE Droppers - Physics Focus', class: 'Dropper', schedule: 'Mon-Sat 10 AM-1 PM', teacher: 'Amol Sir', isActive: true },
  ]);

  // 3. Students
  console.log('👥 Seeding 50 students...');
  const studentDefs = generateStudents(50, batches);
  const hashedStudentPwd = await bcrypt.hash('Password@123', 12);
  const students = await User.insertMany(
    studentDefs.map((s) => ({ ...s, passwordHash: hashedStudentPwd, role: 'student', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}` }))
  );

  // 4. Timetable
  console.log('📅 Seeding timetable...');
  const timetableEntries = [];
  batches.forEach((b, i) => {
    timetableEntries.push({ day: 'Monday', time: '04:00 PM - 05:00 PM', subject: i===0?'Science':i===1?'Maths':'Physics', teacher: 'Amol Sir', batchId: b._id, type: 'class' });
    timetableEntries.push({ day: 'Wednesday', time: '05:00 PM - 06:00 PM', subject: i===0?'Science':i===1?'Maths':'Physics', teacher: 'Amol Sir', batchId: b._id, type: 'class' });
    timetableEntries.push({ day: 'Friday', time: '10:00 AM - 12:00 PM', subject: 'Mock Test', teacher: 'Amol Sir', batchId: b._id, type: 'exam' });
  });
  await TimetableEntry.insertMany(timetableEntries);

  // 5. Tests & Attempts
  console.log('📝 Seeding tests and results...');
  const testIds = [];
  for (const b of batches) {
    const t = await Test.create({
      title: `Grand Mock Test - ${b.class}`,
      subject: b.class === '10th' ? 'Science' : 'Physics/Maths',
      date: new Date(),
      duration: 60,
      totalMarks: 100,
      status: 'completed',
      class: b.class,
      targetBatches: [b._id],
      createdBy: admin._id,
      questions: [
        { text: 'Sample Question 1?', options: ['A', 'B', 'C', 'D'], correctAnswer: 0 },
        { text: 'Sample Question 2?', options: ['A', 'B', 'C', 'D'], correctAnswer: 1 },
      ]
    });
    testIds.push({ testId: t._id, batchId: b._id, totalMarks: 100 });
  }

  const attempts = [];
  for (const s of students) {
    const test = testIds.find(t => t.batchId.toString() === s.batch.toString());
    if (test) {
      attempts.push({
        testId: test.testId,
        studentId: s._id,
        answers: [{ questionIndex: 0, selectedOption: 0 }, { questionIndex: 1, selectedOption: 1 }],
        score: Math.floor(Math.random() * 40) + 60, // 60 to 100
        totalMarks: test.totalMarks,
        submittedAt: new Date(),
        status: 'submitted',
      });
    }
  }
  await TestAttempt.insertMany(attempts);

  // 6. Attendance
  console.log('📋 Seeding attendance (last 7 days for 50 students)...');
  const attRecords = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    for (const s of students) {
      const rand = Math.random();
      const status = rand > 0.15 ? 'present' : (rand > 0.05 ? 'absent' : 'late');
      attRecords.push({ studentId: s._id, batchId: s.batch, date: d, status, markedBy: admin._id });
    }
  }
  await Attendance.insertMany(attRecords);

  // 7. Fees
  console.log('💰 Seeding fees (3 months for 50 students = 150 records)...');
  const feeRecords = [];
  const months = ['April 2024', 'May 2024', 'June 2024'];
  for (const s of students) {
    months.forEach((month, idx) => {
      let status = 'paid';
      if (idx === 2) status = Math.random() > 0.5 ? 'pending' : 'paid'; // June mostly pending
      if (idx === 1 && Math.random() > 0.9) status = 'overdue'; // Some May overdue
      
      feeRecords.push({
        studentId: s._id,
        amount: s.class === 'Dropper' ? 10000 : 5000,
        month,
        status,
        dueDate: new Date(`2024-0${idx+4}-05`),
        paidDate: status === 'paid' ? new Date(`2024-0${idx+4}-02`) : null,
        method: status === 'paid' ? 'UPI' : undefined,
      });
    });
  }
  await FeeRecord.insertMany(feeRecords);

  // 8. Doubts
  console.log('💬 Seeding doubts...');
  const doubts = [];
  for (let i = 0; i < 15; i++) {
    const s = students[Math.floor(Math.random() * students.length)];
    doubts.push({
      studentId: s._id,
      subject: s.class === '10th' ? 'Science' : 'Physics',
      question: `Sir, can you please explain concept number ${i+1} from yesterday's class?`,
      status: i % 2 === 0 ? 'resolved' : 'pending',
      replies: i % 2 === 0 ? [{ authorId: admin._id, authorName: 'Amol Sir', authorRole: 'admin', text: 'Sure, I will cover this in tomorrow\'s revision session.', createdAt: new Date() }] : [],
      createdAt: new Date(),
    });
  }
  await Doubt.insertMany(doubts);

  // 9. Announcements
  console.log('📢 Seeding announcements...');
  await Announcement.insertMany([
    { title: 'Welcome to EduFlow', content: 'Dear students, welcome to the new portal.', target: 'all', type: 'Update', status: 'sent', createdBy: admin._id },
    { title: 'Upcoming Mock Tests', content: 'All batches have mock tests scheduled this Friday.', target: 'all', type: 'Academic', status: 'sent', createdBy: admin._id },
  ]);

  // 10. Assignments & Sources
  console.log('📚 Seeding Assignments & Sources...');
  const dummyPdf = 'https://res.cloudinary.com/demo/image/upload/v1596705607/dummy.pdf';
  for (const b of batches) {
    await Assignment.insertMany([
      { title: `Assignment 1 - ${b.class}`, subject: 'Core', dueDate: new Date(Date.now() + 86400000 * 5), pdfUrl: dummyPdf, publicId: 'dummy1', batchId: b._id, createdBy: admin._id },
      { title: `Assignment 2 - ${b.class}`, subject: 'Advanced', dueDate: new Date(Date.now() + 86400000 * 10), pdfUrl: dummyPdf, publicId: 'dummy2', batchId: b._id, createdBy: admin._id },
    ]);
    await Source.insertMany([
      { title: `Chapter 1 Notes`, subject: 'Core', description: 'Handwritten notes', fileUrl: dummyPdf, publicId: 'dummy_s1', fileType: 'pdf', batch: b._id, uploadedBy: admin._id },
    ]);
  }

  console.log('\n✅ 50-STUDENT MOCK DATA SEED COMPLETED SUCCESSFULLY!');
  console.log('──────────────────────────────────────');
  console.log(`👨‍🏫 Admin Login: amol@eduflow.com / Password@123`);
  console.log(`👨‍🎓 Student Login: ${students[0].email} / Password@123`);
  console.log('──────────────────────────────────────\n');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
