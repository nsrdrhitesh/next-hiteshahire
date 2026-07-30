"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";
import SectionCard from "./components/SectionCard";
import EditBasicInfoModal from "./components/EditBasicInfoModal";
import EditReligionModal from "./components/EditReligionModal";
import EditSpiritualSocialModal from "./components/EditSpiritualSocialModal";
import EditBasicDetailsModal from "./components/EditBasicDetailsModal";
import EditFamilyDetailsModal from "./components/EditFamilyDetailsModal";
import EditEducationModal from "./components/EditEducationModal";
import EditLocationModal from "./components/EditLocationModal";
import EditLifeStyleInterestsModal from "./components/EditLifeStyleInterestsModal";
import EditPartnerPreferenceModal from "./components/EditPartnerPreferenceModal";
import EditPrivacySettingsModal from "./components/EditPrivacySettingsModal";
import EditProfilePhotoModal from "./components/EditProfilePhotoModal";
import EditGalleryModal from "./components/EditGalleryModal";
import MemberActions from "./components/MemberActions";
import { ArrowLeft } from "lucide-react";
import VerificationDocuments from "./components/VerificationDocuments";
import PlanFeatures from "./components/PlanFeatures";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
const MEDIA_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_PLAIN + '/';

interface MemberData {
  id?: number;
  profile_for?: string;
  profile_for_name?: string;
  mobile_no?: string;
  email?: string;
  gender?: string;
  gender_name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  date_of_birth?: string;
  introduction?: string;
  religion_id?: string;
  religion_name?: string;
  caste_id?: string;
  caste_name?: string;
  sub_caste_id?: string;
  sub_caste_name?: string;
  sub_sub_caste_id?: string;
  sub_sub_caste_name?: string;
  mother_tongue_id?: string;
  mother_tongue_name?: string;
  height_id?: string;
  height_name?: string;
  weight_id?: string;
  weight_name?: string;
  wealth_id?: string;
  wealth_name?: string;
  blood_group_id?: string;
  blood_group_name?: string;
  marital_status_id?: string;
  marital_status_name?: string;
  birth_time?: string;
  birth_place_id?: string;
  birth_place_name?: string;
  complexion_id?: string;
  complexion_name?: string;
  lens?: string;
  spectacles?: string;
  has_disability?: number;
  disability_details?: string;
  have_child_id?: string;
  have_child_name?: string;
  number_of_child_id?: string;
  number_of_child_name?: string;
  highest_education_id?: string;
  highest_education_name?: string;
  highest_education_other?: string | null;
  specification_id?: string;
  specification_name?: string;
  specification_other?: string | null;
  employment_type_id?: string;
  employment_type_name?: string;
  occupation_id?: string;
  occupation_name?: string;
  business_type_id?: string;
  business_type_name?: string;
  business_location?: string | null;
  designation?: string | null;
  company_name?: string | null;
  job_title?: string | null;
  work_mode_id?: string;
  work_mode_name?: string;
  work_location?: string | null;
  annual_income_id?: string;
  annual_income_name?: string;
  total_wealth_id?: string;
  total_wealth_name?: string;
  permanent_country_id?: string;
  permanent_country_name?: string;
  permanent_state_id?: string;
  permanent_state_name?: string;
  permanent_city_id?: string;
  permanent_city_name?: string;
  present_country_id?: string;
  present_country_name?: string;
  present_state_id?: string;
  present_state_name?: string;
  present_city_id?: string;
  present_city_name?: string;
  is_same_as_permanent?: number;
  is_ready_to_relocate?: number;
  // is_nri?: number;
  citizenship_id?: string;
  citizenship_name?: string;
  // current_residence?: string;
  is_abroad?: number;
  visa_status_id?: string;
  visa_status_name?: string;
  // visa_type_id?: string;
  // visa_type_name?: string;
  partner_religion_ids?: string[];
  partner_religion_names?: string[];
  partner_caste_ids?: string[];
  partner_caste_names?: string[];
  partner_mother_tongue_ids?: string[];
  partner_mother_tongue_names?: string[];
  min_age?: number;
  max_age?: number;
  min_height_id?: string;
  min_height_name?: string;
  max_height_id?: string;
  max_height_name?: string;
  partner_marital_status_ids?: string[];
  partner_marital_status_names?: string[];
  min_income_id?: string;
  min_income_name?: string;
  max_income_id?: string;
  max_income_name?: string;
  min_wealth_id?: string;
  min_wealth_name?: string;
  max_wealth_id?: string;
  max_wealth_name?: string;
  partner_country_ids?: string[];
  partner_country_names?: string[];
  partner_state_ids?: string[];
  partner_state_names?: string[];
  partner_city_ids?: string[];
  partner_city_names?: string[];
  partner_education_ids?: string[];
  partner_education_names?: string[];
  partner_occupation_ids?: string[];
  partner_occupation_names?: string[];
  manglik_status_id?: string;
  manglik_status_name?: string;
  album_privacy?: string;
  album_privacy_name?: string;
  profile_visibility?: string;
  profile_visibility_name?: string;
  profile_picture_visibility?: string;
  profile_picture_visibility_name?: string;
  contact_number_visibility?: string;
  contact_number_visibility_name?: string;
  which_contact_number_visibility?: string;
  which_contact_number_visibility_name?: string;
  video_call_setting?: string;
  video_call_setting_name?: string;
  show_in_search_results?: string;
  show_in_search_results_name?: string;
  show_online_status?: string;
  show_online_status_name?: string;
  dietary_habit_id?: string;
  dietary_habit_name?: string;
  smoking_habit_id?: string;
  smoking_habit_name?: string;
  drinking_habit_id?: string;
  drinking_habit_name?: string;
  mother_tongue_lifestyle_id?: string;
  mother_tongue_lifestyle_name?: string;
  languages_known_ids?: string[];
  languages_known_names?: { id: string; name: string }[];
  hobbies_ids?: string[];
  hobbies_names?: { id: string; name: string }[];
  interests_ids?: string[];
  interests_names?: { id: string; name: string }[];
  dress_style_ids?: string[];
  dress_style_names?: { id: string; name: string }[];
  sports_ids?: string[];
  sports_names?: { id: string; name: string }[];
  favourite_music_ids?: string[];
  favourite_music_names?: { id: string; name: string }[];
  favourite_food_ids?: string[];
  favourite_food_names?: { id: string; name: string }[];
  manglik_status_spiritual_id?: string;
  manglik_status_spiritual_name?: string;
  ras_id?: string;
  ras_name?: string;
  nakshtra_id?: string;
  nakshtra_name?: string;
  gan_id?: string;
  gan_name?: string;
  charan_id?: string;
  charan_name?: string;
  nadi_id?: string;
  nadi_name?: string;
  gotra_id?: string;
  gotra_name?: string;
  father_name?: string;
  mother_name?: string;
  father_occupation_id?: string;
  father_occupation_name?: string;
  mother_occupation_id?: string;
  mother_occupation_name?: string;
  number_of_brothers_id?: string;
  number_of_brothers_name?: string;
  number_of_married_brothers_id?: string;
  number_of_married_brothers_name?: string;
  number_of_sisters_id?: string;
  number_of_sisters_name?: string;
  number_of_married_sisters_id?: string;
  number_of_married_sisters_name?: string;
  parents_mobile_no?: string;
  family_type_id?: string;
  family_type_name?: string;
  family_assets_ids?: string;
  family_assets_names?: { id: string; name: string }[];
  living_with_parents_id?: string;
  living_with_parents_name?: string;
  family_status_id?: string;
  family_status_name?: string;
  manglik_status_family_id?: string;
  manglik_status_family_name?: string;
  profile_photo?: string | null;
  gallery_photos?: string[];
  admin_actions?: {
    is_blocked: number;
    is_deleted: number;
    blocked_at: string | null;
    block_reason: string | null;
    unblocked_at: string | null;
    deleted_at: string | null;
    delete_reason: string | null;
    restored_at: string | null;
    current_plan_id: number | null;
    current_plan_name: string | null;
    plan_start_date: string | null;
    plan_end_date: string | null;
    plan_amount: number | null;
    caste_verification_status: string;
    caste_verification_document_path: string | null;
    caste_verification_document_name: string | null;
    caste_verification_submitted_at: string | null;
    caste_verification_verified_at: string | null;
    caste_verification_rejected_at: string | null;
    caste_verification_rejection_reason: string | null;
    caste_verification_flag_sent_at: string | null;
    document_verification_status: string;
    document_verification_document_path: string | null;
    document_verification_document_name: string | null;
    document_verification_submitted_at: string | null;
    document_verification_verified_at: string | null;
    document_verification_rejected_at: string | null;
    document_verification_rejection_reason: string | null;
    document_verification_flag_sent_at: string | null;
  };
}

const parseJSONArray = (jsonString: string | null | undefined): any[] => {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch {
    return [];
  }
};

export default function MemberDetailPage() {
  const params = useParams();
  const memberId = params.id as string;

  const [member, setMember] = useState<MemberData>({});
  const [loading, setLoading] = useState(true);

  const [modalBasicInfo, setModalBasicInfo] = useState(false);
  const [modalReligion, setModalReligion] = useState(false);
  const [modalSpiritualSocial, setModalSpiritualSocial] = useState(false);
  const [modalPrivacySettings, setModalPrivacySettings] = useState(false);
  const [modalLifeStyleInterests, setModalLifeStyleInterests] = useState(false);
  const [modalFamilyDetails, setModalFamilyDetails] = useState(false);
  const [modalBasicDetails, setModalBasicDetails] = useState(false);
  const [modalEducation, setModalEducation] = useState(false);
  const [modalLocation, setModalLocation] = useState(false);
  const [modalPartnerPref, setModalPartnerPref] = useState(false);
  const [modalProfilePhoto, setModalProfilePhoto] = useState(false);
  const [modalGallery, setModalGallery] = useState(false);

  const fetchMemberData = async () => {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/member-get/detail/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success || !json.data?.data) throw new Error("Failed to fetch data");

      const d = json.data.data;

      const religionIdsArray = parseJSONArray(d.religion_ids);
      const religionNamesArray = parseJSONArray(d.religion_ids_name);
      const casteIdsArray = parseJSONArray(d.caste_ids);
      const casteNamesArray = parseJSONArray(d.caste_ids_name);
      const motherTongueIdsArray = parseJSONArray(d.mother_tongue_ids);
      const motherTongueNamesArray = parseJSONArray(d.mother_tongue_ids_name);
      const maritalStatusIdsArray = parseJSONArray(d.marital_status_ids);
      const maritalStatusNamesArray = parseJSONArray(d.marital_status_ids_name);
      const educationIdsArray = parseJSONArray(d.education_ids);
      const educationNamesArray = parseJSONArray(d.education_ids_name);
      const occupationIdsArray = parseJSONArray(d.occupation_ids);
      const occupationNamesArray = parseJSONArray(d.occupation_ids_name);
      const countryIdsArray = parseJSONArray(d.country_ids);
      const countryNamesArray = parseJSONArray(d.country_ids_name);
      const stateIdsArray = parseJSONArray(d.state_ids);
      const stateNamesArray = parseJSONArray(d.state_ids_name);
      const cityIdsArray = parseJSONArray(d.city_ids);
      const cityNamesArray = parseJSONArray(d.city_ids_name);

      const photoRes = await fetch(`${API_URL}/member-get/profile-photo/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const photoJson = await photoRes.json();
      const profilePhoto = photoJson.success && photoJson.data?.data?.[0]?.image
        ? `${MEDIA_URL}${photoJson.data.data[0].image}`
        : null;

      const galleryRes = await fetch(`${API_URL}/member-get/gallery/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const galleryJson = await galleryRes.json();
      const galleryPhotos = galleryJson.success && galleryJson.data?.data
        ? galleryJson.data.data
            .filter((item: any) => item.image)
            .map((item: any) => `${MEDIA_URL}${item.image}`)
        : [];

      setMember({
        id: d.id,
        profile_for: d.profile_for?.toString(),
        profile_for_name: d.profile_for_name,
        mobile_no: d.mobile_no,
        email: d.email,
        gender: d.gender?.toString(),
        gender_name: d.gender_name,
        first_name: d.first_name,
        middle_name: d.middle_name,
        last_name: d.last_name,
        date_of_birth: d.date_of_birth,
        introduction: d.introduction || "-",
        religion_id: d.religion_id?.toString(),
        religion_name: d.religion_id_name,
        caste_id: d.caste_id?.toString(),
        caste_name: d.caste_id_name,
        sub_caste_id: d.sub_caste_id?.toString(),
        sub_caste_name: d.sub_caste_id_name,
        sub_sub_caste_id: d.sub_sub_caste_id?.toString(),
        mother_tongue_id: d.mother_tongue_id?.toString(),
        mother_tongue_name: d.mother_tongue_id_name,
        height_id: d.height_id?.toString(),
        height_name: d.height_id_name,
        weight_id: d.weight_id?.toString(),
        weight_name: d.weight_id_name,
        wealth_id: d.total_wealth_id?.toString(),
        wealth_name: d.total_wealth_id_name,
        blood_group_id: d.blood_group_id?.toString(),
        blood_group_name: d.blood_group_id_name,
        marital_status_id: d.marital_status_id?.toString(),
        marital_status_name: d.marital_status_id_name,
        birth_time: d.birth_time,
        birth_place_id: d.birth_place_id?.toString(),
        birth_place_name: d.birth_place_id_name,
        complexion_id: d.complexion_id?.toString(),
        complexion_name: d.complexion_id_name,
        lens: d.lens === 1 ? "Yes" : "No",
        spectacles: d.spectacles === 1 ? "Yes" : "No",
        has_disability: d.has_disability,
        disability_details: d.disability_details,
        have_child_id: d.have_child_id?.toString(),
        have_child_name: d.have_child_id_name?.toString(),
        number_of_child_id: d.number_of_child_id?.toString(),
        number_of_child_name: d.number_of_child_id_name?.toString(),
        highest_education_id: d.highest_education_id?.toString(),
        highest_education_name: d.highest_education_id_name,
        highest_education_other: d.highestEducationOther,
        specification_id: d.specification_id?.toString(),
        specification_name: d.specification_id_name,
        specification_other: d.specificationOther,
        employment_type_id: d.employment_type_id?.toString(),
        employment_type_name: d.employment_type_id_name,
        occupation_id: d.occupation_id?.toString(),
        occupation_name: d.occupation_id_name,
        business_type_id: d.business_type_id?.toString(),
        business_location: d.businessLocation,
        designation: d.designation,
        company_name: d.companyName,
        job_title: d.jobTitle,
        work_mode_id: d.work_mode_id?.toString(),
        work_mode_name: d.work_mode_id_name,
        work_location: d.workLocation,
        annual_income_id: d.annual_income_id?.toString(),
        annual_income_name: d.annual_income_id_name,
        total_wealth_id: d.total_wealth_id?.toString(),
        permanent_country_id: d.permanent_country_id?.toString(),
        permanent_country_name: d.permanent_country_id_name,
        permanent_state_id: d.permanent_state_id?.toString(),
        permanent_state_name: d.permanent_state_id_name,
        permanent_city_id: d.permanent_city_id?.toString(),
        permanent_city_name: d.permanent_city_id_name,
        present_country_id: d.present_country_id?.toString(),
        present_country_name: d.present_country_id_name,
        present_state_id: d.present_state_id?.toString(),
        present_state_name: d.present_state_id_name,
        present_city_id: d.present_city_id?.toString(),
        present_city_name: d.present_city_id_name,
        is_same_as_permanent: d.isSameAsPermanent,
        is_ready_to_relocate: d.isReadyToRelocate,
        // is_nri: d.is_nri,
        citizenship_id: d.citizenship_id?.toString(),
        // current_residence: d.currentResidence,
        is_abroad: d.isAbroad,
        visa_status_id: d.visaStatusId?.toString(),
        visa_status_name: d.visaStatusId_name,
        // visa_type_id: d.visaTypeId?.toString(),
        // visa_type_name: d.visaTypeId_name,
        partner_religion_ids: religionIdsArray.map((item: any) => String(item.id || item)),
        partner_religion_names: religionNamesArray.map((item: any) => item.name || item),
        partner_caste_ids: casteIdsArray.map((item: any) => String(item.id || item)),
        partner_caste_names: casteNamesArray.map((item: any) => item.name || item),
        partner_mother_tongue_ids: motherTongueIdsArray.map((item: any) => String(item.id || item)),
        partner_mother_tongue_names: motherTongueNamesArray.map((item: any) => item.name || item),
        min_age: d.minAge,
        max_age: d.maxAge,
        min_height_id: d.min_height_id?.toString(),
        min_height_name: d.min_height_id_name,
        max_height_id: d.max_height_id?.toString(),
        max_height_name: d.max_height_id_name,
        partner_marital_status_ids: maritalStatusIdsArray.map((item: any) => String(item.id || item)),
        partner_marital_status_names: maritalStatusNamesArray.map((item: any) => item.name_en || item.name || item),
        min_income_id: d.min_income_id?.toString(),
        min_income_name: d.min_income_id_name,
        max_income_id: d.max_income_id?.toString(),
        max_income_name: d.max_income_id_name,
        min_wealth_id: d.min_wealth_id?.toString(),
        max_wealth_id: d.max_wealth_id?.toString(),
        min_wealth_name: d.min_wealth_id_name,
        max_wealth_name: d.max_wealth_id_name,
        partner_country_ids: countryIdsArray.map((item: any) => String(item.countryId || item.id || item)),
        partner_country_names: countryNamesArray.map((item: any) => item.name || item),
        partner_state_ids: stateIdsArray.map((item: any) => String(item.stateId || item.id || item)),
        partner_state_names: stateNamesArray.map((item: any) => item.name || item),
        partner_city_ids: cityIdsArray.map((item: any) => String(item.city_id || item.id || item)),
        partner_city_names: cityNamesArray.map((item: any) => item.name || item),
        partner_education_ids: educationIdsArray.map((item: any) => String(item.id || item)),
        partner_education_names: educationNamesArray.map((item: any) => item.name || item),
        partner_occupation_ids: occupationIdsArray.map((item: any) => String(item.id || item)),
        partner_occupation_names: occupationNamesArray.map((item: any) => item.name || item),
        manglik_status_id: d.manglik_status_id?.toString(),
        manglik_status_name: d.manglik_status_id_name,
        album_privacy: d.album_privacy?.toString(),
        album_privacy_name: d.album_privacy_name,
        profile_visibility: d.profile_visibility?.toString(),
        profile_visibility_name: d.profile_visibility_name,
        profile_picture_visibility: d.profile_picture_visibility?.toString(),
        profile_picture_visibility_name: d.profile_picture_visibility_name,
        contact_number_visibility: d.contact_number_visibility?.toString(),
        contact_number_visibility_name: d.contact_number_visibility_name,
        which_contact_number_visibility: d.which_contact_number_visibility?.toString(),
        which_contact_number_visibility_name: d.which_contact_number_visibility_name,
        video_call_setting: d.video_call_setting?.toString(),
        video_call_setting_name: d.video_call_setting_name,
        show_in_search_results: d.show_in_search_results?.toString(),
        show_in_search_results_name: d.show_in_search_results_name,
        show_online_status: d.show_online_status?.toString(),
        show_online_status_name: d.show_online_status_name,
        dietary_habit_id: d.dietary_habit_id?.toString(),
        dietary_habit_name: d.dietary_habit_name,
        smoking_habit_id: d.smoking_habit_id?.toString(),
        smoking_habit_name: d.smoking_habit_name,
        drinking_habit_id: d.drinking_habit_id?.toString(),
        drinking_habit_name: d.drinking_habit_name,
        mother_tongue_lifestyle_id: d.mother_tongue_lifestyle_id?.toString(),
        mother_tongue_lifestyle_name: d.mother_tongue_lifestyle_name,
        languages_known_ids: d.languages_known_ids?.map((id: number) => id.toString()) || [],
        languages_known_names: d.languages_known_names || [],
        hobbies_ids: d.hobbies_ids?.map((id: number) => id.toString()) || [],
        hobbies_names: d.hobbies_names || [],
        interests_ids: d.interests_ids?.map((id: number) => id.toString()) || [],
        interests_names: d.interests_names || [],
        dress_style_ids: d.dress_style_ids?.map((id: number) => id.toString()) || [],
        dress_style_names: d.dress_style_names || [],
        sports_ids: d.sports_ids?.map((id: number) => id.toString()) || [],
        sports_names: d.sports_names || [],
        favourite_music_ids: d.favourite_music_ids?.map((id: number) => id.toString()) || [],
        favourite_music_names: d.favourite_music_names || [],
        favourite_food_ids: d.favourite_food_ids?.map((id: number) => id.toString()) || [],
        favourite_food_names: d.favourite_food_names || [],
        manglik_status_spiritual_id: d.manglik_status_spiritual_id?.toString(),
        manglik_status_spiritual_name: d.manglik_status_spiritual_name,
        ras_id: d.ras_id?.toString(),
        ras_name: d.ras_name,
        nakshtra_id: d.nakshtra_id?.toString(),
        nakshtra_name: d.nakshtra_name,
        gan_id: d.gan_id?.toString(),
        gan_name: d.gan_name,
        charan_id: d.charan_id?.toString(),
        charan_name: d.charan_name,
        nadi_id: d.nadi_id?.toString(),
        nadi_name: d.nadi_name,
        gotra_id: d.gotra_id?.toString(),
        gotra_name: d.gotra_name,
        father_name: d.father_name,
        mother_name: d.mother_name,
        father_occupation_id: d.father_occupation_id?.toString(),
        father_occupation_name: d.father_occupation_name,
        mother_occupation_id: d.mother_occupation_id?.toString(),
        mother_occupation_name: d.mother_occupation_name,
        number_of_brothers_id: d.number_of_brothers_id?.toString(),
        number_of_brothers_name: d.number_of_brothers_name,
        number_of_married_brothers_id: d.number_of_married_brothers_id?.toString(),
        number_of_married_brothers_name: d.number_of_married_brothers_name,
        number_of_sisters_id: d.number_of_sisters_id?.toString(),
        number_of_sisters_name: d.number_of_sisters_name,
        number_of_married_sisters_id: d.number_of_married_sisters_id?.toString(),
        number_of_married_sisters_name: d.number_of_married_sisters_name,
        parents_mobile_no: d.parents_mobile_no,
        family_type_id: d.family_type_id?.toString(),
        family_type_name: d.family_type_name,
        family_assets_ids: d.family_assets_ids,
        family_assets_names: d.family_assets_names || [],
        living_with_parents_id: d.living_with_parents_id?.toString(),
        living_with_parents_name: d.living_with_parents_name,
        family_status_id: d.family_status_id?.toString(),
        family_status_name: d.family_status_name,
        manglik_status_family_id: d.manglik_status_family_id?.toString(),
        manglik_status_family_name: d.manglik_status_family_name,
        profile_photo: profilePhoto,
        gallery_photos: galleryPhotos,
        admin_actions: d.admin_actions,
      });
    } catch (err) {
      console.error("Failed to fetch member data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberData();
  }, [memberId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member Profile"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Members", href: "/admin/dashboard/members" },
          { label: `${member.first_name || "Member"} ${member.last_name || ""}` },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/members",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
          }
        ]}
      />

      {/* Member Actions Component - Now using admin_actions from member data */}
      <MemberActions
        memberId={memberId}
        memberName={`${member.first_name || ""} ${member.last_name || ""}`}
        memberData={member}
        adminActions={member.admin_actions}
        onActionComplete={fetchMemberData}
      />

      <PlanFeatures memberId={memberId} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Photos */}
        <div className="space-y-6">
          <SectionCard title="Profile Photo" onEdit={() => setModalProfilePhoto(true)}>
            {member.profile_photo ? (
              <Image
                src={member.profile_photo}
                alt="Profile"
                width={200}
                height={200}
                className="rounded-2xl object-cover w-full max-w-[200px] mx-auto"
                unoptimized
              />
            ) : (
              <div className="text-center py-8 text-gray-400">No photo uploaded</div>
            )}
          </SectionCard>

          <SectionCard title="Gallery Photos" onEdit={() => setModalGallery(true)}>
            <div className="grid grid-cols-3 gap-2">
              {member.gallery_photos?.filter((photo) => photo && photo.trim() !== "").slice(0, 3).map((photo, idx) => (
                <Image
                  key={idx}
                  src={photo}
                  alt="Gallery"
                  width={80}
                  height={80}
                  className="rounded-lg object-cover w-full h-20"
                  unoptimized
                />
              ))}
              {(!member.gallery_photos || member.gallery_photos.filter((p) => p && p.trim() !== "").length === 0) && (
                <div className="col-span-3 text-center text-gray-400">No gallery photos</div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Religion & Community" onEdit={() => setModalReligion(true)}>
            <div className="space-y-2">
              <div><span className="font-semibold">Religion:</span> {member.religion_name || "-"}</div>
              <div><span className="font-semibold">Caste:</span> {member.caste_name || "-"}</div>
              <div><span className="font-semibold">Sub Caste:</span> {member.sub_caste_name || "-"}</div>
              <div><span className="font-semibold">Sub Sub Caste:</span> {member.sub_sub_caste_name || "-"}</div>
              <div><span className="font-semibold">Mother Tongue:</span> {member.mother_tongue_name || "-"}</div>
            </div>
          </SectionCard>

          <SectionCard title="Location Details" onEdit={() => setModalLocation(true)}>
            <div className="space-y-2">
              <div><span className="font-semibold">Permanent Address:</span> {member.permanent_city_name}, {member.permanent_state_name}, {member.permanent_country_name}</div>
              <div><span className="font-semibold">Present Address:</span> {member.is_same_as_permanent === 1 ? "Same as permanent" : `${member.present_city_name}, ${member.present_state_name}, ${member.present_country_name}`}</div>
              <div><span className="font-semibold">Ready to Relocate:</span> {member.is_ready_to_relocate === 1 ? "Yes" : "No"}</div>
              {/* <div><span className="font-semibold">NRI Status:</span> {member.is_nri === 1 ? "NRI" : "Non-NRI"}</div> */}
              <div><span className="font-semibold">Live abroad:</span> {member.is_abroad === 1 ? "Yes" : "No"}</div>
              {member.citizenship_name && <div><span className="font-semibold">Citizenship:</span> {member.citizenship_name}</div>}
              {member.is_abroad === 1 && (
                <>
                  <div><span className="font-semibold">Visa Status:</span> {member.visa_status_name || "-"}</div>
                  {/* <div><span className="font-semibold">Visa Type:</span> {member.visa_type_name || "-"}</div> */}
                </>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Spiritual & Social" onEdit={() => setModalSpiritualSocial(true)}>
            <div className="space-y-2">
              <div><span className="font-semibold">Manglik:</span> {member.manglik_status_spiritual_name || "-"}</div>
              <div><span className="font-semibold">Ras:</span> {member.ras_name || "-"}</div>
              <div><span className="font-semibold">Nakshatra:</span> {member.nakshtra_name || "-"}</div>
              <div><span className="font-semibold">Gan:</span> {member.gan_name || "-"}</div>
              <div><span className="font-semibold">Charan:</span> {member.charan_name || "-"}</div>
              <div><span className="font-semibold">Nadi:</span> {member.nadi_name || "-"}</div>
              <div><span className="font-semibold">Gotra:</span> {member.gotra_name || "-"}</div>
            </div>
          </SectionCard>

          <SectionCard title="Privacy Settings" onEdit={() => setModalPrivacySettings(true)}>
            <div className="space-y-2">
              <div><span className="font-semibold">Album Privacy:</span> {member.album_privacy_name || "-"}</div>
              <div><span className="font-semibold">Profile Visibility:</span> {member.profile_visibility_name || "-"}</div>
              <div><span className="font-semibold">Profile Picture Visibility:</span> {member.profile_picture_visibility_name || "-"}</div>
              <div><span className="font-semibold">Contact Number Visibility:</span> {member.contact_number_visibility_name || "-"}</div>
              <div><span className="font-semibold">Which Contact Number to Display:</span> {member.which_contact_number_visibility_name || "-"}</div>
              <div><span className="font-semibold">Video Call Setting:</span> {member.video_call_setting_name || "-"}</div>
              <div><span className="font-semibold">Show in Search Results:</span> {member.show_in_search_results_name || "-"}</div>
              <div><span className="font-semibold">Show Online Status:</span> {member.show_online_status_name || "-"}</div>
            </div>
          </SectionCard>
        </div>

        {/* Right column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Basic Info" onEdit={() => setModalBasicInfo(true)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="font-semibold">First Name:</span> {member.first_name || "-"}</div>
              <div><span className="font-semibold">Middle Name:</span> {member.middle_name || "-"}</div>
              <div><span className="font-semibold">Last Name:</span> {member.last_name || "-"}</div>
              <div><span className="font-semibold">Date of Birth:</span> {member.date_of_birth || "-"}</div>
              <div><span className="font-semibold">Gender:</span> {member.gender_name || member.gender || "-"}</div>
              <div><span className="font-semibold">Mobile:</span> {member.mobile_no || "-"}</div>
              <div><span className="font-semibold">Email:</span> {member.email || "-"}</div>
              <div><span className="font-semibold">Profile For:</span> {member.profile_for_name || "-"}</div>
            </div>
            <div className="space-y-2 gap-4">
              <div><span className="font-semibold">Introduction:</span> {member.introduction || "-"}</div>
            </div>
          </SectionCard>

          <SectionCard title="Basic Details" onEdit={() => setModalBasicDetails(true)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="font-semibold">Height:</span> {member.height_name || "-"}</div>
              <div><span className="font-semibold">Blood Group:</span> {member.blood_group_name || "-"}</div>
              <div><span className="font-semibold">Marital Status:</span> {member.marital_status_name || "-"}</div>
              <div><span className="font-semibold">Have Children:</span> {member.have_child_name || "-"}</div>
              <div><span className="font-semibold">Number of Children:</span> {member.number_of_child_name || "-"}</div>
              <div><span className="font-semibold">Disability:</span> {member.has_disability === 1 ? "Yes" : "No"} {member.disability_details && `(${member.disability_details})`}</div>
              <div><span className="font-semibold">Birth Time:</span> {member.birth_time || "-"}</div>
              <div><span className="font-semibold">Birth Place:</span> {member.birth_place_name || "-"}</div>
              <div><span className="font-semibold">Complexion:</span> {member.complexion_name || "-"}</div>
              <div><span className="font-semibold">Lens:</span> {member.lens || "-"}</div>
              <div><span className="font-semibold">Spectacles:</span> {member.spectacles || "-"}</div>
              <div><span className="font-semibold">Weight:</span> {member.weight_name || "-"}</div>
            </div>
          </SectionCard>

          <SectionCard title="Education & Career Details" onEdit={() => setModalEducation(true)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="font-semibold">Highest Education:</span> {member.highest_education_name || "-"} {member.highest_education_other && `(${member.highest_education_other})`}</div>
              <div><span className="font-semibold">Specialization:</span> {member.specification_name || "-"} {member.specification_other && `(${member.specification_other})`}</div>
              <div><span className="font-semibold">Employment Type:</span> {member.employment_type_name || "-"}</div>
              <div><span className="font-semibold">Occupation:</span> {member.occupation_name || "-"}</div>
              {member.designation && <div><span className="font-semibold">Designation:</span> {member.designation}</div>}
              {member.company_name && <div><span className="font-semibold">Company Name:</span> {member.company_name}</div>}
              {member.job_title && <div><span className="font-semibold">Job Title:</span> {member.job_title}</div>}
              {member.business_type_name && <div><span className="font-semibold">Business Type:</span> {member.business_type_name}</div>}
              {member.business_location && <div><span className="font-semibold">Business Location:</span> {member.business_location}</div>}
              {member.work_mode_name && <div><span className="font-semibold">Work Mode:</span> {member.work_mode_name}</div>}
              {member.work_location && <div><span className="font-semibold">Work Location:</span> {member.work_location}</div>}
              <div><span className="font-semibold">Annual Income:</span> {member.annual_income_name || "-"}</div>
              <div><span className="font-semibold">Total Wealth:</span> {member.wealth_name || "-"}</div>
            </div>
          </SectionCard>

          <SectionCard title="Partner Preference" onEdit={() => setModalPartnerPref(true)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="font-semibold">Age Range:</span> {member.min_age} - {member.max_age}</div>
              <div><span className="font-semibold">Height Range:</span> {member.min_height_name} - {member.max_height_name}</div>
              <div><span className="font-semibold">Religions:</span> {member.partner_religion_names?.join(", ") || "-"}</div>
              <div><span className="font-semibold">Castes:</span> {member.partner_caste_names?.join(", ") || "-"}</div>
              <div><span className="font-semibold">Mother Tongues:</span> {member.partner_mother_tongue_names?.join(", ") || "-"}</div>
              <div><span className="font-semibold">Marital Statuses:</span> {member.partner_marital_status_names?.join(", ") || "-"}</div>
              <div><span className="font-semibold">Education:</span> {member.partner_education_names?.slice(0, 3).join(", ")}{member.partner_education_names && member.partner_education_names.length > 3 && "..."}</div>
              <div><span className="font-semibold">Occupation:</span> {member.partner_occupation_names?.slice(0, 3).join(", ")}{member.partner_occupation_names && member.partner_occupation_names.length > 3 && "..."}</div>
              <div><span className="font-semibold">Income Range:</span> {member.min_income_name} - {member.max_income_name}</div>
              <div><span className="font-semibold">Wealth Range:</span> {member.min_wealth_name || "-"} - {member.max_wealth_name || "-"}</div>
              <div><span className="font-semibold">Countries:</span> {member.partner_country_names?.join(", ") || "-"}</div>
              <div><span className="font-semibold">States:</span> {member.partner_state_names?.join(", ") || "-"}</div>
              <div><span className="font-semibold">Cities:</span> {member.partner_city_names?.join(", ") || "-"}</div>
              <div><span className="font-semibold">Manglik Status:</span> {member.manglik_status_name || "-"}</div>
            </div>
          </SectionCard>

          <SectionCard title="Family Details" onEdit={() => setModalFamilyDetails(true)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="font-semibold">Father Name:</span> {member.father_name || "-"}</div>
              <div><span className="font-semibold">Mother Name:</span> {member.mother_name || "-"}</div>
              <div><span className="font-semibold">Father Occupation:</span> {member.father_occupation_name || "-"}</div>
              <div><span className="font-semibold">Mother Occupation:</span> {member.mother_occupation_name || "-"}</div>
              <div><span className="font-semibold">No. of Brothers:</span> {member.number_of_brothers_name || member.number_of_brothers_id || "-"}</div>
              <div><span className="font-semibold">No. of Married Brothers:</span> {member.number_of_married_brothers_name || member.number_of_married_brothers_id || "-"}</div>
              <div><span className="font-semibold">No. of Sisters:</span> {member.number_of_sisters_name || member.number_of_sisters_id || "-"}</div>
              <div><span className="font-semibold">No. of Married Sisters:</span> {member.number_of_married_sisters_name || member.number_of_married_sisters_id || "-"}</div>
              <div><span className="font-semibold">Parents Contact No:</span> {member.parents_mobile_no || "-"}</div>
              <div><span className="font-semibold">Family Type:</span> {member.family_type_name || "-"}</div>
              <div><span className="font-semibold">Family Assets:</span> {member.family_assets_names?.map(a => a.name).join(", ") || "-"}</div>
              <div><span className="font-semibold">Living With Parents:</span> {member.living_with_parents_name || "-"}</div>
              <div><span className="font-semibold">Family Status:</span> {member.family_status_name || "-"}</div>
              <div><span className="font-semibold">Manglik (Family):</span> {member.manglik_status_family_name || "-"}</div>
            </div>
          </SectionCard>

          <SectionCard title="Life Style and Interests" onEdit={() => setModalLifeStyleInterests(true)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="font-semibold">Dietary Habits:</span> {member.dietary_habit_name || "-"}</div>
              <div><span className="font-semibold">Smoking Habits:</span> {member.smoking_habit_name || "-"}</div>
              <div><span className="font-semibold">Drinking Habits:</span> {member.drinking_habit_name || "-"}</div>
              <div><span className="font-semibold">Languages Known:</span> {member.languages_known_names?.map(l => l.name).join(", ") || "-"}</div>
              <div><span className="font-semibold">Mother Tongue:</span> {member.mother_tongue_lifestyle_name || member.mother_tongue_name || "-"}</div>
              <div><span className="font-semibold">Hobbies:</span> {member.hobbies_names?.map(h => h.name).join(", ") || "-"}</div>
              <div><span className="font-semibold">Interests:</span> {member.interests_names?.map(i => i.name).join(", ") || "-"}</div>
              <div><span className="font-semibold">Dress Style:</span> {member.dress_style_names?.map(d => d.name).join(", ") || "-"}</div>
              <div><span className="font-semibold">Sports:</span> {member.sports_names?.map(s => s.name).join(", ") || "-"}</div>
              <div><span className="font-semibold">Favourite Music:</span> {member.favourite_music_names?.map(m => m.name).join(", ") || "-"}</div>
              <div><span className="font-semibold">Favourite Food:</span> {member.favourite_food_names?.map(f => f.name).join(", ") || "-"}</div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Verification Documents Section for Members to Upload */}
      {member.admin_actions && (
        <VerificationDocuments
          memberId={memberId}
          adminActions={member.admin_actions}
          onUpdate={fetchMemberData}
        />
      )}

      {/* Modals */}
      <EditBasicInfoModal
        isOpen={modalBasicInfo}
        onClose={() => setModalBasicInfo(false)}
        memberId={memberId}
        initialData={member}
        onSuccess={fetchMemberData}
      />
      <EditReligionModal
        isOpen={modalReligion}
        onClose={() => setModalReligion(false)}
        memberId={memberId}
        initialData={member}
        onSuccess={fetchMemberData}
      />
      <EditFamilyDetailsModal
        isOpen={modalFamilyDetails}
        onClose={() => setModalFamilyDetails(false)}
        memberId={memberId}
        initialData={member}
        onSuccess={fetchMemberData}
      />
      <EditSpiritualSocialModal
        isOpen={modalSpiritualSocial}
        onClose={() => setModalSpiritualSocial(false)}
        memberId={memberId}
        initialData={member}
        onSuccess={fetchMemberData}
      />
      <EditPrivacySettingsModal
        isOpen={modalPrivacySettings}
        onClose={() => setModalPrivacySettings(false)}
        memberId={memberId}
        initialData={member}
        onSuccess={fetchMemberData}
      />
      <EditLifeStyleInterestsModal
        isOpen={modalLifeStyleInterests}
        onClose={() => setModalLifeStyleInterests(false)}
        memberId={memberId}
        initialData={member}
        onSuccess={fetchMemberData}
      />
      <EditBasicDetailsModal
        isOpen={modalBasicDetails}
        onClose={() => setModalBasicDetails(false)}
        memberId={memberId}
        initialData={member}
        onSuccess={fetchMemberData}
      />
      <EditEducationModal
        isOpen={modalEducation}
        onClose={() => setModalEducation(false)}
        memberId={memberId}
        initialData={member}
        onSuccess={fetchMemberData}
      />
      <EditLocationModal
        isOpen={modalLocation}
        onClose={() => setModalLocation(false)}
        memberId={memberId}
        initialData={member}
        onSuccess={fetchMemberData}
      />
      <EditPartnerPreferenceModal
        isOpen={modalPartnerPref}
        onClose={() => setModalPartnerPref(false)}
        memberId={memberId}
        initialData={member}
        onSuccess={fetchMemberData}
      />
      <EditProfilePhotoModal
        isOpen={modalProfilePhoto}
        onClose={() => setModalProfilePhoto(false)}
        memberId={memberId}
        currentPhoto={member.profile_photo}
        onSuccess={fetchMemberData}
      />
      <EditGalleryModal
        isOpen={modalGallery}
        onClose={() => setModalGallery(false)}
        memberId={memberId}
        existingPhotos={member.gallery_photos || []}
        onSuccess={fetchMemberData}
      />
    </div>
  );
}