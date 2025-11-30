import { GoogleGenAI } from "@google/genai";
import { AttendanceRecord, Student, ClassSection } from "../types";

const apiKey = process.env.API_KEY || ''; // In a real app, handle missing key gracefully
const ai = new GoogleGenAI({ apiKey });

export const generateAttendanceAnalysis = async (
  records: AttendanceRecord[],
  students: Student[],
  classes: ClassSection[]
): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please configure the environment to use AI insights.";
  }

  // Prepare data summary for the prompt
  const totalRecords = records.length;
  const presentCount = records.filter(r => r.status === 'PRESENT').length;
  const absentCount = records.filter(r => r.status === 'ABSENT').length;
  const lateCount = records.filter(r => r.status === 'LATE').length;
  
  const attendanceRate = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : 0;

  const prompt = `
    You are an AI assistant for the Government Commerce College Charsadda attendance system.
    Analyze the following attendance data summary and provide brief, actionable insights for the administration.
    
    Data Summary:
    - Total Attendance Records: ${totalRecords}
    - Overall Attendance Rate: ${attendanceRate}%
    - Present: ${presentCount}
    - Absent: ${absentCount}
    - Late: ${lateCount}
    - Total Classes Tracked: ${classes.length}
    - Total Students Tracked: ${students.length}

    Please provide:
    1. A quick sentiment analysis of the attendance.
    2. Two key recommendations to improve student punctuality or attendance based on general educational best practices.
    
    Keep the response concise (under 150 words) and professional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate AI insights at this time. Please try again later.";
  }
};