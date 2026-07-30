"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { showSuccess, showError } from "../../../../lib/swalHelper";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

type GalleryImage = {
  src: string;
  id?: number;
  file?: File;        // ← only for new photos
};

export default function GalleryPhotosForm() {
  const router = useRouter();
  const params = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const MAX_IMAGES = 6;
  const memberId = params.id ? Number(params.id) : undefined;

  // ==================== STEP A: FETCH EXISTING PHOTOS ====================
  useEffect(() => {
    if (!memberId) return;

    const fetchGallery = async () => {
      setIsFetching(true);
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          showError("Please login again");
          router.push("/login");
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_DATA_URL}/member-get/gallery/${memberId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!res.ok) throw new Error("Failed to load gallery");

        const json = await res.json();
        if (json.success && json.data?.data) {
          // const existing = json.data.data
          //   .filter((item: any) => item.gallery_type === 2)
          //   .map((item: any) => ({
          //     src: `${process.env.NEXT_PUBLIC_BACKEND_DATA_URL}/${item.gallery_image}`,
          //     id: item.gallery_id,
          //   }));
          const existing = json.data.data.map((item: any) => ({
            src: `${process.env.NEXT_PUBLIC_BACKEND_DATA_PLAIN}/${item.image}`,
            id: item.id,
          }));
          console.log("Okay test Data ",existing);
          setImages(existing);
        }
      } catch (err: any) {
        showError(err.message || "Could not load photos");
      } finally {
        setIsFetching(false);
      }
    };

    fetchGallery();
  }, [memberId, router]);

  const handleBack = () => {
    // 👉 your custom logic here
    console.log("Running back button logic");
    // 👉 then navigate
    router.push(`/admin/dashboard/members/create/${params.id}/profile-photo`);
  };

  // ==================== STEP B: ADD NEW PHOTOS ====================
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > MAX_IMAGES) {
      showError(`Maximum ${MAX_IMAGES} photos allowed`);
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        showError("Only images allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showError("Max 5MB per image");
        return;
      }
    
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, { 
          src: reader.result as string, 
          file: file
        }]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ==================== STEP C: REMOVE (with DELETE API) ====================
  const removeImage = async (index: number) => {
    const photo = images[index];

    // If it's an existing photo → call DELETE API
    if (photo.id) {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_DATA_URL}/member/photo/${photo.id}/${memberId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Delete failed");
        }
      } catch (err: any) {
        showError(err.message || "Failed to delete from server");
        return; // stop if delete fails
      }
    }

    // Remove from UI
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ==================== STEP D: SUBMIT (only new photos) ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length < 1) {
      showError("At least 1 photo required");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        showError("Please login again");
        router.push("/login");
        return;
      }

      // Only upload NEW photos (those without id)
      const newPhotos = images.filter((img) => !img.id && img.file);

      if (newPhotos.length === 0) {
        showSuccess("Gallery photos updated successfully!");
        router.push(`/admin/dashboard/members/create/${params.id}/plans`);
        return;
      }

      // Upload each new photo
      for (const photo of newPhotos) {
        const formData = new FormData();
        
        // Match the exact field names expected by the server
        formData.append("profilePhoto", photo.file!);
        formData.append("memberId", memberId as any);
        formData.append("type", 2 as any);
        
        // Optional: Add logging to debug
        console.log("Uploading photo:", {
          memberId: memberId,
          type: 2,
          fileName: photo.file!.name,
          fileSize: photo.file!.size,
          fileType: photo.file!.type
        }, formData);
      
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_DATA_URL}/member/profile-photo`,
          {
            method: "POST",
            headers: { 
              Authorization: `Bearer ${token}`
            },
            body: formData,
          }
        );
      
        // Check response
        if (!res.ok) {
          let errorMessage = "Upload failed";
          try {
            const errorData = await res.json();
            console.error("Upload error response:", errorData);
            errorMessage = errorData.message || errorData.error || "Upload failed";
          } catch (parseError) {
            console.error("Failed to parse error response:", parseError);
          }
          throw new Error(errorMessage);
        }
        
        const responseData = await res.json();
        console.log("Upload success:", responseData);
      }

      showSuccess("Gallery photos updated successfully!");
      router.push(`/admin/dashboard/members/create/${params.id}/plans`);
    } catch (err: any) {
      console.error("Submit error:", err);
      showError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== UI ====================
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header & Progress */}
      <PageHeader
        title="Gallery Photos"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Members", href: "/admin/dashboard/members" },
          { label: "Gallery Photos" },
        ]}
        step={{ current: 9, total: 10, description: "Gallery Photos" }}
      />

      <div className="flex justify-center px-4">
        <div className="flex w-full max-w-md gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={`h-2.5 flex-1 rounded-full ${i < 9 ? "bg-purple-600" : "bg-gray-200"}`} />
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl text-center">
        {isFetching ? (
          <div className="py-12">Loading your photos...</div>
        ) : (
          <>
            <input 
              ref={fileInputRef} 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageChange} 
              className="hidden" 
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= MAX_IMAGES || isLoading}
              className="mb-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {images.length ? "Add More Photos" : "Upload Photos"}
            </button>

            <p className="text-sm text-gray-500 mb-6">
              {images.length} / {MAX_IMAGES} photos
            </p>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {images.map((photo, index) => (
                  <div key={index} className="relative rounded-xl overflow-hidden border group">
                    <Image 
                      src={photo.src} 
                      alt={`Photo ${index + 1}`} 
                      width={200} 
                      height={200} 
                      className="object-cover w-full h-40" 
                      unoptimized
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕ 
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-gray-400 text-lg">No photos yet 📷</div>
            )}
            <div className="flex flex-col gap-4 pt-8 sm:flex-row">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 rounded-2xl border border-gray-300 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                ← Back to Profile Photo
              </button>

              <form onSubmit={handleSubmit} className="flex-1">
                <button
                  type="submit"
                  disabled={images.length < 1 || isLoading}
                  className={`w-full rounded-2xl py-4 text-base font-semibold transition-all ${
                    images.length >= 1
                      ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? "Saving..." : "Finish →"}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}