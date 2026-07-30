import { useState, useRef } from "react";
import Image from "next/image";
import { showSuccess, showError } from "@/app/admin/dashboard/lib/swalHelper";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  currentPhoto?: string | null;
  onSuccess: () => void;
}

export default function EditProfilePhotoModal({ isOpen, onClose, memberId, currentPhoto, onSuccess }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showError("Only images allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError("Max 5MB");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile && !currentPhoto) {
      showError("Please select a photo");
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("access_token");
    try {
      const formData = new FormData();
      if (selectedFile) formData.append("profilePhoto", selectedFile);
      formData.append("memberId", memberId);
      formData.append("type", "1");

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_DATA_URL}/member/profile-photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      showSuccess("Profile photo updated");
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Profile Photo</h2>
        <div className="flex justify-center mb-4">
          {preview ? (
            <Image src={preview} alt="Preview" width={150} height={150} className="rounded-2xl object-cover" unoptimized />
          ) : (
            <div className="w-36 h-36 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400">No photo</div>
          )}
        </div>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <button onClick={() => fileInputRef.current?.click()} className="w-full mb-3 border rounded-xl py-2">Choose Photo</button>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border rounded-xl py-2">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-purple-600 text-white rounded-xl py-2">Upload</button>
        </div>
      </div>
    </div>
  );
}