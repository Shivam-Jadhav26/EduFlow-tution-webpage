export type Role = 'student' | 'admin' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  class?: string;
  batch?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  class: string;
  subjects: string[];
  thumbnail: string;
}

export interface Subject {
  id: string;
  name: string;
  courseId: string;
  teacher: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  subjectId?: string;
}

export interface TimetableEntry {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  time: string;
  subject: string;
  teacher: string;
  room?: string;
  batchId: string;
}

export interface Test {
  id: string;
  title: string;
  subject: string;
  date: string;
  duration: number; // in minutes
  totalMarks: number;
  status: 'upcoming' | 'completed' | 'ongoing';
  questions?: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // index
}

export interface Result {
  id: string;
  testId: string;
  studentId: string;
  score: number;
  totalMarks: number;
  date: string;
}

export interface Doubt {
  id: string;
  studentId: string;
  subject: string;
  question: string;
  status: 'pending' | 'resolved';
  createdAt: string;
  replies?: Reply[];
}

export interface Reply {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'test' | 'fee' | 'attendance';
  date: string;
  isRead: boolean;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  amount: number;
  month: string;
  status: 'paid' | 'pending';
  dueDate: string;
}
