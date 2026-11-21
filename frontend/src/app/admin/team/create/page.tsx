'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Users, Star } from 'lucide-react';
import { TeamDepartment } from '../../../../lib/types';
import api from '../../../../lib/api';
import MediaUploadPicker from '../../../../components/common/MediaUploadPicker';

export default function CreateTeamMemberPage() {
  const router = useRouter();

  const [departments, setDepartments] = useState<TeamDepartment[]>([]);
  const [nameGu, setNameGu] = useState('');
  const [name, setName] = useState('');
  const [designationGu, setDesignationGu] = useState('');
  const [designation, setDesignation] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [district, setDistrict] = useState('વડોદરા');
  const [experienceYears, setExperienceYears] = useState(5);
  const [photoUrl, setPhotoUrl] = useState('');
  const [bioGu, setBioGu] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    api
      .get('/admin/team/departments')
      .then((res) => {
        if (res.data?.success && res.data.data.length > 0) {
          setDepartments(res.data.data);
          setDepartmentId(res.data.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameGu || !designationGu || !departmentId) {
      alert('કૃપા કરીને સભ્યનું નામ, હોદ્દો અને વિભાગ દાખલ કરો.');
      return;
    }

    try {
      await api.post('/admin/team/members', {
        name: name || nameGu,
        nameGu,
        designation: designation || designationGu,
        designationGu,
        departmentId,
        district,
        experienceYears,
        photoUrl,
        bioGu,
        isFeatured,
      });

      alert('ટીમ સભ્ય સફળતાપૂર્વક ઉમેરાયા!');
      router.push('/admin/team');
    } catch {
      alert('ટીમ સભ્ય ઉમેરવામાં નિષ્ફળતા.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-gujarati text-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/team"
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900">
              નવો ટીમ સભ્ય ઉમેરો (Add Team Member)
            </h1>
            <p className="text-xs text-gray-500">
              સંપાદકીય બોર્ડ, એન્કર્સ અથવા રિપોર્ટર્સની વિગતો દાખલ કરો
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">ગુજરાતી નામ *</label>
              <input
                type="text"
                required
                value={nameGu}
                onChange={(e) => setNameGu(e.target.value)}
                placeholder="દા.ત. નિલેશ પટેલ"
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary text-sm font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">અંગ્રેજી નામ (English Name)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nilesh Patel"
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">ગુજરાતી હોદ્દો (Designation) *</label>
              <input
                type="text"
                required
                value={designationGu}
                onChange={(e) => setDesignationGu(e.target.value)}
                placeholder="દા.ત. સીનિયર ન્યૂઝ એન્કર"
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">વિભાગ (Department) *</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.nameGu}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">જિલ્લો / કાર્યક્ષેત્ર</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="દા.ત. વડોદરા, અમદાવાદ"
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">અનુભવ (વર્ષમાં)</label>
              <input
                type="number"
                min={0}
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value, 10))}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
              />
            </div>
          <div>
            <MediaUploadPicker
              label="પ્રોફાઇલ ફોટો (Profile Photo)"
              value={photoUrl}
              onChange={setPhotoUrl}
              acceptType="image"
              helperText="સભ્યનો પાસપોર્ટ સાઇઝ અથવા પોર્ટ્રેટ ફોટો અપલોડ કરો અથવા પસંદ કરો."
            />
          </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">ટૂંકો પરિચય (Biography)</label>
            <textarea
              rows={3}
              value={bioGu}
              onChange={(e) => setBioGu(e.target.value)}
              placeholder="પત્રકારત્વ ક્ષેત્રે યોગદાન અને અનુભવની વિગતો..."
              className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-primary"
              />
              <span>નેતૃત્વ પેનલ પર દર્શાવો (Feature in Leadership Board)</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/team"
            className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs"
          >
            રદ કરો
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs transition-colors shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-accent-gold" />
            <span>ટીમ સભ્ય સાચવો</span>
          </button>
        </div>
      </form>
    </div>
  );
}
