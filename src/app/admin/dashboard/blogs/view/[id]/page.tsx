"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from '../../../components/ui/breadcrumb';
import { showSuccess, showError } from '../../../lib/swalHelper';
import PageHeader from "../../../components/ui/PageHeader";
import { ArrowLeft, Edit } from "lucide-react";

interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorId: number;
  categoryId: number;
  platformId: number;
  statusId: number;
  featuredImage: string;
  tags: string[];
  likes: number;
  metaTitle: string;
  alternateName?: string;
  metaDescription: string;
  metaKeywords: string;
  schemaCode: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

export default function ViewBlogPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_PLAIN;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  
  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    if (stored) setPermissions(JSON.parse(stored));
    const platformId = localStorage.getItem("selected_platform_id");
    setSelectedPlatformId(platformId);
  }, []);

  useEffect(() => {
    setSelectedPlatformId(localStorage.getItem("selected_platform_id"));
  }, []);

  // Convert plain text to HTML (line breaks -> <br>, paragraphs)
  const textToHtml = (text: string): string => {
    if (!text) return '';
    // If it already contains HTML tags, return as is
    if (/<[a-z][\s\S]*>/i.test(text)) return text;
    // Otherwise wrap paragraphs and preserve line breaks
    return text
      .split(/\r?\n\r?\n/)
      .map(para => `<p>${para.replace(/\r?\n/g, '<br>')}</p>`)
      .join('');
  };

  // Process images and fix relative URLs
  const processContent = (html: string): string => {
    if (!html || typeof window === 'undefined' || !IMAGE_BASE_URL) return html;
    
    let processed = html;
    // Convert plain text to HTML if needed
    if (!/<[a-z][\s\S]*>/i.test(processed)) {
      processed = textToHtml(processed);
    }
    
    // Fix image URLs
    const div = document.createElement('div');
    div.innerHTML = processed;
    const images = div.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src && src.startsWith('/uploads/')) {
        img.setAttribute('src', `${IMAGE_BASE_URL}${src}`);
      }
    });
    return div.innerHTML;
  };

  const getFeaturedImageUrl = (imagePath: string): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('data:image')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `${IMAGE_BASE_URL}${imagePath}`;
    if (imagePath.startsWith('http')) return imagePath;
    return `${IMAGE_BASE_URL}/${imagePath}`;
  };

  useEffect(() => {
    if (!blogId || !selectedPlatformId) return;

    const fetchBlog = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          router.push("/login");
          return;
        }

        const url = `${API_URL}/blogs/${selectedPlatformId}/${blogId}`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch blog: ${res.status}`);

        const json = await res.json();
        let blogData = json.data?.data || json.data;
        if (!blogData) throw new Error("Invalid response format");

        // Fetch category if needed
        if (blogData.categoryId && !blogData.category) {
          try {
            const catRes = await fetch(`${API_URL}/blogs/categories/${selectedPlatformId}/${blogData.categoryId}`, {
              headers: { "Authorization": `Bearer ${accessToken}` },
            });
            if (catRes.ok) {
              const catJson = await catRes.json();
              blogData.category = catJson.data?.data || catJson.data;
            }
          } catch (err) {
            console.error("Failed to fetch category:", err);
          }
        }

        // Process content (HTML or plain text)
        if (blogData.content) {
          blogData.content = processContent(blogData.content);
        }

        setBlog(blogData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load blog post");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlog();
  }, [blogId, API_URL, selectedPlatformId, router]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this blog? This action cannot be undone.")) return;
    setIsDeleting(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/blogs/${blogId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error("Failed to delete blog");
      await showSuccess("Blog deleted successfully");
      router.push("/admin/dashboard/blogs");
      router.refresh();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!blog) return;
    try {
      const accessToken = localStorage.getItem("access_token");
      const duplicateData = {
        title: `${blog.title} (Copy)`,
        slug: `${blog.slug}-copy-${Date.now()}`,
        content: blog.content,
        excerpt: blog.excerpt,
        category: blog.categoryId,
        tags: blog.tags,
        alternateName: blog.alternateName,
        metaTitle: blog.metaTitle,
        metaDescription: blog.metaDescription,
        metaKeywords: blog.metaKeywords,
        platform_id: blog.platformId,
        status: 1,
        publishAt: null,
      };
      const response = await fetch(`${API_URL}/blogs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(duplicateData),
      });
      if (!response.ok) throw new Error("Failed to duplicate blog");
      await showSuccess("Blog duplicated successfully");
      router.push("/admin/dashboard/blogs");
      router.refresh();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const getStatusText = (statusId: number) => {
    const map: Record<number, string> = { 1: "Draft", 2: "Published", 3: "Scheduled" };
    return map[statusId] || "Unknown";
  };

  const getStatusColor = (statusId: number) => {
    const status = getStatusText(statusId).toLowerCase();
    switch (status) {
      case "published": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "draft":     return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "scheduled": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:          return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="rounded-xl bg-white p-8 text-center dark:bg-gray-800">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
          <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {error || "Blog not found"}
        </h2>
        <Link
          href="/admin/dashboard/blogs"
          className="mt-6 inline-block rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 text-white hover:from-purple-700 hover:to-pink-600"
        >
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Custom CSS to properly display Quill content */}
      <style jsx global>{`
        /* Quill alignment classes */
        .ql-align-center { text-align: center; }
        .ql-align-right { text-align: right; }
        .ql-align-justify { text-align: justify; }
        
        /* Quill indentation (0-8 levels) */
        .ql-indent-1 { padding-left: 3em; }
        .ql-indent-2 { padding-left: 6em; }
        .ql-indent-3 { padding-left: 9em; }
        .ql-indent-4 { padding-left: 12em; }
        .ql-indent-5 { padding-left: 15em; }
        .ql-indent-6 { padding-left: 18em; }
        .ql-indent-7 { padding-left: 21em; }
        .ql-indent-8 { padding-left: 24em; }
        
        /* Quill list styles (already supported by prose, but ensure spacing) */
        .ql-editor ul, .ql-editor ol {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          padding-left: 1.5em;
        }
        .ql-editor li {
          margin-bottom: 0.25em;
        }
        
        /* Preserve line breaks and spacing */
        .blog-content {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .blog-content p {
          margin-bottom: 1.25em;
          line-height: 1.7;
        }
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1.5rem 0;
        }
        .blog-content h1, .blog-content h2, .blog-content h3 {
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-weight: 600;
        }
        .blog-content blockquote {
          border-left: 4px solid #8b5cf6;
          padding-left: 1rem;
          font-style: italic;
          margin: 1rem 0;
          color: #4b5563;
        }
        .dark .blog-content blockquote {
          color: #d1d5db;
        }
      `}</style>

      {/* Header (same as before) */}
      <PageHeader
        title={blog.title}
        description={`Last updated: ${new Date(blog.updatedAt).toLocaleString()}`}
        breadcrumbItems={[
            { label: 'Dashboard', href: '/admin/dashboard' },
            { label: 'Blogs', href: '/admin/dashboard/blogs' },
            { label: 'View' },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/blogs",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
          },
          {
            href: `/admin/dashboard/blogs/edit/${blog.id}`,
            label: "Edit Blog",
            icon: <Edit className="h-4 w-4" />,
            variant: 'primary',
            permission: { 
              resource: "blogs", 
              action: "edit"   // or "edit"
            }
          }
        ]}
        permissions={permissions}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - content */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
            {/* Featured Image */}
            {blog.featuredImage && (
              <div className="relative h-64 w-full sm:h-80 md:h-96">
                <img
                  src={getFeaturedImageUrl(blog.featuredImage)}
                  alt={blog.alternateName || blog.title}
                  className="h-full w-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* Meta row */}
              <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(blog.statusId)}`}>
                  {getStatusText(blog.statusId)}
                </span>
                {blog.category && (
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    {blog.category.name}
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {blog.likes || 0} likes
                </div>
              </div>

              {/* Excerpt */}
              {blog.excerpt && (
                <div className="mb-8 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-5 dark:from-purple-950/20 dark:to-pink-950/20 border-l-4 border-purple-500">
                  <div 
                    className="excerpt-content text-gray-700 dark:text-gray-300"
                    style={{ 
                      fontFamily: 'inherit',
                      lineHeight: '1.6',
                    }}
                  >
                    {blog.excerpt.split(/\r?\n/).map((line, idx) => {
                      // Handle empty lines (paragraph breaks)
                      if (!line.trim()) {
                        return <div key={idx} className="my-3" />;
                      }

                      // Check if line contains HTML tags
                      if (/<[a-z][\s\S]*>/i.test(line)) {
                        return (
                          <div 
                            key={idx}
                            className="mb-2 last:mb-0"
                            dangerouslySetInnerHTML={{ __html: line }}
                          />
                        );
                      }

                      // Check if line starts with quotes or special formatting
                      const isQuote = line.startsWith('"') || line.includes('"');

                      return (
                        <p 
                          key={idx} 
                          className={`mb-2 last:mb-0 ${isQuote ? 'italic' : ''}`}
                          style={{
                            marginBottom: '0.75rem',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Main blog content - with Quill styling */}
              <div className="blog-content prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-purple-600 dark:prose-a:text-purple-400">
                <div dangerouslySetInnerHTML={{ __html: blog.content || "" }} />
              </div>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-700">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag, i) => (
                      <span key={i} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar - unchanged (keep your existing sidebar) */}
        <div className="space-y-6">
          {/* Blog Information Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Blog Information</h3>
            <div className="space-y-4 text-sm">
              <div><p className="font-medium text-gray-500 dark:text-gray-400">Slug</p><p className="mt-1 break-all text-gray-900 dark:text-white font-mono text-xs">{blog.slug}</p></div>
              <div><p className="font-medium text-gray-500 dark:text-gray-400">Created</p><p className="mt-1 text-gray-900 dark:text-white">{new Date(blog.createdAt).toLocaleString()}</p></div>
              <div><p className="font-medium text-gray-500 dark:text-gray-400">Last Modified</p><p className="mt-1 text-gray-900 dark:text-white">{new Date(blog.updatedAt).toLocaleString()}</p></div>
              {blog.publishedAt && <div><p className="font-medium text-gray-500 dark:text-gray-400">Published</p><p className="mt-1 text-gray-900 dark:text-white">{new Date(blog.publishedAt).toLocaleString()}</p></div>}
              <div><p className="font-medium text-gray-500 dark:text-gray-400">Author ID</p><p className="mt-1 text-gray-900 dark:text-white">{blog.authorId}</p></div>
            </div>
          </div>

          {/* SEO Information Card (if exists) */}
          {(blog.metaTitle || blog.metaDescription || blog.metaKeywords) && (
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">SEO Information</h3>
              <div className="space-y-4 text-sm">
                {blog.metaTitle && <div><p className="font-medium text-gray-500 dark:text-gray-400">Meta Title</p><p className="mt-1 text-gray-900 dark:text-white">{blog.metaTitle}</p></div>}
                {blog.metaDescription && <div><p className="font-medium text-gray-500 dark:text-gray-400">Meta Description</p><p className="mt-1 text-gray-600 dark:text-gray-300 line-clamp-3">{blog.metaDescription}</p></div>}
                {blog.metaKeywords && <div><p className="font-medium text-gray-500 dark:text-gray-400">Meta Keywords</p><div className="mt-1 flex flex-wrap gap-1">{blog.metaKeywords.split(',').map((kw,i) => <span key={i} className="text-xs text-gray-600 dark:text-gray-400">#{kw.trim()}</span>)}</div></div>}
              </div>
            </div>
          )}

          {/* Quick Actions Card */}
          <div className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white">
            <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
            <div className="space-y-3">
              <button onClick={() => window.open(`/blog/${blog.slug}`, '_blank')} className="flex w-full items-center justify-between rounded-lg bg-white/20 px-4 py-3 backdrop-blur-sm hover:bg-white/30">
                <span>View Live</span><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </button>
              <Link href={`/admin/dashboard/blogs/edit/${blog.id}`} className="flex w-full items-center justify-between rounded-lg bg-white/20 px-4 py-3 backdrop-blur-sm hover:bg-white/30">
                <span>Edit Blog</span><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </Link>
              <button onClick={handleDuplicate} className="flex w-full items-center justify-between rounded-lg bg-white/20 px-4 py-3 backdrop-blur-sm hover:bg-white/30">
                <span>Duplicate Blog</span><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex w-full items-center justify-between rounded-lg bg-red-500/20 px-4 py-3 backdrop-blur-sm hover:bg-red-500/30 disabled:opacity-50">
                <span>{isDeleting ? "Deleting..." : "Delete Blog"}</span><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>

          {/* Reading Time */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Reading Time</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.ceil((blog.content?.replace(/<[^>]*>/g, '').length || 0) / 1000)} min</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Approximate read time</p>
          </div>
        </div>
      </div>
    </div>
  );
}