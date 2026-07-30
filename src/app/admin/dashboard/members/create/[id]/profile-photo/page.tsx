"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation"; // ← already correct
import { showSuccess, showError } from '../../../../lib/swalHelper';
import { Breadcrumb } from '../../../../components/ui/breadcrumb';
import Image from "next/image";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";


export default function ProfilePhotoForm() {
  const router = useRouter();
  const params = useParams();           // ← moved here (top level)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingImage, setExistingImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Please upload a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      setSelectedFile(file);           // ← ADD
      setIsFormValid(true);
    };
    reader.readAsDataURL(file);
  };

  const handleBack = () => {
    // 👉 your custom logic here
    console.log("Running back button logic");
    // 👉 then navigate
    router.push(`/admin/dashboard/members/create/${params.id}/partner-preference`);
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setSelectedFile(null);             // ← ADD
    setIsFormValid(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (!params?.id) return;

      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_DATA_URL}/member-get/profile-photo/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!res.ok) return;

        const data = await res.json();
        console.log("Okay data ",data.data.data[0].image);
        // Adjust based on your API response structure
        if (data?.data?.data?.[0]?.image) {
          const imageUrl =
            process.env.NEXT_PUBLIC_BACKEND_DATA_PLAIN + '/' + data.data.data[0].image;
        
          setPreviewUrl(imageUrl);
          setExistingImage(imageUrl);   // mark as already uploaded
          setIsFormValid(true);
        }
      } catch (err) {
        console.error("Failed to fetch profile photo", err);
      }
    };

    fetchProfilePhoto();
  }, [params?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !existingImage) {
      showError("Please upload a profile photo");
      return;
    }

    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        showError("Please login again");
        router.push("/login");
        return;
      }

      // Now params.id is available
      const memberId = params.id ? Number(params.id) : undefined;
      const formData = new FormData();

      if (selectedFile) {
        formData.append("profilePhoto", selectedFile);
      }

      formData.append("memberId", memberId!.toString());
      formData.append("type", "1");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_DATA_URL}/member/profile-photo`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` }, // NO Content-Type
          body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to upload photo");
      }

      showSuccess("Profile photo uploaded successfully!");
      router.push(`/admin/dashboard/members/create/${params.id}/gallery-photos`); // adjust next step

    } catch (err: any) {
      console.error("Upload error:", err);
      if(previewUrl){
        router.push(`/admin/dashboard/members/create/${params.id}/gallery-photos`);
      }else{
        showError(err.message || "Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header + breadcrumb + progress bar - keep as is */}
      <PageHeader
        title="Profile Photo"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Members", href: "/admin/dashboard/members" },
          { label: "Profile Photo" },
        ]}
        step={{ current: 8, total: 10, description: "Profile Photo" }}
      />

      <div className="flex justify-center px-4">
        <div className="flex w-full max-w-md gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`h-2.5 flex-1 rounded-full ${
                i < 8 ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6">
        <div className="mt-10 rounded-3xl bg-white dark:bg-gray-900 shadow-2xl p-10 text-center">

          {/* Profile Photo Preview Area */}
          <div className="mx-auto w-40 h-40 rounded-2xl overflow-hidden border-4 border-purple-200 dark:border-purple-800 mb-8 relative">
            {previewUrl ? (
              <>
                <Image
                  src={previewUrl}
                  alt="Profile Preview"
                  width={160}
                  height={160}
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 transition-colors shadow-md"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            ) : (
              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-6xl text-gray-400">
                👤
              </div>
            )}
          </div>

          <h3 className="text-2xl font-semibold mb-2">Upload Your Profile Photo</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xs mx-auto">
            Clear, front-facing photo with good lighting. This will be your main profile picture.
          </p>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {/* Upload / Change Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-10 py-3.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-600 transition-all mb-6 shadow-md"
            disabled={isLoading}
          >
            {previewUrl ? "Change Photo" : "Choose Photo"}
          </button>

          {previewUrl && (
            <p className="text-green-600 dark:text-green-400 text-sm mb-8">
              Photo selected successfully
            </p>
          )}

          <div className="flex flex-col gap-4 pt-8 sm:flex-row">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 rounded-2xl border border-gray-300 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              ← Back to Partner Preference
            </button>

            <form onSubmit={handleSubmit} className="flex-1">
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`w-full rounded-2xl py-4 text-base font-semibold transition-all ${
                  isFormValid && !isLoading
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow-md"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700"
                }`}
              >
                {isLoading ? "Uploading..." : "Continue to More Photos →"}
              </button>
            </form>
          </div>
          {/* Continue Button */}
        </div>
      </div>
    </div>
  );
}