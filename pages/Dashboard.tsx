import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserRole, AttendanceStatus } from '../types';
import { Users, BookOpen, Clock, CalendarCheck, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export const Dashboard = () => {
  const { user } = useAuth();
  const { students, classes, attendanceRecords, getStudentAttendance } = useData();

  // Admin Stats
  const totalStudents = students.length;
  const totalClasses = classes.length;
  const recentAttendance = attendanceRecords.slice(-100); // simplified recent
  const presentCount = recentAttendance.filter(r => r.status === AttendanceStatus.PRESENT).length;
  const attendanceRate = recentAttendance.length ? Math.round((presentCount / recentAttendance.length) * 100) : 0;

  // Student Stats
  const myAttendance = user?.studentDetails ? getStudentAttendance(user.id) : [];
  const myPresent = myAttendance.filter(r => r.status === AttendanceStatus.PRESENT).length;
  const myRate = myAttendance.length ? Math.round((myPresent / myAttendance.length) * 100) : 0;

  // Chart Data Preparation
  const chartData = [
    { name: 'Present', value: user?.role === UserRole.STUDENT ? myPresent : presentCount, color: '#10b981' },
    { name: 'Absent', value: user?.role === UserRole.STUDENT ? myAttendance.filter(r => r.status === AttendanceStatus.ABSENT).length : recentAttendance.filter(r => r.status === AttendanceStatus.ABSENT).length, color: '#ef4444' },
    { name: 'Late', value: user?.role === UserRole.STUDENT ? myAttendance.filter(r => r.status === AttendanceStatus.LATE).length : recentAttendance.filter(r => r.status === AttendanceStatus.LATE).length, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name.split(' ')[0]}!</h1>
        <p className="text-slate-500">Here's what's happening at GCC Charsadda today.</p>
      </div>

      {/* Role Based Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user?.role === UserRole.ADMIN && (
          <>
            <StatCard label="Total Students" value={totalStudents} icon={Users} color="bg-blue-500" />
            <StatCard label="Active Classes" value={totalClasses} icon={BookOpen} color="bg-indigo-500" />
            <StatCard label="Avg Attendance" value={`${attendanceRate}%`} icon={TrendingUp} color="bg-emerald-500" />
            <StatCard label="Recent Records" value={recentAttendance.length} icon={ClipboardCheck} color="bg-purple-500" />
          </>
        )}
        
        {user?.role === UserRole.TEACHER && (
          <>
            <StatCard label="My Classes" value="3" icon={BookOpen} color="bg-blue-500" />
            <StatCard label="Students Tracked" value={students.length} icon={Users} color="bg-indigo-500" />
            <StatCard label="Attendance Today" value="85%" icon={CalendarCheck} color="bg-emerald-500" />
            <StatCard label="Pending Reports" value="0" icon={Clock} color="bg-amber-500" />
          </>
        )}

        {user?.role === UserRole.STUDENT && (
          <>
            <StatCard label="My Attendance" value={`${myRate}%`} icon={TrendingUp} color={myRate > 75 ? "bg-emerald-500" : "bg-red-500"} />
            <StatCard label="Days Present" value={myPresent} icon={CalendarCheck} color="bg-blue-500" />
            <StatCard label="Days Absent" value={myAttendance.length - myPresent} icon={Clock} color="bg-red-500" />
            <StatCard label="Total Classes" value={myAttendance.length} icon={BookOpen} color="bg-indigo-500" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Attendance Overview</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions / Notices */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Notices</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 text-sm">Exam Schedule</h4>
              <p className="text-xs text-blue-600 mt-1">Mid-term exams for BS Commerce start next Monday.</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <h4 className="font-semibold text-amber-800 text-sm">Attendance Warning</h4>
              <p className="text-xs text-amber-600 mt-1">Students below 75% attendance will not be allowed to sit in finals.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Import needed for component to work, reusing icon from layout import
import { ClipboardCheck } from 'lucide-react';