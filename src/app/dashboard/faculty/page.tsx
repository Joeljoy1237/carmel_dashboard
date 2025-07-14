'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

const departments = [
  { name: 'Civil Engineering', code: 'CE' },
  { name: 'Electrical & Electronics Engineering', code: 'EEE' },
  { name: 'Mechanical Engineering', code: 'ME' },
  { name: 'Computer Science & Engineering', code: 'CSE' },
  { name: 'Science & Humanities', code: 'SH' },
  { name: 'Career Guidance & Placement', code: 'CGP' },
  { name: 'Physical Education', code: 'PE' },
]

const Page = () => {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="w-full max-w-xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-blue-100">
        {/* Logo placeholder */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
            <span role="img" aria-label="logo">🎓</span>
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-center mb-2 text-blue-700">Select Department</h2>
        <p className="text-center text-gray-500 mb-8">Choose your department to fill in the faculty form</p>
        <div className="flex flex-col gap-4">
          {departments.map(dep => (
            <button
              key={dep.code}
              className="flex items-center justify-between px-6 py-4 text-lg rounded-xl border border-gray-200 bg-gray-50 hover:bg-blue-100 active:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 group shadow-sm"
              onClick={() => router.push(`/dashboard/faculty/${dep.code}`)}
              aria-label={`Select ${dep.name}`}
            >
              <span className="font-medium text-left">{dep.name}</span>
              <span className="font-bold text-blue-700 text-xl group-hover:scale-110 transition-transform">{dep.code}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Page