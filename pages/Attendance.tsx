import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AttendanceStatus, AttendanceRecord } from '../types';
import { Calendar, Save, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';

export const Attendance = () => {
  const { classes, students, markAttendance, getClassAttendance } = useData();
  const { user } = useAuth();
  
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedSection, setSelectedSection] = useState(classes[0]?.sections[0] || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [isSaved, setIsSaved] = useState(false);

  // Filter students based on selection
  const classStudents = students.filter(s => 
    s.classId === selectedClassId && s.section === selectedSection
  );

  // Load existing data if any
  useEffect(() => {
    const existing = getClassAttendance(selectedClassId, selectedDate);
    const newRecords: Record<string, AttendanceStatus> = {};
    
    // Default all to PRESENT if no record exists, otherwise load existing
    classStudents.forEach(s => {
      const found = existing.find(e => e.studentId === s.id);
      newRecords[s.id] = found ? found.status : AttendanceStatus.PRESENT;
    });
    
    setRecords(newRecords);
    setIsSaved(false);
  }, [selectedClassId, selectedSection, selectedDate, students]); // Keep students in dep array if they load async

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords(prev => ({ ...prev, [studentId]: status }));
    setIsSaved(false);
  };

  const handleSave = () => {
    const recordsToSave: AttendanceRecord[] = classStudents.map(s => ({
      id: `${s.id}-${selectedDate}`,
      studentId: s.id,
      classId: selectedClassId,
      section: selectedSection,
      date: selectedDate,
      status: records[s.id] || AttendanceStatus.PRESENT,
      markedBy: user?.id || 'unknown'
    }));
    markAttendance(recordsToSave);
    setIsSaved(true);
    // Simple toast could go here
    setTimeout(() => setIsSaved(false), 3000);
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mark Attendance</h1>
          <p className="text-slate-500">Record daily attendance for your classes.</p>
        </div>
        
        <div className="flex gap-2">
           <button 
            onClick={handleSave}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
              isSaved 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'
            }`}
          >
            {isSaved ? <CheckCircle size={20} /> : <Save size={20} />}
            <span>{isSaved ? 'Saved Successfully' : 'Save Attendance'}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Class</label>
          <div className="relative">
             <select 
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                // Reset section to first available when class changes
                const cls = classes.find(c => c.id === e.target.value);
                if(cls) setSelectedSection(cls.sections[0]);
              }}
              className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none bg-white appearance-none"
            >
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Filter className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={18} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Section</label>
          <div className="relative">
             <select 
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none bg-white appearance-none"
            >
              {selectedClass?.sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
             <Filter className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={18} />
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Roll No</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{student.rollNo}</td>
                  <td className="px-6 py-4">{student.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <StatusButton 
                        type={AttendanceStatus.PRESENT} 
                        current={records[student.id]} 
                        onClick={() => handleStatusChange(student.id, AttendanceStatus.PRESENT)} 
                        icon={CheckCircle}
                        color="text-green-600 bg-green-50 border-green-200 hover:bg-green-100"
                        activeColor="bg-green-600 text-white border-green-600"
                      />
                      <StatusButton 
                        type={AttendanceStatus.ABSENT} 
                        current={records[student.id]} 
                        onClick={() => handleStatusChange(student.id, AttendanceStatus.ABSENT)} 
                        icon={XCircle}
                        color="text-red-600 bg-red-50 border-red-200 hover:bg-red-100"
                         activeColor="bg-red-600 text-white border-red-600"
                      />
                      <StatusButton 
                        type={AttendanceStatus.LATE} 
                        current={records[student.id]} 
                        onClick={() => handleStatusChange(student.id, AttendanceStatus.LATE)} 
                        icon={Clock}
                        color="text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100"
                         activeColor="bg-amber-500 text-white border-amber-500"
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {classStudents.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                    No students found for this class section.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatusButton = ({ type, current, onClick, icon: Icon, color, activeColor }: any) => {
  const isActive = current === type;
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg border transition-all ${isActive ? activeColor : color}`}
      title={type}
    >
      <Icon size={18} />
    </button>
  );
};