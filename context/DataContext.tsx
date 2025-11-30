import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ClassSection, Student, AttendanceRecord, AttendanceStatus } from '../types';

interface DataContextType {
  classes: ClassSection[];
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  markAttendance: (records: AttendanceRecord[]) => void;
  getStudentAttendance: (studentId: string) => AttendanceRecord[];
  getClassAttendance: (classId: string, date: string) => AttendanceRecord[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [classes] = useState<ClassSection[]>([
    { id: 'c1', name: 'BS Commerce 1st Sem', sections: ['A', 'B'] },
    { id: 'c2', name: 'BS Commerce 3rd Sem', sections: ['A'] },
    { id: 'c3', name: 'Intermediate Part 1', sections: ['Green', 'Blue'] },
  ]);

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Seed Data on Mount
  useEffect(() => {
    const savedRecords = localStorage.getItem('gcc_attendance');
    if (savedRecords) {
      setAttendanceRecords(JSON.parse(savedRecords));
    }

    // Generate Dummy Students
    const dummyStudents: Student[] = [];
    const names = ['Ali Khan', 'Fatima Bibi', 'Usman Zafar', 'Ayesha Gul', 'Hamza Tariq', 'Sana Mir', 'Bilal Ahmed', 'Zainab Noor'];
    let idCounter = 1;
    classes.forEach(cls => {
      cls.sections.forEach(sec => {
        for (let i = 0; i < 5; i++) {
          dummyStudents.push({
            id: `s${idCounter}`,
            userId: `u_s${idCounter}`,
            name: names[idCounter % names.length] + ` (${sec})`,
            rollNo: `ROLL-${cls.id}-${sec}-${idCounter}`,
            classId: cls.id,
            section: sec
          });
          idCounter++;
        }
      });
    });
    setStudents(dummyStudents);
  }, [classes]);

  const markAttendance = (newRecords: AttendanceRecord[]) => {
    setAttendanceRecords(prev => {
      // Remove existing records for same date/student to allow updates
      const filtered = prev.filter(p => 
        !newRecords.some(n => n.studentId === p.studentId && n.date === p.date)
      );
      const updated = [...filtered, ...newRecords];
      localStorage.setItem('gcc_attendance', JSON.stringify(updated));
      return updated;
    });
  };

  const getStudentAttendance = (studentId: string) => {
    return attendanceRecords.filter(r => r.studentId === studentId);
  };

  const getClassAttendance = (classId: string, date: string) => {
    return attendanceRecords.filter(r => r.classId === classId && r.date === date);
  };

  return (
    <DataContext.Provider value={{ classes, students, attendanceRecords, markAttendance, getStudentAttendance, getClassAttendance }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};