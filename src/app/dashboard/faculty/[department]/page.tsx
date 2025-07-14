'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const departmentMap: Record<string, string> = {
  CE: 'Civil Engineering',
  EEE: 'Electrical & Electronics Engineering',
  ME: 'Mechanical Engineering',
  CSE: 'Computer Science & Engineering',
  SH: 'Science & Humanities',
  CGP: 'Career Guidance & Placement',
  PE: 'Physical Education',
}

const facultyList = [
  {
    id: 1,
    name: 'Mr.ANOOP R.S',
    title: 'Assistant Professor',
    image: '/anoop.jpg',
  },
  {
    id: 2,
    name: 'Ms. Jane Smith',
    title: 'Assistant Professor',
    image: '/logomain.png',
  },
]

export default function FacultyPage() {
  const params = useParams()
  let code = params?.department
  if (Array.isArray(code)) code = code[0]
  const departmentName =
    code && departmentMap[code.toUpperCase()]
      ? departmentMap[code.toUpperCase()]
      : 'Department'

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-2xl font-bold text-gray-700 tracking-tight">{departmentName} Faculty</h3>
        <button className="py-2 px-6 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 hover:scale-105 transition-all duration-200">
          Add New Faculty
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 px-2 md:px-0">
        {facultyList.map((faculty, idx) => (
          <Link key={idx} href={`./${code}/${faculty.id}`}>
            <div
              className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden h-[60vh] w-[20vw] mx-auto transform transition-transform duration-200 hover:scale-101 hover:shadow-xl"
            >
              <div className="w-full h-3/5 bg-gray-200">
                <Image
                src={faculty.image}
                alt={faculty.name}
                className="w-full h-full object-cover rounded-t-2xl"
                width={208}
                height={160}
              />
            </div>
            <div className="flex-1 w-full flex flex-col items-center justify-center p-4">
              <div className="font-bold text-lg text-gray-800 text-center mb-1">{faculty.name}</div>
              <div className="text-gray-500 text-base text-center tracking-wide">{faculty.title}</div>
            </div>
            </div>
            </Link>
        ))}
      </div>
    </div>
  )
}
