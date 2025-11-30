export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  studentDetails?: {
    rollNo: string;
    classId: string;
    section: string;
  };
}

export interface ClassSection {
  id: string;
  name: string; // e.g., "BS Commerce 1st Sem"
  sections: string[]; // ['A', 'B']
}

export interface Student {
  id: string;
  userId: string; // Link to User
  name: string;
  rollNo: string;
  classId: string;
  section: string;
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  section: string;
  date: string; // ISO Date string YYYY-MM-DD
  status: AttendanceStatus;
  markedBy: string; // Teacher ID
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}