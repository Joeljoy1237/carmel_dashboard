'use client'
import React, { useEffect, useState } from 'react';
import { db, storage } from '@/common/libs/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { useParams } from 'next/navigation';
import { departmentMap } from '@/common/interface/interface';
import Link from 'next/link';
import Image from 'next/image';
const multiFields = [
  { key: 'experience', label: 'Experience' },
  { key: 'publications', label: 'Publications' },
  { key: 'conferences', label: 'Conferences' },
  { key: 'memberships', label: 'Memberships' },
  { key: 'teachingInterests', label: 'Teaching Interests' },
  { key: 'researchInterest', label: 'Research Interest' },
  { key: 'expertise', label: 'Expertise (software/technology/machine)' },
  { key: 'subjectsHandled', label: 'Subjects handled' },
  { key: 'fdps', label: 'FDP’s, Trainings/Certificate courses (Major Only)' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'positionsHeld', label: 'Positions held' },
  { key: 'website', label: 'Website' },
];

type MultiValues = Record<string, string[]>;

type SingleFields = {
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

const FacultyDetailsPage: React.FC = () => {
  const params = useParams();
  const { department, facultyId } = params as { department: string; facultyId: string };
  const [singleFields, setSingleFields] = useState<SingleFields | null>(null);
  const [multiValues, setMultiValues] = useState<MultiValues>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFaculty() {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, 'faculties', facultyId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSingleFields({
            name: data.name || '',
            designation: data.designation || '',
            qualification: data.qualification || '',
            specialization: data.specialization || '',
            email: data.email || '',
            contact: data.contact || '',
            joinDate: data.joinDate || '',
            departmentCode: data.departmentCode || '',
            departmentName: data.departmentName || departmentMap[(data.departmentCode || '').toUpperCase()] || '',
            image: data.image || '',
          });
          const multi: MultiValues = {};
          multiFields.forEach(f => {
            multi[f.key] = Array.isArray(data[f.key]) ? data[f.key] : [];
          });
          setMultiValues(multi);
        } else {
          setError('Faculty not found.');
        }
      } catch (err) {
        setError('Failed to fetch faculty details.');
      } finally {
        setLoading(false);
      }
    }
    if (facultyId) fetchFaculty();
  }, [facultyId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }
  if (!singleFields) return null;

  // Add delete handler
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this faculty?')) return;
    setLoading(true);
    setError(null);
    try {
      // Delete image from storage if exists
      if (singleFields?.image) {
        try {
          // Extract the storage path from the image URL
          const match = singleFields.image.match(/%2F([^?]+)\?/);
          const fileName = match ? decodeURIComponent(match[1]) : null;
          if (fileName) {
            const storageRef = ref(storage, `faculty_images/${fileName}`);
            await deleteObject(storageRef);
          }
        } catch (imgErr) {
          // Ignore image deletion errors, but log them
          console.error('Image deletion error:', imgErr);
        }
      }
      const docRef = doc(db, 'faculties', facultyId);
      await deleteDoc(docRef);
      window.location.href = `/dashboard/faculty/${department}`;
    } catch (err) {
      setError('Failed to delete faculty.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-8 relative">
        {/* Action Buttons */}
        <div className="absolute top-6 right-8 flex gap-3 z-10">
          <Link
            href={`/dashboard/faculty/${department}/${facultyId}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition text-sm font-semibold"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition text-sm font-semibold"
          >
            Delete
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
          <div className="w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
            {singleFields.image ? (
              <Image src={singleFields.image} alt={singleFields.name} className="w-full h-full object-cover" width={160} height={160} />
            ) : (
              <span className="text-gray-400 text-6xl">👤</span>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="text-2xl font-bold text-gray-800">{singleFields.name}</div>
            <div className="text-lg text-blue-700 font-semibold">{singleFields.designation}</div>
            <div className="text-gray-600">{singleFields.qualification}</div>
            <div className="text-gray-600">{singleFields.specialization}</div>
            <div className="text-gray-500">{singleFields.email}</div>
            <div className="text-gray-500">{singleFields.contact}</div>
            <div className="text-gray-500">Joined: {singleFields.joinDate}</div>
            <div className="flex gap-4 mt-2">
              <span className="px-3 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                {singleFields.departmentCode.toUpperCase()}
              </span>
              <span className="px-3 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                {singleFields.departmentName}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h2>
          <div className="space-y-6">
            {multiFields.map(field => (
              <div key={field.key}>
                <div className="block text-sm font-medium text-gray-700 mb-1">{field.label}</div>
                <ul className="list-disc pl-6 space-y-1 min-h-[1.5rem]">
                  {multiValues[field.key] && multiValues[field.key].length > 0 ? (
                    multiValues[field.key].map((val, idx) => (
                      <li key={idx} className="text-gray-700">{val}</li>
                    ))
                  ) : (
                    <li className="text-gray-400 italic text-sm select-none">No points added.</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDetailsPage;