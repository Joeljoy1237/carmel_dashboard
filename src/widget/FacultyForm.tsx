'use client'
import React, { useState } from 'react'
import { db, storage } from '@/common/libs/firebase'
import { collection, addDoc, Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import easyToast from '@/common/components/CustomToast'
import { departmentMap } from '@/common/interface/interface'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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
};

const FacultyForm: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  console.log(params);
  let departmentCode = params?.department;
  const facultyId = params?.facultyId;
  if (Array.isArray(departmentCode)) departmentCode = departmentCode[0];
  departmentCode = departmentCode ? departmentCode.toUpperCase() : '';
  const departmentName = departmentMap[departmentCode] || '';
  const isEdit = !!facultyId;

  const [multiValues, setMultiValues] = useState<MultiValues>(() => {
    const initial: MultiValues = {};
    multiFields.forEach(f => { initial[f.key] = []; });
    return initial;
  });

  // Temporary input for each multi-entry field
  const [multiInputs, setMultiInputs] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    multiFields.forEach(f => { initial[f.key] = ''; });
    return initial;
  });

  const [singleFields, setSingleFields] = useState<SingleFields>({
    name: '',
    designation: '',
    qualification: '',
    specialization: '',
    email: '',
    contact: '',
    joinDate: '',
    departmentCode: departmentCode.toLowerCase(),
    departmentName: departmentName,
  });

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  // Track the original image for edit mode
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  React.useEffect(() => {
    async function fetchFaculty() {
      if (!facultyId) return;
      try {
        const docRef = doc(db, 'faculties', typeof facultyId === 'string' ? facultyId : facultyId?.[0] ?? '');
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
          });
          const multi: MultiValues = {};
          multiFields.forEach(f => {
            multi[f.key] = Array.isArray(data[f.key]) ? data[f.key] : [];
          });
          setMultiValues(multi);
          if (data.image) {
            setImagePreview(data.image);
            setOriginalImage(data.image);
          }
        }
      } catch (err) {
        easyToast({ type: 'error', message: 'Failed to fetch faculty details.' });
      }
    }
    fetchFaculty();
  }, [facultyId]);

  const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSingleFields(prev => ({ ...prev, [name]: value }));
  };

  // For the input field for new point
  const handleMultiInputChange = (key: string, value: string) => {
    setMultiInputs(prev => ({ ...prev, [key]: value }));
  };

  // Add new point to the list
  const handleAdd = (key: string) => {
    const value = multiInputs[key].trim();
    if (!value) return;
    setMultiValues(prev => ({ ...prev, [key]: [...prev[key], value] }));
    setMultiInputs(prev => ({ ...prev, [key]: '' }));
  };

  // Remove point from the list
  const handleRemove = (key: string, idx: number) => {
    setMultiValues(prev => {
      const arr = [...prev[key]];
      arr.splice(idx, 1);
      return { ...prev, [key]: arr };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Clean up preview URL when file changes or component unmounts
  React.useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    let imageUrl = imagePreview || '';
    try {
      // If editing and image was removed, delete from storage
      if (isEdit && originalImage && !imagePreview) {
        try {
          const { ref, deleteObject } = await import('firebase/storage');
          const match = originalImage.match(/%2F([^?]+)\?/);
          const fileName = match ? decodeURIComponent(match[1]) : null;
          if (fileName) {
            const storageRef = ref(storage, `faculty_images/${fileName}`);
            await deleteObject(storageRef);
          }
        } catch (imgErr) {
          console.error('Image deletion error:', imgErr);
        }
        imageUrl = '';
      }
      if (imageFile) {
        const storageRef = ref(storage, `faculty_images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      const data = {
        ...singleFields,
        ...multiValues,
        image: imageUrl,
        createdAt: Timestamp.now(),
      };
      if (isEdit) {
        // Don't overwrite createdAt on update
        delete data.createdAt;
        const docRef = doc(db, 'faculties', typeof facultyId === 'string' ? facultyId : facultyId?.[0] ?? '');
        await updateDoc(docRef, data);
        easyToast({ type: 'success', message: 'Faculty updated successfully!' });
      } else {
        await addDoc(collection(db, 'faculties'), data);
        easyToast({ type: 'success', message: 'Faculty added successfully!' });
      }
      setSingleFields({
        name: '',
        designation: '',
        qualification: '',
        specialization: '',
        email: '',
        contact: '',
        joinDate: '',
        departmentCode: departmentCode,
        departmentName: departmentName,
      });
      setMultiValues(() => {
        const initial: MultiValues = {};
        multiFields.forEach(f => { initial[f.key] = []; });
        return initial;
      });
      setMultiInputs(() => {
        const initial: Record<string, string> = {};
        multiFields.forEach(f => { initial[f.key] = ''; });
        return initial;
      });
      setImageFile(null);
      setImagePreview(null);
      setOriginalImage(null);
      router.push(`/dashboard/faculty/${departmentCode}`);
    } catch (err) {
      easyToast({ type: 'error', message: isEdit ? 'Failed to update faculty.' : 'Failed to add faculty.' });
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Add New Faculty</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Department Info Section */}
          <div className="mb-8 p-4 rounded-lg bg-blue-50 border border-blue-200 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 flex flex-col items-center md:items-start">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Department Code</span>
              <span className="text-lg font-bold text-blue-900 mt-1">{singleFields.departmentCode.toUpperCase()}</span>
            </div>
            <div className="flex-1 flex flex-col items-center md:items-start">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Department Name</span>
              <span className="text-lg font-bold text-blue-900 mt-1">{singleFields.departmentName}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" id="name" name="name" required value={singleFields.name} onChange={handleSingleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input type="text" id="designation" name="designation" required value={singleFields.designation} onChange={handleSingleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
              <input type="text" id="qualification" name="qualification" required value={singleFields.qualification} onChange={handleSingleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <input type="text" id="specialization" name="specialization" required value={singleFields.specialization} onChange={handleSingleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="email" name="email" required value={singleFields.email} onChange={handleSingleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
              <input type="text" id="contact" name="contact" required value={singleFields.contact} onChange={handleSingleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
              <input
                type="date"
                id="joinDate"
                name="joinDate"
                required
                value={singleFields.joinDate}
                onChange={handleSingleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <div className="flex flex-col items-center w-full">
                {!imagePreview && (
                  <label
                    htmlFor="image"
                    className="w-full flex flex-col items-center justify-center px-4 py-8 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition group focus-within:ring-2 focus-within:ring-blue-400"
                  >
                    <svg className="w-10 h-10 text-blue-400 mb-2 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 10V6a4 4 0 00-8 0v4M12 16v-4m0 0l-2 2m2-2l2 2" />
                    </svg>
                    <span className="text-blue-700 font-medium">Click to upload or drag & drop</span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG, GIF up to 5MB</span>
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
                {imagePreview && (
                  <div className="mt-4 flex flex-col items-center w-full">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-w-xl object-contain rounded-xl border border-gray-200 shadow-md mb-2 transition-all duration-200"
                      width={400}
                      height={300}
                    />
                    {imageFile && (
                      <span className="text-xs text-gray-600 mt-1">{imageFile.name}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="mt-3 px-4 py-1.5 bg-red-100 text-red-700 rounded shadow border border-red-200 hover:bg-red-200 transition"
                    >Remove Image</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h2>
            <div className="space-y-6">
              {multiFields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <div className="flex items-center mb-2">
                    <textarea
                      value={multiInputs[field.key]}
                      onChange={e => handleMultiInputChange(field.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y min-h-[2.5rem]"
                      placeholder={`Add ${field.label}`}
                      rows={2}
                    />
                    <button
                      type="button"
                      onClick={() => handleAdd(field.key)}
                      className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded border border-blue-200 hover:bg-blue-200 transition"
                    >Add</button>
                  </div>
                  <ul className="list-disc pl-6 space-y-1 min-h-[1.5rem]">
                    {multiValues[field.key].length === 0 ? (
                      <li className="text-gray-400 italic text-sm select-none">No points added yet.</li>
                    ) : (
                      multiValues[field.key].map((val, idx) => (
                        <li key={idx}>
                          <div className="flex items-center justify-between group">
                            <span>{val}</span>
                            <button
                              type="button"
                              onClick={() => handleRemove(field.key, idx)}
                              className="ml-4 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded border border-red-200 hover:bg-red-200 transition"
                            >Remove</button>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 flex justify-center">
            <button type="submit" className="px-8 py-2 bg-blue-600 text-white font-semibold rounded shadow hover:bg-blue-700 transition" disabled={uploading}>
              {uploading ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Faculty' : 'Add Faculty')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FacultyForm
