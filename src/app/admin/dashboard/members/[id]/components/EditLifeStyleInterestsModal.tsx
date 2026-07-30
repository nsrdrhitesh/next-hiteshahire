"use client";

import { useState, useEffect } from "react";
import { showSuccess, showError } from "@/app/admin/dashboard/lib/swalHelper";
import SearchableSelect from "@/app/admin/dashboard/components/ui/SearchableSelect";
import MultiSelectSearch from "./MultiSelectSearch";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;

interface Option {
  id: string;
  name: string;
  isGroup?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  initialData: any;
  onSuccess: () => void;
}

// Generic fetch for single select (supports search)
const fetchSingleSelectOptions = async (endpoint: string, search: string = "") => {
  try {
    const res = await fetch(`${API_URL}/${endpoint}?search=${encodeURIComponent(search)}`);
    const json = await res.json();
    if (!json.success) return { data: [], hasNextPage: false };
    
    const items = json.data?.data || [];
    const options = items.map((item: any) => ({ id: String(item.id), name: item.name }));
    
    return {
      data: options,
      hasNextPage: json.data?.meta?.hasNextPage ?? false,
    };
  } catch (err) {
    console.error(`Error fetching ${endpoint}:`, err);
    return { data: [], hasNextPage: false };
  }
};

// Fetch all options for multi-select (no pagination needed as total items are small)
const fetchAllOptions = async (endpoint: string): Promise<Option[]> => {
  try {
    const res = await fetch(`${API_URL}/${endpoint}?search=`);
    const json = await res.json();
    if (!json.success) return [];
    const items = json.data?.data || [];
    return items.map((item: any) => ({ id: String(item.id), name: item.name }));
  } catch (err) {
    console.error(`Error fetching ${endpoint}:`, err);
    return [];
  }
};

export default function EditLifeStyleModal({ isOpen, onClose, memberId, initialData, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    dietaryHabitId: "",
    smokingHabitId: "",
    drinkingHabitId: "",
    motherTongueId: "",
    languagesKnownIds: [] as string[],
    hobbiesIds: [] as string[],
    interestsIds: [] as string[],
    dressStyleIds: [] as string[],
    sportsIds: [] as string[],
    favouriteMusicIds: [] as string[],
    favouriteFoodIds: [] as string[],
  });

  // Options state for multi-select dropdowns
  const [languagesOptions, setLanguagesOptions] = useState<Option[]>([]);
  const [hobbiesOptions, setHobbiesOptions] = useState<Option[]>([]);
  const [interestsOptions, setInterestsOptions] = useState<Option[]>([]);
  const [dressStyleOptions, setDressStyleOptions] = useState<Option[]>([]);
  const [sportsOptions, setSportsOptions] = useState<Option[]>([]);
  const [musicOptions, setMusicOptions] = useState<Option[]>([]);
  const [foodOptions, setFoodOptions] = useState<Option[]>([]);

  // Fetch all options for multi-select fields
  useEffect(() => {
    const fetchAllMultiSelectOptions = async () => {
      const [
        languages,
        hobbies,
        interests,
        dressStyles,
        sports,
        music,
        food,
      ] = await Promise.all([
        fetchAllOptions("member-get/language"),
        fetchAllOptions("member-get/hobbies"),
        fetchAllOptions("member-get/interests"),
        fetchAllOptions("member-get/dress-style"),
        fetchAllOptions("member-get/sports"),
        fetchAllOptions("member-get/music"),
        fetchAllOptions("member-get/favourite-food"),
      ]);
      setLanguagesOptions(languages);
      setHobbiesOptions(hobbies);
      setInterestsOptions(interests);
      setDressStyleOptions(dressStyles);
      setSportsOptions(sports);
      setMusicOptions(music);
      setFoodOptions(food);
    };
    
    if (isOpen) {
      fetchAllMultiSelectOptions();
    }
  }, [isOpen]);

  // Populate form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        dietaryHabitId: initialData.dietary_habit_id?.toString() || "",
        smokingHabitId: initialData.smoking_habit_id?.toString() || "",
        drinkingHabitId: initialData.drinking_habit_id?.toString() || "",
        motherTongueId: initialData.mother_tongue_id?.toString() || "",
        languagesKnownIds: initialData.languages_known_ids 
          ? initialData.languages_known_ids.map((id: any) => String(id)) 
          : [],
        hobbiesIds: initialData.hobbies_ids 
          ? initialData.hobbies_ids.map((id: any) => String(id)) 
          : [],
        interestsIds: initialData.interests_ids 
          ? initialData.interests_ids.map((id: any) => String(id)) 
          : [],
        dressStyleIds: initialData.dress_style_ids 
          ? initialData.dress_style_ids.map((id: any) => String(id)) 
          : [],
        sportsIds: initialData.sports_ids 
          ? initialData.sports_ids.map((id: any) => String(id)) 
          : [],
        favouriteMusicIds: initialData.favourite_music_ids 
          ? initialData.favourite_music_ids.map((id: any) => String(id)) 
          : [],
        favouriteFoodIds: initialData.favourite_food_ids 
          ? initialData.favourite_food_ids.map((id: any) => String(id)) 
          : [],
      });
    }
  }, [initialData]);

  // Handle multi-select changes
  const handleMultiChange = (field: keyof typeof formData, selected: string[]) => {
    setFormData(prev => ({ ...prev, [field]: selected }));
  };

  // Handle single select changes from SearchableSelect
  const handleSingleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("access_token");
    
    try {
      const payload = {
        memberId: Number(memberId),
        dietary_habit_id: formData.dietaryHabitId ? Number(formData.dietaryHabitId) : 0,
        smoking_habit_id: formData.smokingHabitId ? Number(formData.smokingHabitId) : 0,
        drinking_habit_id: formData.drinkingHabitId ? Number(formData.drinkingHabitId) : 0,
        mother_tongue_id: formData.motherTongueId ? Number(formData.motherTongueId) : 0,
        languages_known_ids: formData.languagesKnownIds.map(id => Number(id)),
        hobbies_ids: formData.hobbiesIds.map(id => Number(id)),
        interests_ids: formData.interestsIds.map(id => Number(id)),
        dress_style_ids: formData.dressStyleIds.map(id => Number(id)),
        sports_ids: formData.sportsIds.map(id => Number(id)),
        favourite_music_ids: formData.favouriteMusicIds.map(id => Number(id)),
        favourite_food_ids: formData.favouriteFoodIds.map(id => Number(id)),
      };
      
      const response = await fetch(`${API_URL}/member/member-lifestyle`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save lifestyle details");
      }
      
      showSuccess("Life Style & Interests updated successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Sticky Title */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Edit Life Style & Interests
          </h2>
        </div>
        
        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-auto px-6">
          <form onSubmit={handleSubmit} className="space-y-5 py-6">
            
            {/* Dietary Habits - Single Select */}
            <SearchableSelect
              label="Dietary Habits"
              value={formData.dietaryHabitId}
              onChange={(val) => handleSingleChange("dietaryHabitId", val)}
              fetchOptions={(search) => fetchSingleSelectOptions("member-get/dietary-habits", search)}
              placeholder="Select dietary habit"
            />

            {/* Smoking Habits - Single Select */}
            <SearchableSelect
              label="Smoking Habits"
              value={formData.smokingHabitId}
              onChange={(val) => handleSingleChange("smokingHabitId", val)}
              fetchOptions={(search) => fetchSingleSelectOptions("member-get/smoking-habits", search)}
              placeholder="Select smoking habit"
            />

            {/* Drinking Habits - Single Select */}
            <SearchableSelect
              label="Drinking Habits"
              value={formData.drinkingHabitId}
              onChange={(val) => handleSingleChange("drinkingHabitId", val)}
              fetchOptions={(search) => fetchSingleSelectOptions("member-get/drinking-habits", search)}
              placeholder="Select drinking habit"
            />

            {/* Mother Tongue - Single Select (using language endpoint) */}
            <SearchableSelect
              label="Mother Tongue"
              value={formData.motherTongueId}
              onChange={(val) => handleSingleChange("motherTongueId", val)}
              fetchOptions={(search) => fetchSingleSelectOptions("member-get/language", search)}
              placeholder="Select mother tongue"
            />

            {/* Languages Known - Multi Select */}
            <MultiSelectSearch
              label="Languages Known"
              options={languagesOptions}
              selected={formData.languagesKnownIds}
              onChange={(selected) => handleMultiChange("languagesKnownIds", selected)}
              placeholder="Select languages"
            />

            {/* Hobbies - Multi Select */}
            <MultiSelectSearch
              label="Hobbies"
              options={hobbiesOptions}
              selected={formData.hobbiesIds}
              onChange={(selected) => handleMultiChange("hobbiesIds", selected)}
              placeholder="Select hobbies"
            />

            {/* Interests - Multi Select */}
            <MultiSelectSearch
              label="Interests"
              options={interestsOptions}
              selected={formData.interestsIds}
              onChange={(selected) => handleMultiChange("interestsIds", selected)}
              placeholder="Select interests"
            />

            {/* Dress Style - Multi Select */}
            <MultiSelectSearch
              label="Dress Style"
              options={dressStyleOptions}
              selected={formData.dressStyleIds}
              onChange={(selected) => handleMultiChange("dressStyleIds", selected)}
              placeholder="Select dress styles"
            />

            {/* Sports - Multi Select */}
            <MultiSelectSearch
              label="Sports"
              options={sportsOptions}
              selected={formData.sportsIds}
              onChange={(selected) => handleMultiChange("sportsIds", selected)}
              placeholder="Select sports"
            />

            {/* Favourite Music - Multi Select */}
            <MultiSelectSearch
              label="Favourite Music"
              options={musicOptions}
              selected={formData.favouriteMusicIds}
              onChange={(selected) => handleMultiChange("favouriteMusicIds", selected)}
              placeholder="Select music preferences"
            />

            {/* Favourite Food - Multi Select */}
            <MultiSelectSearch
              label="Favourite Food"
              options={foodOptions}
              selected={formData.favouriteFoodIds}
              onChange={(selected) => handleMultiChange("favouriteFoodIds", selected)}
              placeholder="Select favourite foods"
            />

          </form>
        </div>
        
        {/* Fixed Buttons at Bottom */}
        <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 bg-white dark:bg-gray-900 rounded-b-2xl">
          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              onClick={handleSubmit}
              disabled={loading} 
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-600 transition shadow-sm disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}