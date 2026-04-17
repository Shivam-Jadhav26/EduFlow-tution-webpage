import { User, Course, Test, Doubt, Notification, TimetableEntry, Attendance, FeeRecord, Result } from '../types';

export const mockUser: User = {
  id: 'u1',
  name: 'Rahul Sharma',
  email: 'rahul@student.com',
  role: 'student',
  class: '10th',
  batch: 'Morning Elite',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul'
};

export const mockAdmin: User = {
  id: 'a1',
  name: 'Dr. Vivek Gupta',
  email: 'admin@eduflow.com',
  role: 'admin',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vivek'
};

export const courses: Course[] = [
  {
    id: 'c1',
    title: 'Class 10 - Board Intensive',
    description: 'Comprehensive coverage of CBSE Class 10 boards syllabus with previous year question solving sessions.',
    class: '10th',
    subjects: ['Mathematics', 'Science', 'English', 'SST'],
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=400&h=250'
  },
  {
    id: 'c2',
    title: 'Class 9 - Foundation Course',
    description: 'Foundation course for Class 9 students focusing on core concepts needed for Class 10 and competitive exams.',
    class: '9th',
    subjects: ['Mathematics', 'Science', 'Social Science', 'English', 'Computer'],
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400&h=250'
  },
  {
    id: 'c3',
    title: 'Class 8 - Skill Builder',
    description: 'Developing analytical and logical thinking through advanced problem solving in Math and Science.',
    class: '8th',
    subjects: ['Mathematics', 'Science', 'English', 'Social Science'],
    thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400&h=250'
  },
  {
    id: 'c4',
    title: 'Class 7 - Core Concepts',
    description: 'Strengthening basic concepts with fun-based learning and interactive visual classes.',
    class: '7th',
    subjects: ['Maths', 'English', 'General Science'],
    thumbnail: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&q=80&w=400&h=250'
  }
];

export const timetable: TimetableEntry[] = [
  { id: 't1', day: 'Monday', time: '04:00 PM - 05:00 PM', subject: 'Mathematics', teacher: 'Mr. Verma', batchId: 'b1' },
  { id: 't2', day: 'Monday', time: '05:15 PM - 06:15 PM', subject: 'Science', teacher: 'Dr. Khanna', batchId: 'b1' },
  { id: 't3', day: 'Tuesday', time: '04:00 PM - 05:00 PM', subject: 'English', teacher: 'Ms. Sonia', batchId: 'b1' },
  { id: 't4', day: 'Wednesday', time: '04:00 PM - 05:00 PM', subject: 'Mathematics', teacher: 'Mr. Verma', batchId: 'b1' },
  { id: 't5', day: 'Thursday', time: '05:00 PM - 06:00 PM', subject: 'History', teacher: 'Mrs. Joshi', batchId: 'b1' },
  { id: 't6', day: 'Friday', time: '04:15 PM - 05:15 PM', subject: 'Physics', teacher: 'Dr. Khanna', batchId: 'b1' }
];

export const tests: Test[] = [
  { id: 'test1', title: 'Calculus & Algebra Prep', subject: 'Mathematics', date: '2024-05-20', duration: 60, totalMarks: 50, status: 'upcoming' },
  { id: 'test2', title: 'Periodic Table Mastery', subject: 'Science', date: '2024-05-15', duration: 30, totalMarks: 25, status: 'completed' },
  { id: 'test3', title: 'Grammar & Vocab Test', subject: 'English', date: '2024-05-22', duration: 45, totalMarks: 30, status: 'upcoming' },
  { id: 'test4', title: 'Chapter 1: Chemical Reactions', subject: 'Science', date: '2024-05-10', duration: 60, totalMarks: 50, status: 'completed' },
  { id: 'test5', title: 'Half Yearly Mock - Math', subject: 'Mathematics', date: '2024-06-12', duration: 180, totalMarks: 100, status: 'upcoming' }
];

export const results: Result[] = [
  { id: 'r1', testId: 'test2', studentId: 'u1', score: 22, totalMarks: 25, date: '2024-05-15' },
  { id: 'r2', testId: 'test4', studentId: 'u1', score: 45, totalMarks: 50, date: '2024-05-10' }
];

export const attendance: Attendance[] = [
  { id: 'att1', studentId: 'u1', date: '2024-05-15', status: 'present' },
  { id: 'att2', studentId: 'u1', date: '2024-05-14', status: 'present' },
  { id: 'att3', studentId: 'u1', date: '2024-05-13', status: 'absent' },
  { id: 'att4', studentId: 'u1', date: '2024-05-12', status: 'present' },
  { id: 'att5', studentId: 'u1', date: '2024-05-11', status: 'present' },
  { id: 'att6', studentId: 'u1', date: '2024-05-10', status: 'present' },
  { id: 'att7', studentId: 'u1', date: '2024-05-09', status: 'late' }
];

export const doubts: Doubt[] = [
  {
    id: 'd1',
    studentId: 'u1',
    subject: 'Mathematics',
    question: 'How to solve quadratic equations using completing the square method? Specifically, why do we add half of the coefficient of x squared?',
    status: 'resolved',
    createdAt: '2024-05-10',
    replies: [
      { id: 'rep1', authorId: 'a1', authorName: 'Dr. Vivek Gupta', text: 'You need to add and subtract (b/2a)^2 to make it a perfect square. This comes from the identity (x+k)^2 = x^2 + 2kx + k^2.', createdAt: '2024-05-11' }
    ]
  },
  {
    id: 'd2',
    studentId: 'u1',
    subject: 'Science',
    question: 'Difference between Mitosis and Meiosis in simple terms for boards?',
    status: 'pending',
    createdAt: '2024-05-18'
  }
];

export const notifications: Notification[] = [
  { id: 'n1', title: 'Algebra Prep Resource Update', message: 'New practice sets for Algebra have been uploaded to your course. Check My Courses section.', type: 'info', date: '2024-05-19', isRead: false },
  { id: 'n2', title: 'Maths Test Scheduled', message: 'Weekly test on Algebra scheduled for Monday at 4:30 PM.', type: 'test', date: '2024-05-18', isRead: false },
  { id: 'n3', title: 'Fee Payment Success', message: 'We have received your payment of ₹5,000 for May 2024. Transaction ID: #TXN12345.', type: 'fee', date: '2024-05-17', isRead: true },
  { id: 'n4', title: 'Holiday Announcement', message: 'The institute will remain closed on 25th May on account of regional festival.', type: 'warning', date: '2024-05-15', isRead: true }
];

export const fees: FeeRecord[] = [
  { id: 'f1', studentId: 'u1', amount: 5000, month: 'May 2024', status: 'paid', dueDate: '2024-05-05' },
  { id: 'f2', studentId: 'u1', amount: 5000, month: 'June 2024', status: 'pending', dueDate: '2024-06-05' },
  { id: 'f3', studentId: 'u1', amount: 5000, month: 'April 2024', status: 'paid', dueDate: '2024-04-05' }
];
