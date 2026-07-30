"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QuillEditor from "@/app/admin/dashboard/components/QuillEditor";
import { showSuccess, showError } from "../../lib/swalHelper";
import { Breadcrumb } from "../../components/ui/breadcrumb";
import PageHeader from "../../components/ui/PageHeader";

export default function CreateBlogPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  
  const editorContentRef = useRef("<p></p>");
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: 0,
    tags: [] as string[],
    alternateName: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    platform_id: 0,
    status: 0,
    publishAt: null as Date | null,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [editorContent, setEditorContent] = useState("<p></p>");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [categories, setCategories] = useState([
    { id: "all", name: "All Categories" }
  ]);

  const statuses = [
    { value: 1, label: "Draft" },
    { value: 2, label: "Published" },
    { value: 3, label: "Scheduled" },
  ];

  const stripHtml = (html: string) => {
    if (typeof window === 'undefined') return html;
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Convert base64 to File
  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Clear error when user types
  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Extract all base64 images from HTML, replace with placeholders, and return files array
  const extractImagesFromHtml = (html: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const imgElements = tempDiv.querySelectorAll("img");
    const imageFiles: File[] = [];
    let counter = 1;
  
    for (let i = 0; i < imgElements.length; i++) {
      const img = imgElements[i];
      const src = img.getAttribute("src");
      if (src && src.startsWith("data:image")) {
        const file = base64ToFile(src, `inline_image_${counter}.png`);
        imageFiles.push(file);
        img.setAttribute("src", `__INLINE_IMAGE_${counter}__`);
        counter++;
      }
    }
  
    const updatedContent = tempDiv.innerHTML;
    return { updatedContent, imageFiles };
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagsInput(value);
    const parsedTags = value
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags: parsedTags }));
    clearFieldError("tags");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        name === "category" || name === "status"
          ? parseInt(value, 10)
          : name === "publishAt"
          ? value
            ? new Date(value)
            : null
          : value,
    }));
    clearFieldError(name);
  };

  const handleEditorChange = (html: string) => {
    editorContentRef.current = html;
    setEditorContent(html);
    setFormData(prev => ({ ...prev, content: html }));
    clearFieldError("content");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      clearFieldError("featuredImage");
    }
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData(prev => ({ ...prev, slug }));
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   setError(null);
    
  //   // 1. Get final content from ref or DOM
  //   let finalContent = editorContentRef.current;
  //   if (!finalContent || finalContent === "<p></p>") {
  //     const quillElement = document.querySelector('.ql-editor');
  //     if (quillElement) finalContent = quillElement.innerHTML;
  //   }
    
  //   if (!finalContent || finalContent === "<p><br></p>" || finalContent === "<p></p>") {
  //     setIsLoading(false);
  //     showError("Please write some content for your blog post");
  //     return;
  //   }
    
  //   // 2. Extract inline images and replace with placeholders
  //   const { updatedContent, imageFiles } = extractImagesFromHtml(finalContent);
    
  //   // 3. Build FormData
  //   const formDataToSend = new FormData();
    
  //   // Append all text fields
  //   formDataToSend.append("title", formData.title);
  //   formDataToSend.append("slug", formData.slug);
  //   formDataToSend.append("excerpt", formData.excerpt || stripHtml(finalContent).substring(0, 160));
  //   formDataToSend.append("content", updatedContent); // contains __IMAGE_X__ placeholders
  //   formDataToSend.append("category", String(formData.category));
  //   formDataToSend.append("tags", JSON.stringify(formData.tags));
  //   formDataToSend.append("alternateName", formData.alternateName);
  //   formDataToSend.append("metaTitle", formData.metaTitle);
  //   formDataToSend.append("metaDescription", formData.metaDescription);
  //   formDataToSend.append("metaKeywords", formData.metaKeywords);
  //   formDataToSend.append("platform_id", String(formData.platform_id));
  //   formDataToSend.append("status", String(formData.status));
  //   if (formData.publishAt) {
  //     formDataToSend.append("publishAt", formData.publishAt.toISOString());
  //   }
    
  //   // 4. Append featured image as binary file (field name: featureImage)
  //   if (featuredImageFile) {
  //     formDataToSend.append("featureImage", featuredImageFile);
  //   }
    
  //   // 5. Append each inline image as image1, image2, ... (binary files)
  //   imageFiles.forEach((file, index) => {
  //     formDataToSend.append(`image${index + 1}`, file);
  //   });
    
  //   // 6. Send request
  //   try {
  //     const accessToken = localStorage.getItem("access_token");
  //     if (!accessToken) {
  //       router.push("/login");
  //       return;
  //     }
      
  //     const response = await fetch(`${API_URL}/blogs`, {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //         // Do NOT set Content-Type - browser will set multipart boundary
  //       },
  //       body: formDataToSend,
  //     });
      
  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || "Failed to create blog");
  //     }
      
  //     await showSuccess("Blog created successfully");
  //     router.push("/admin/dashboard/blogs");
  //     router.refresh();
  //   } catch (err: any) {
  //     console.error(err);
  //     showError(err.message);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Fetch categories and set platform_id

  // In your handleSubmit function, replace the FormData approach with JSON:

  // Standard Frontend Validation
  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // Title validation
    if (!formData.title || formData.title.trim().length === 0) {
      newErrors.title = "Blog title is required";
    } else if (formData.title.trim().length < 5) {
      newErrors.title = "Blog title must be at least 5 characters long";
    }

    // Slug validation
    if (!formData.slug || formData.slug.trim().length === 0) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers and hyphens";
    }

    // Content validation
    // const contentText = stripHtml(finalContent || "");
    // if (!finalContent || finalContent === "<p></p>" || finalContent === "<p><br></p>" || contentText.trim().length < 10) {
    //   newErrors.content = "Blog content must be at least 10 characters long";
    // }

    // Category validation
    if (!formData.category || formData.category === 0) {
      newErrors.category = "Please select a valid category";
    }

    // Optional: Meta Description length (recommended for SEO)
    if (formData.metaDescription && formData.metaDescription.length > 160) {
      newErrors.metaDescription = "Meta description should not exceed 160 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setErrors({});

    // 1. Get final content first
    let finalContent = editorContentRef.current;
    if (!finalContent || finalContent === "<p></p>") {
      const quillElement = document.querySelector('.ql-editor');
      if (quillElement) finalContent = quillElement.innerHTML;
    }

    // 2. Perform frontend validation (Standard way)
    const validationErrors = validateForm();   // ← Call the function

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      // showError("Please fix the highlighted errors");
      return;
    }

    // 3. If validation passes → proceed with image extraction and API call
    const { updatedContent, imageFiles } = extractImagesFromHtml(finalContent);

    // ... rest of your existing code (convert to base64, prepare payload, fetch call) remains same
    const convertFileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    };

    let featuredImageBase64 = null;
    if (featuredImageFile) {
      featuredImageBase64 = await convertFileToBase64(featuredImageFile);
    }

    const inlineImagesBase64 = await Promise.all(
      imageFiles.map(file => convertFileToBase64(file))
    );

    const payload = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt || stripHtml(finalContent).substring(0, 160),
      content: updatedContent,
      category: formData.category,
      tags: formData.tags,
      alternateName: formData.alternateName,
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
      metaKeywords: formData.metaKeywords,
      platform_id: formData.platform_id,
      status: formData.status,
      publishAt: formData.publishAt ? formData.publishAt.toISOString() : null,
      featuredImage: featuredImageBase64,
      inline_images: inlineImagesBase64,
    };

    // ... rest of your try-catch fetch logic remains unchanged
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/blogs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (errorData.message && typeof errorData.message === 'object') {
          const fieldErrors: Record<string, string> = {};
          Object.entries(errorData.message).forEach(([field, msgs]) => {
            if (Array.isArray(msgs)) {
              fieldErrors[field] = msgs.join(', ');
            } else if (typeof msgs === 'string') {
              fieldErrors[field] = msgs;
            }
          });
          setErrors(fieldErrors);
        } else {
          setError(errorData.message || 'Failed to create blog');
          showError(errorData.message || 'Failed to create blog');
        }
        setIsLoading(false);
        return;
      }

      await showSuccess("Blog created successfully");
      router.push("/admin/dashboard/blogs");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      showError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        const selectedPlatformId = localStorage.getItem("selected_platform_id");
        if (!accessToken || !selectedPlatformId) return;
        
        const response = await fetch(
          `${API_URL}/blogs/categories/${selectedPlatformId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        if (!response.ok) throw new Error("Failed to fetch categories");
        
        const data = await response.json();
        setCategories([
          { id: "all", name: "All Categories" },
          ...data.data.data
        ]);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([{ id: "all", name: "All Categories" }]);
      }
    };
    
    fetchCategories();
    
    const platformId = parseInt(localStorage.getItem("selected_platform_id") || "0", 10);
    setFormData(prev => ({ ...prev, platform_id: platformId }));
  }, [API_URL]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Create New Blog"
        // description="Add a new GST rate configuration for specific regions"
        breadcrumbItems={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Blogs', href: '/admin/dashboard/blogs' },
          { label: 'Create' },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/blogs",
            label: "Cancel",
            variant: "secondary",
          },
          {
            label: isLoading ? "Creating..." : "Create Blog",
            type: "submit",
            form: "blog-form",
            variant: "primary",
            disabled: isLoading,
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Blog Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter a compelling title"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
            </div>

            {/* Content - Quill Editor */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  Content *
                </label>
              </div>
              <QuillEditor 
                value={editorContent}
                onChange={handleEditorChange}
                placeholder="Start writing your amazing blog post..."
              />
              <div className="mt-2 text-right text-sm text-gray-500 dark:text-gray-400">
                {stripHtml(editorContent).length} characters
              </div>
              {errors.content && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>}
            </div>

            {/* Excerpt */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Excerpt
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Brief summary of your blog post"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                This will appear in blog listings and search results. If left empty, it will be auto-generated from content.
              </p>
              {errors.excerpt && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.excerpt}</p>}
            </div>

            {/* SEO Settings */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                SEO Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Slug
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className="flex-1 rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="blog-post-url"
                    />
                    <button
                      type="button"
                      onClick={generateSlug}
                      className="rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Generate
                    </button>
                  </div>
                  {errors.slug && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.slug}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="SEO title for search engines"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Meta Description
                  </label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    rows={3}
                    className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="SEO description for search engines"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    name="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Comma-separated keywords for SEO"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Publish
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              {formData.status === 3 && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Publish Date
                  </label>
                  <input
                    type="datetime-local"
                    name="publishAt"
                    value={
                      formData.publishAt
                        ? new Date(formData.publishAt).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  form="blog-form"
                  className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-600"
                >
                  {formData.status === 1 ? "Save Draft" : formData.status === 2 ? "Publish" : "Schedule"}
                </button>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Featured Image
            </h3>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-48 w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFeaturedImageFile(null);
                    }}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 dark:border-gray-600">
                  <svg className="mb-4 h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
              <input
                type="file"
                id="featured-image-input"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.getElementById("featured-image-input")?.click()}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                {imagePreview ? "Change Image" : "Upload Image"}
              </button>
            </div>
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Alternate Name
              </label>
              <input
                type="text"
                name="alternateName"
                value={formData.alternateName}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Describe the image for accessibility"
              />
            </div>
            {errors.featuredImage && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.featuredImage}</p>}
          </div>

          {/* Categories & Tags */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Categories & Tags
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={tagsInput}
                  onChange={handleTagsChange}
                  className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Add tags separated by commas"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Example: wedding, love, relationship, tips
                </p>
                {errors.tags && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tags}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}