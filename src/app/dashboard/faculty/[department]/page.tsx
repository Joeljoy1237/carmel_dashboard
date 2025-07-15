'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { departmentMap } from '@/common/interface/interface'
import { db } from '@/common/libs/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

export default function FacultyPage() {
  const params = useParams()
  let code = params?.department
  if (Array.isArray(code)) code = code[0]
  const departmentCode = code ? code.toLowerCase() : ''
  const departmentName =
    code && departmentMap[code.toUpperCase()]
      ? departmentMap[code.toUpperCase()]
      : 'Department'

  const [facultyList, setFacultyList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFaculty() {
      setLoading(true)
      setError(null)
      try {
        const q = query(
          collection(db, 'faculties'),
          where('departmentCode', '==', departmentCode)
        )
        const querySnapshot = await getDocs(q)
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setFacultyList(data)
      } catch (err: any) {
        setError('Failed to fetch faculty list')
      } finally {
        setLoading(false)
      }
    }
    if (departmentCode) fetchFaculty()
  }, [departmentCode])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-2xl font-bold text-gray-700 tracking-tight">{departmentName} Faculty</h3>
        <button className="py-2 px-6 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 hover:scale-105 transition-all duration-200">
          <Link href={`./${code}/new`}> Add New Faculty</Link>
        </button>
      </div>
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : facultyList.length === 0 ? (
        <div className="text-center text-gray-400">No faculty found for this department.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 px-2 md:px-0">
          {facultyList.map((faculty, idx) => (
            <Link key={faculty.id} href={`./${code}/${faculty.id}`}>
              <div
                className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden h-[60vh] w-[20vw] mx-auto transform transition-transform duration-200 hover:scale-101 hover:shadow-xl"
              >
                <div className="w-full h-3/5 bg-gray-200">
                  <Image
                    src={faculty.image || '/logomain.png'}
                    alt={faculty.name || 'Faculty'}
                    className="w-full h-full object-cover rounded-t-2xl"
                    width={208}
                    height={160}
                  />
                </div>
                <div className="flex-1 w-full flex flex-col items-center justify-center p-4">
                  <div className="font-bold text-lg text-gray-800 text-center mb-1">{faculty.name}</div>
                  <div className="text-gray-500 text-base text-center tracking-wide">{faculty.designation || faculty.title}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
