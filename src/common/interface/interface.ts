// import { Timestamp } from "firebase/firestore";


export const departmentMap: Record<string, string> = {
    CE: 'Civil Engineering',
    EEE: 'Electrical & Electronics Engineering',
    ME: 'Mechanical Engineering',
    CSE: 'Computer Science & Engineering',
    SH: 'Science & Humanities',
    CGP: 'Career Guidance & Placement',
    PE: 'Physical Education',
}

export const departments = [
    { name: 'Civil Engineering', code: 'CE' },
    { name: 'Electrical & Electronics Engineering', code: 'EEE' },
    { name: 'Mechanical Engineering', code: 'ME' },
    { name: 'Computer Science & Engineering', code: 'CSE' },
    { name: 'Science & Humanities', code: 'SH' },
    { name: 'Career Guidance & Placement', code: 'CGP' },
    { name: 'Physical Education', code: 'PE' },
]

export type MultiValues = Record<string, string[]>;

export type SingleFields = {
  name: string;
  designation: string;
  qualification: string;
  specialization: string;
  email: string;
  contact: string;
  joinDate: string;
  departmentCode: string;
  departmentName: string;
  image?: string;
};