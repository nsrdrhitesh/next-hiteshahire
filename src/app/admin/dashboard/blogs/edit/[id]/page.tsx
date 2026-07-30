"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { showSuccess, showError } from '../../../lib/swalHelper';
import { Breadcrumb } from '../../../components/ui/breadcrumb';
import PageHeader from "../../../components/ui/PageHeader";

const QuillEditor = dynamic(
  () => import("@/app/admin/dashboard/components/QuillEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading editor...</p>
      </div>
    )
  }
);

export default function EditBlogPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_PLAIN;
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingFeaturedImagePath, setExistingFeaturedImagePath] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0); // Force editor remount

  const [editorContent, setEditorContent] = useState("<p></p>");
  const editorContentRef = useRef("<p></p>");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: 0,
    tags: [] as string[],
    featuredImage: "",
    alternateName: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    platform_id: 0,
    status: 1,
    publishAt: null as Date | null,
  });

  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const statuses = [
    { value: 1, label: "Draft" },
    { value: 2, label: "Published" },
    { value: 3, label: "Scheduled" },
  ];

  // Helper: Convert relative image URLs to absolute
  const processContentImages = (html: string): string => {
    if (!html || typeof window === 'undefined' || !IMAGE_BASE_URL) return html;
    const div = document.createElement('div');
    div.innerHTML = html;
    const images = div.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src && src.startsWith('/uploads/')) {
        img.setAttribute('src', `${IMAGE_BASE_URL}${src}`);
      }
    });
    return div.innerHTML;
  };

  // Convert base64 to File (for extraction)
  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  // Extract ONLY base64 inline images (newly added) from HTML and replace with placeholders
  const extractInlineImagesFromHtml = (html: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const imgElements = tempDiv.querySelectorAll("img");
    const newImagesBase64: string[] = [];
    let counter = 1;

    for (let i = 0; i < imgElements.length; i++) {
      const img = imgElements[i];
      const src = img.getAttribute("src");
      if (src && src.startsWith("data:image")) {
        // This is a NEW image (base64)
        newImagesBase64.push(src);
        img.setAttribute("src", `__INLINE_IMAGE_${counter}__`);
        counter++;
      }
      // else: existing image URL remains as is (no placeholder replacement)
    }

    const updatedContent = tempDiv.innerHTML;
    return { updatedContent, newImagesBase64 };
  };

  // Fetch blog data
  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        setLoading(true);
        setError(null);

        const accessToken = localStorage.getItem("access_token");
        const selectedPlatformId = localStorage.getItem("selected_platform_id");

        if (!accessToken || !blogId) {
          router.push("/login");
          return;
        }

        // Fetch blog
        const blogRes = await fetch(`${API_URL}/blogs/${selectedPlatformId}/${blogId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!blogRes.ok) throw new Error("Blog not found");
        const blog01 = await blogRes.json();
        const blog = blog01.data?.data || blog01.data; // Adjust based on your API response structure 
        // Fetch categories
        const catRes = await fetch(`${API_URL}/blogs/categories/${selectedPlatformId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.data?.data || catData.data || []);
        }

        // Process content: replace relative image URLs with absolute URLs for display
        let processedContent = blog.content || "<p></p>";
        processedContent = processContentImages(processedContent);
        console.log("Processed content 0020002: ",blog.title);
        // Populate form data
        setFormData({
          title: blog.title || "",
          slug: blog.slug || "",
          excerpt: blog.excerpt || "",
          content: processedContent,
          category: blog.categoryId || 0,
          tags: Array.isArray(blog.tags) ? blog.tags : [],
          featuredImage: blog.featuredImage || "",
          alternateName: blog.alternateName || "",
          metaTitle: blog.metaTitle || "",
          metaDescription: blog.metaDescription || "",
          metaKeywords: blog.metaKeywords || "",
          platform_id: parseInt(selectedPlatformId || "0", 10),
          status: blog.statusId || 1,
          publishAt: blog.publishedAt ? new Date(blog.publishedAt) : null,
        });

        setTagsInput((blog.tags || []).join(", "));

        // Handle featured image preview
        if (blog.featuredImage) {
          const featuredFullUrl = blog.featuredImage
            ? `${IMAGE_BASE_URL}/${blog.featuredImage}`
            : blog.featuredImage;
          console.log("Featured image URL: ", featuredFullUrl);
          setImagePreview(featuredFullUrl);
          setExistingFeaturedImagePath(blog.featuredImage);
        }

        console.log("Fetched blog data: ", blog);
        // Set editor content and force remount
        setEditorContent(processedContent);
        editorContentRef.current = processedContent;
        setEditorKey(prev => prev + 1); // Force Quill to reinitialize with new content
        console.log("Editor content set: ", processedContent);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load blog");
      } finally {
        setLoading(false);
      }
    };

    if (blogId) fetchBlogData();
  }, [API_URL, IMAGE_BASE_URL, blogId, router]);

  // Handlers
  const handleEditorChange = (html: string) => {
    editorContentRef.current = html;
    setEditorContent(html);
    setFormData(prev => ({ ...prev, content: html }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ["category", "status", "platform_id"].includes(name)
        ? parseInt(value, 10) || 0
        : name === "publishAt"
        ? value ? new Date(value) : null
        : value,
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagsInput(value);
    const parsed = value.split(",").map(t => t.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags: parsed }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setFormData(prev => ({ ...prev, featuredImage: base64 }));
      setExistingFeaturedImagePath(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, featuredImage: "" }));
    setExistingFeaturedImagePath(null);
  };

  const generateSlug = () => {
    if (!formData.title) return alert("Enter title first");
    const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setFormData(prev => ({ ...prev, slug }));
  };

  // Helper: Convert absolute image URLs back to relative paths
  const removeBaseUrlFromImages = (html: string): string => {
    if (!html || typeof window === 'undefined' || !IMAGE_BASE_URL) return html;
    const div = document.createElement('div');
    div.innerHTML = html;
    const images = div.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src && src.startsWith(IMAGE_BASE_URL)) {
        // Remove the base URL, keep the relative path
        const relativePath = src.replace(IMAGE_BASE_URL, '');
        img.setAttribute('src', relativePath);
      }
    });
    return div.innerHTML;
  };

  const stripHtml = (html: string) => {
    if (typeof window === "undefined") return html;
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    let finalContent = editorContentRef.current || formData.content;
    if (!finalContent || finalContent === "<p></p>" || finalContent === "<p><br></p>") {
      showError("Please write some content");
      setSubmitting(false);
      return;
    }

    // STEP 2: Revert absolute URLs to relative paths BEFORE extraction
    finalContent = removeBaseUrlFromImages(finalContent);

    // Extract new inline images from the current editor content
    const { updatedContent, newImagesBase64 } = extractInlineImagesFromHtml(finalContent);

    const payload: any = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt || stripHtml(finalContent).substring(0, 160),
      content: updatedContent, // Contains placeholders only for NEW images, existing URLs are now relative
      category: formData.category,
      tags: formData.tags,
      alternateName: formData.alternateName,
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
      metaKeywords: formData.metaKeywords,
      platform_id: formData.platform_id,
      status: formData.status,
      publishAt: formData.publishAt ? formData.publishAt.toISOString() : null,
      inline_images: newImagesBase64, // Only send base64 of NEW images
    };

    // Featured image handling
    if (formData.featuredImage !== undefined) {
      if (formData.featuredImage === "") {
        payload.featuredImage = ""; // delete
      } else if (formData.featuredImage && formData.featuredImage.startsWith('data:image')) {
        payload.featuredImage = formData.featuredImage; // new base64
      }
      // If it's an existing image path, don't send anything (keep unchanged)
    }

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/blogs/${blogId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Update failed");
      }
      await showSuccess("Blog updated successfully");
      router.push("/admin/dashboard/blogs");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 dark:bg-red-900/20">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error</h3>
        <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 rounded bg-red-600 px-4 py-2 text-white">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Edit Blog Post"
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
            label: "Update Blog",
            type: "submit",
            form: "edit-blog-form",
            variant: "primary",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form id="edit-blog-form" onSubmit={handleSubmit} className="space-y-6">
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
                required
              />
            </div>

            {/* Content - Quill Editor */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Content *
              </label>
              <QuillEditor
                key={editorKey}
                value={editorContent}
                onChange={handleEditorChange}
                placeholder="Start writing..."
              />
              <div className="mt-2 text-right text-sm text-gray-500">
                {stripHtml(formData.content).length} characters
              </div>
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
              />
            </div>

            {/* SEO Settings */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">SEO Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Slug</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      required
                    />
                    <button type="button" onClick={generateSlug} className="rounded-lg border border-gray-300 bg-white px-3 text-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                      Generate
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Title</label>
                  <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description</label>
                  <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} rows={3} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Keywords</label>
                  <input type="text" name="metaKeywords" value={formData.metaKeywords} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Publish</h3>
            <div className="space-y-4">
              {/* className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              {formData.status === 3 && (
                <div>
                  <label className="mb-2 block text-sm font-medium">Publish Date</label>
                  <input type="datetime-local" name="publishAt" value={formData.publishAt ? new Date(formData.publishAt).toISOString().slice(0, 16) : ""} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Featured Image */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Featured Image</h3>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="h-48 w-full rounded-lg object-cover" />
                  <button type="button" onClick={handleDeleteImage} className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600">✕</button>
                </div>
              ) : (
                <div onClick={() => document.getElementById("edit-image-upload")?.click()} className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8">
                  <p className="text-sm text-gray-500">Click to upload</p>
                </div>
              )}
              <input type="file" id="edit-image-upload" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {imagePreview && (                                                                                        
                <button type="button" onClick={() => document.getElementById("edit-image-upload")?.click()} className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  Change Image
                </button>
              )}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alt Text</label>
              <input type="text" name="alternateName" value={formData.alternateName} onChange={handleChange} className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </div>
          </div>

          {/* Categories & Tags */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Categories & Tags</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  <option value={0}>Select a category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Tags</label>
                <input type="text" value={tagsInput} onChange={handleTagsChange} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Comma separated" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}