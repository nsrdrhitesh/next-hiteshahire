"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { showSuccess, showError } from "@/app/admin/dashboard/lib/swalHelper";

interface GalleryImage {
  src: string;
  id?: number;
  file?: File;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  existingPhotos: string[];
  onSuccess: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
const MEDIA_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_PLAIN + "/";
const MAX_IMAGES = 6;

export default function EditGalleryModal({ isOpen, onClose, memberId, existingPhotos, onSuccess }: Props) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing gallery photos from API
  useEffect(() => {
    if (!isOpen || !memberId) return;
    const fetchGallery = async () => {
      setFetching(true);
      const token = localStorage.getItem("access_token");
      try {
        const res = await fetch(`${API_URL}/member-get/gallery/${memberId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && json.data?.data) {
          const loaded = json.data.data.map((item: any) => ({
            src: `${MEDIA_URL}${item.image}`,
            id: item.id,
          }));
          setImages(loaded);
        } else {
          setImages([]);
        }
      } catch (err) {
        console.error(err);
        setImages([]);
      } finally {
        setFetching(false);
      }
    };
    fetchGallery();
  }, [isOpen, memberId]);

  const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > MAX_IMAGES) {
      showError(`Maximum ${MAX_IMAGES} photos allowed`);
      return;
    }
    files.forEach(file => {
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
        setImages(prev => [...prev, { src: reader.result as string, file }]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = async (index: number) => {
    const photo = images[index];
    if (photo.id) {
      const token = localStorage.getItem("access_token");
      try {
        const res = await fetch(`${API_URL}/member/photo/${photo.id}/${memberId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Delete failed");
      } catch (err: any) {
        showError(err.message);
        return;
      }
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (images.length < 1) {
      showError("At least 1 photo required");
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("access_token");
    try {
      const newPhotos = images.filter(img => !img.id && img.file);
      for (const photo of newPhotos) {
        const formData = new FormData();
        formData.append("profilePhoto", photo.file!);
        formData.append("memberId", memberId);
        formData.append("type", "2");
        const res = await fetch(`${API_URL}/member/profile-photo`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
      }
      showSuccess("Gallery updated");
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Gallery Photos</h2>
        {fetching ? (
          <div className="text-center py-8">Loading gallery...</div>
        ) : (
          <>
            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleAddPhotos} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= MAX_IMAGES}
              className="w-full mb-4 border rounded-xl py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              {images.length ? "Add More Photos" : "Upload Photos"}
            </button>
            <p className="text-sm text-gray-500 mb-4">{images.length} / {MAX_IMAGES} photos</p>
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {images.map((photo, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border">
                    <Image src={photo.src} alt="Gallery" width={150} height={150} className="object-cover w-full h-32" unoptimized />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">No photos yet</div>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl">Cancel</button>
              <button onClick={handleSubmit} disabled={loading || images.length === 0} className="px-4 py-2 bg-purple-600 text-white rounded-xl">Save</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}