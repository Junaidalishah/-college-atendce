import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { generateAttendanceAnalysis } from '../services/gemini';
import { Bot, FileDown, Loader2, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AttendanceStatus } from '../types';

export const Reports = () => {
  const { attendanceRecords, students, classes } = useData();
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Aggregation for charts
  const statusCounts = attendanceRecords.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = [
    { name: 'Present', value: statusCounts[AttendanceStatus.PRESENT] || 0, color: '#10b981' },
    { name: 'Absent', value: statusCounts[AttendanceStatus.ABSENT] || 0, color: '#ef4444' },
    { name: 'Late', value: statusCounts[AttendanceStatus.LATE] || 0, color: '#f59e0b' },
    { name: 'Excused', value: statusCounts[AttendanceStatus.EXCUSED] || 0, color: '#6366f1' },
  ].filter(d => d.value > 0);

  const handleGenerateInsight = async () => {
    setLoadingAi(true);
    const result = await generateAttendanceAnalysis(attendanceRecords, students, classes);
    setAiAnalysis(result);
    setLoadingAi(false);
  };

  const downloadCSV = () => {
    const headers = ['Date', 'Student ID', 'Class', 'Section', 'Status'];
    const rows = attendanceRecords.map(r => [
      r.date, r.studentId, r.classId, r.section, r.status
    ].join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Insights</h1>
          <p className="text-slate-500">Visualize attendance trends and export data.</p>
        </div>
        <button 
          onClick={downloadCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <FileDown size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px]">
          <h3 className="font-bold text-slate-800 mb-6">Overall Attendance Distribution</h3>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">
              No attendance data recorded yet.
            </div>
          )}
        </div>

        {/* AI Insight Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl shadow-sm border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-indigo-700">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold">AI Smart Analysis</h3>
            </div>
            {!aiAnalysis && (
              <button 
                onClick={handleGenerateInsight}
                disabled={loadingAi}
                className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loadingAi ? 'Analyzing...' : 'Generate Insight'}
              </button>
            )}
          </div>

          <div className="prose prose-sm prose-indigo bg-white/50 p-4 rounded-lg min-h-[200px] border border-indigo-50/50">
             {loadingAi ? (
               <div className="flex flex-col items-center justify-center h-full space-y-3 py-10">
                 <Loader2 className="animate-spin text-indigo-500" size={32} />
                 <p className="text-slate-500 text-xs">Consulting Gemini Model...</p>
               </div>
             ) : aiAnalysis ? (
               <div className="whitespace-pre-line text-slate-700 leading-relaxed">
                 {aiAnalysis}
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center h-full py-10 text-slate-400 text-center">
                 <Bot size={48} className="mb-3 opacity-20" />
                 <p>Click "Generate Insight" to get a summary and recommendations based on current data.</p>
               </div>
             )}
          </div>
          {aiAnalysis && (
             <div className="mt-4 flex justify-end">
                <button onClick={() => setAiAnalysis(null)} className="text-xs text-slate-500 hover:text-indigo-600 underline">Clear Analysis</button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};