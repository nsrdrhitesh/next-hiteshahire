"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumb } from '../../../../components/ui/breadcrumb';
import { showError } from '../../../../lib/swalHelper';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "http://localhost:3003/api/v1";

// ======================== INTERFACES ========================
interface MemberBasicData {
  id: number;
  profile_for_id: number;
  profile_for_name?: string;
  mobile_no: string;
  email: string;
  gender_id: number;
  gender_name?: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  date_of_birth: string;
  password: string;
}

interface MemberReligionData {
  member_id: number;
  religion_id: number;
  religion_name?: string;
  caste_id: number;
  caste_name?: string;
  sub_caste_id: number;
  sub_caste_name?: string;
  sub_sub_caste_id: number;
  sub_sub_caste_name?: string;
  mother_tongue_id: number;
  mother_tongue_name?: string;
}

interface MemberPersonalData {
  member_id: number;
  height_id: number;
  height_name?: string;
  blood_group_id: number;
  blood_group_name?: string;
  has_disability: number;
  disability_details: string | null;
  marital_status_id: number;
  marital_status_name?: string;
  birth_time: string;
  birth_place_id: number;
  birth_place_name?: string;
  have_child_id: number;
  have_child_name?: string;
  number_of_child_id: number;
  number_of_child_name?: string;
}

interface MemberEducationData {
  member_id: number;
  highest_education_id: number;
  highest_education_name?: string;
  highest_education_other: string | null;
  specification_id: number;
  specification_name?: string;
  specification_other: string | null;
  employment_type_id: number;
  employment_type_name?: string;
  occupation_id: number | null;
  occupation_name?: string;
  business_type_id: number | null;
  business_type_name?: string;
  business_location: string | null;
  designation: string | null;
  company_name: string | null;
  job_title: string | null;
  work_mode_id: number | null;
  work_mode_name?: string;
  work_location: string | null;
  annual_income_id: number | null;
  annual_income_name?: string;
}

interface MemberLocationData {
  member_id: number;
  permanent_country_id: number;
  permanent_country_name?: string;
  permanent_state_id: number;
  permanent_state_name?: string;
  permanent_city_id: number;
  permanent_city_name?: string;
  present_country_id: number;
  present_country_name?: string;
  present_state_id: number;
  present_state_name?: string;
  present_city_id: number;
  present_city_name?: string;
  is_same_as_permanent: number;
  citizenship_id: number;
  citizenship_name?: string;
  current_residence: string;
  is_nri: number;
  is_abroad: number;
  visa_status_id: number | null;
  visa_status_name?: string;
  visa_type_id: number | null;
  visa_type_name?: string;
}

interface MemberPartnerPreferenceData {
  member_id: number;
  religion_ids: string;
  caste_ids: string;
  mother_tongue_ids: string;
  min_age: number;
  max_age: number;
  min_height_id: number;
  min_height_name?: string;
  max_height_id: number;
  max_height_name?: string;
  marital_status_ids: string;
  min_income_id: number;
  min_income_name?: string;
  max_income_id: number;
  max_income_name?: string;
  country_ids: string;
  state_ids: string;
  city_ids: string;
  education_ids: string;
  occupation_ids: string;
}

interface MemberPhoto {
  id: number;
  image: string;
  type: number;
}

// ======================== HELPER FUNCTIONS ========================
const parseJSONArray = (jsonString: string | null | undefined): string[] => {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch (e) {
    return [];
  }
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatTime = (timeString: string): string => {
  if (!timeString) return "N/A";
  return timeString.slice(0, 5);
};

const calculateAge = (dob: string): number => {
  if (!dob) return 0;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// ======================== SECTION COMPONENTS ========================
interface SectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const InfoSection = ({ title, children, icon }: SectionProps) => (
  <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800/50">
    <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 dark:border-gray-700">
      {icon && <div className="text-purple-600">{icon}</div>}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
    </div>
    {children}
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col border-b border-gray-100 py-3 last:border-0 dark:border-gray-700 sm:flex-row sm:items-start">
    <div className="w-full text-sm font-semibold text-gray-600 dark:text-gray-400 sm:w-1/3">
      {label}
    </div>
    <div className="mt-1 w-full text-sm text-gray-900 dark:text-white sm:mt-0 sm:w-2/3">
      {value || "—"}
    </div>
  </div>
);

const Badge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" | "info" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

// ======================== MAIN COMPONENT ========================
export default function MemberDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [basicData, setBasicData] = useState<MemberBasicData | null>(null);
  const [religionData, setReligionData] = useState<MemberReligionData | null>(null);
  const [personalData, setPersonalData] = useState<MemberPersonalData | null>(null);
  const [educationData, setEducationData] = useState<MemberEducationData | null>(null);
  const [locationData, setLocationData] = useState<MemberLocationData | null>(null);
  const [partnerData, setPartnerData] = useState<MemberPartnerPreferenceData | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<MemberPhoto[]>([]);

  // Computed values
  const fullName = basicData
    ? `${basicData.first_name} ${basicData.middle_name || ""} ${basicData.last_name}`.trim().replace(/\s+/g, " ")
    : "";
  const age = basicData ? calculateAge(basicData.date_of_birth) : 0;

  // Helper function to fetch with auth
  const fetchWithAuth = async (url: string) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      throw new Error("No access token");
    }
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  };

  // Fetch all member data
  useEffect(() => {
    if (!memberId) return;

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch basic data
        const basicRes = await fetchWithAuth(`${API_URL}/member-get/personal-basic/${memberId}`);
        if (basicRes.success && basicRes.data?.data) {
          setBasicData(basicRes.data.data);
        }

        // Fetch religion data
        const religionRes = await fetchWithAuth(`${API_URL}/member-get/profile-religion/${memberId}`);
        if (religionRes.success && religionRes.data?.data) {
          setReligionData(religionRes.data.data);
        }

        // Fetch personal data
        const personalRes = await fetchWithAuth(`${API_URL}/member-get/personal-basic/${memberId}`);
        if (personalRes.success && personalRes.data?.data) {
          setPersonalData(personalRes.data.data);
        }

        // Fetch education data
        const educationRes = await fetchWithAuth(`${API_URL}/member-get/education-profession/${memberId}`);
        if (educationRes.success && educationRes.data?.data) {
          setEducationData(educationRes.data.data);
        }

        // Fetch location data
        const locationRes = await fetchWithAuth(`${API_URL}/member-get/location/${memberId}`);
        if (locationRes.success && locationRes.data?.data) {
          setLocationData(locationRes.data.data);
        }

        // Fetch partner preference
        const partnerRes = await fetchWithAuth(`${API_URL}/member-get/partner-preference/${memberId}`);
        if (partnerRes.success && partnerRes.data?.data) {
          setPartnerData(partnerRes.data.data);
        }

        // Fetch profile photo
        const photoRes = await fetchWithAuth(`${API_URL}/member-get/profile-photo/${memberId}`);
        if (photoRes.success && photoRes.data?.data?.[0]?.image) {
          setProfilePhoto(`${process.env.NEXT_PUBLIC_BACKEND_DATA_PLAIN}${photoRes.data.data[0].image}`);
        }

        // Fetch gallery photos
        const galleryRes = await fetchWithAuth(`${API_URL}/member-get/gallery/${memberId}`);
        if (galleryRes.success && galleryRes.data?.data) {
          setGalleryPhotos(
            galleryRes.data.data.map((item: any) => ({
              id: item.id,
              image: `${process.env.NEXT_PUBLIC_BACKEND_DATA_PLAIN}${item.image}`,
              type: item.type,
            }))
          );
        }
      } catch (err: any) {
        console.error("Failed to fetch member data:", err);
        setError(err.message || "Failed to load member details");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [memberId, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading member details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error Loading Member</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={() => router.push("/admin/dashboard/members")}
            className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            Back to Members
          </button>
        </div>
      </div>
    );
  }

  if (!basicData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Member not found</p>
          <button
            onClick={() => router.push("/admin/dashboard/members")}
            className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            Back to Members
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Members", href: "/admin/dashboard/members" },
            { label: "Member Details" },
          ]}
        />
        <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Member Details: {fullName}
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Member ID: #{memberId} • {age} years • {basicData.gender_name || "Not specified"}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/admin/dashboard/members/create/${memberId}/religion-form`}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2.5 font-medium text-white shadow-sm transition-all hover:from-purple-700 hover:to-pink-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </Link>
            <button
              onClick={() => router.push("/admin/dashboard/members")}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to List
            </button>
          </div>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 shadow-xl">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Profile Photo */}
            <div className="relative h-32 w-32 overflow-hidden rounded-2xl border-4 border-white shadow-lg">
              {profilePhoto ? (
                <Image
                  src={profilePhoto}
                  alt={fullName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/20 text-6xl text-white">
                  👤
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white">{fullName}</h2>
              <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Badge variant="success">{age} Years</Badge>
                <Badge variant="info">{basicData.gender_name || "Gender not specified"}</Badge>
                {personalData?.marital_status_name && (
                  <Badge variant="warning">{personalData.marital_status_name}</Badge>
                )}
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-white/90 sm:justify-start">
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {basicData.email}
                </div>
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {basicData.mobile_no}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <InfoSection title="Personal Information" icon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }>
          <InfoRow label="Full Name" value={fullName} />
          <InfoRow label="Date of Birth" value={formatDate(basicData.date_of_birth)} />
          <InfoRow label="Age" value={`${age} years`} />
          <InfoRow label="Gender" value={basicData.gender_name || "Not specified"} />
          <InfoRow label="Mobile Number" value={basicData.mobile_no} />
          <InfoRow label="Email" value={basicData.email} />
          <InfoRow label="Profile For" value={basicData.profile_for_name || "Self"} />
        </InfoSection>

        {/* Religion & Community */}
        {religionData && (
          <InfoSection title="Religion & Community" icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          }>
            <InfoRow label="Religion" value={religionData.religion_name || "Not specified"} />
            <InfoRow label="Caste" value={religionData.caste_name || "Not specified"} />
            {religionData.sub_caste_id !== 0 && religionData.sub_caste_name && (
              <InfoRow label="Sub Caste" value={religionData.sub_caste_name} />
            )}
            {religionData.sub_sub_caste_id !== 0 && religionData.sub_sub_caste_name && (
              <InfoRow label="Sub-Sub Caste" value={religionData.sub_sub_caste_name} />
            )}
            <InfoRow label="Mother Tongue" value={religionData.mother_tongue_name || "Not specified"} />
          </InfoSection>
        )}

        {/* Physical & Medical */}
        {personalData && (
          <InfoSection title="Physical & Medical" icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }>
            <InfoRow label="Height" value={personalData.height_name || "Not specified"} />
            <InfoRow label="Blood Group" value={personalData.blood_group_name || "Not specified"} />
            <InfoRow label="Birth Time" value={personalData.birth_time ? formatTime(personalData.birth_time) : "Not specified"} />
            <InfoRow label="Birth Place" value={personalData.birth_place_name || "Not specified"} />
            <InfoRow label="Physical Disability" value={personalData.has_disability === 1 ? "Yes" : "No"} />
            {personalData.has_disability === 1 && personalData.disability_details && (
              <InfoRow label="Disability Details" value={personalData.disability_details} />
            )}
          </InfoSection>
        )}

        {/* Family Details */}
        {personalData && (
          <InfoSection title="Family Details" icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }>
            <InfoRow label="Marital Status" value={personalData.marital_status_name || "Not specified"} />
            {personalData.have_child_id !== 0 && personalData.have_child_name && (
              <InfoRow label="Have Children" value={personalData.have_child_name} />
            )}
            {personalData.number_of_child_id !== 0 && personalData.number_of_child_name && (
              <InfoRow label="Number of Children" value={personalData.number_of_child_name} />
            )}
          </InfoSection>
        )}

        {/* Education & Profession */}
        {educationData && (
          <InfoSection title="Education & Profession" icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          }>
            <InfoRow label="Highest Education" value={educationData.highest_education_name || "Not specified"} />
            {educationData.highest_education_other && (
              <InfoRow label="Other Education" value={educationData.highest_education_other} />
            )}
            <InfoRow label="Specialization" value={educationData.specification_name || "Not specified"} />
            {educationData.specification_other && (
              <InfoRow label="Other Specialization" value={educationData.specification_other} />
            )}
            <InfoRow label="Employment Type" value={educationData.employment_type_name || "Not specified"} />
            {educationData.occupation_name && (
              <InfoRow label="Occupation" value={educationData.occupation_name} />
            )}
            {educationData.designation && (
              <InfoRow label="Designation" value={educationData.designation} />
            )}
            {educationData.company_name && (
              <InfoRow label="Company Name" value={educationData.company_name} />
            )}
            {educationData.business_type_name && (
              <InfoRow label="Business Type" value={educationData.business_type_name} />
            )}
            {educationData.business_location && (
              <InfoRow label="Business Location" value={educationData.business_location} />
            )}
            {educationData.work_mode_name && (
              <InfoRow label="Work Mode" value={educationData.work_mode_name} />
            )}
            {educationData.work_location && (
              <InfoRow label="Work Location" value={educationData.work_location} />
            )}
            {educationData.annual_income_name && (
              <InfoRow label="Annual Income" value={educationData.annual_income_name} />
            )}
          </InfoSection>
        )}

        {/* Location Details */}
        {locationData && (
          <InfoSection title="Location Details" icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }>
            <InfoRow label="Permanent Address" value={`${locationData.permanent_city_name || ""}, ${locationData.permanent_state_name || ""}, ${locationData.permanent_country_name || ""}`.replace(/^, |, ,/g, "") || "Not specified"} />
            {locationData.is_same_as_permanent === 0 && locationData.present_country_name && (
              <InfoRow label="Present Address" value={`${locationData.present_city_name || ""}, ${locationData.present_state_name || ""}, ${locationData.present_country_name || ""}`.replace(/^, |, ,/g, "")} />
            )}
            <InfoRow label="NRI Status" value={locationData.is_nri === 1 ? "Yes" : "No"} />
            {locationData.is_nri === 1 && (
              <>
                <InfoRow label="Citizenship" value={locationData.citizenship_name || "Not specified"} />
                <InfoRow label="Current Residence" value={locationData.current_residence || "Not specified"} />
              </>
            )}
            <InfoRow label="Live Abroad" value={locationData.is_abroad === 1 ? "Yes" : "No"} />
            {locationData.is_abroad === 1 && (
              <>
                <InfoRow label="Visa Status" value={locationData.visa_status_name || "Not specified"} />
                <InfoRow label="Visa Type" value={locationData.visa_type_name || "Not specified"} />
              </>
            )}
          </InfoSection>
        )}

        {/* Partner Preference */}
        {partnerData && (
          <InfoSection title="Partner Preference" icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }>
            <InfoRow label="Religion" value={partnerData.religion_ids ? parseJSONArray(partnerData.religion_ids).join(", ") : "Any"} />
            <InfoRow label="Caste" value={partnerData.caste_ids ? parseJSONArray(partnerData.caste_ids).join(", ") : "Any"} />
            <InfoRow label="Mother Tongue" value={partnerData.mother_tongue_ids ? parseJSONArray(partnerData.mother_tongue_ids).join(", ") : "Any"} />
            <InfoRow label="Age Range" value={`${partnerData.min_age} - ${partnerData.max_age} years`} />
            <InfoRow label="Height Range" value={`${partnerData.min_height_name || "Any"} - ${partnerData.max_height_name || "Any"}`} />
            <InfoRow label="Marital Status" value={partnerData.marital_status_ids ? parseJSONArray(partnerData.marital_status_ids).join(", ") : "Any"} />
            <InfoRow label="Income Range" value={`${partnerData.min_income_name || "Any"} - ${partnerData.max_income_name || "Any"}`} />
            <InfoRow label="Education" value={partnerData.education_ids ? parseJSONArray(partnerData.education_ids).join(", ") : "Any"} />
            <InfoRow label="Occupation" value={partnerData.occupation_ids ? parseJSONArray(partnerData.occupation_ids).join(", ") : "Any"} />
            <InfoRow label="Location" value={`${partnerData.country_ids ? parseJSONArray(partnerData.country_ids).join(", ") : "Any"}`} />
          </InfoSection>
        )}
      </div>

      {/* Gallery Photos Section */}
      {galleryPhotos.length > 0 && (
        <div className="mt-6">
          <InfoSection title="Gallery Photos" icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {galleryPhotos.map((photo) => (
                <div key={photo.id} className="relative aspect-square overflow-hidden rounded-xl">
                  <Image
                    src={photo.image}
                    alt="Gallery"
                    fill
                    className="object-cover transition hover:scale-105"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </InfoSection>
        </div>
      )}
    </div>
  );
}