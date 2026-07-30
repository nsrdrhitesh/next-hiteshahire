// app/admin/dashboard/components/QuillEditor.jsx
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export default function QuillEditor({ onChange, initialContent = '<p>Start writing your blog post...</p>' }) {
  const editorRef = useRef(null)
  const quillInstance = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(null)

  // Function to set editor content
  const setEditorContent = useCallback((content) => {
    if (quillInstance.current && content) {
      try {
        // Check if content is different from current content
        const currentContent = quillInstance.current.root.innerHTML;
        if (currentContent !== content) {
          quillInstance.current.root.innerHTML = content;
          console.log('Editor content updated to:', content.substring(0, 50) + '...');
        }
      } catch (err) {
        console.error('Error setting editor content:', err);
      }
    }
  }, []);

  useEffect(() => {
    // Load Quill styles
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css'
    document.head.appendChild(link)

    // Load Quill script
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js'
    script.async = true
    
    script.onload = () => {
      if (window.Quill && editorRef.current && !quillInstance.current) {
        try {
          // Initialize Quill with the initial content from the div
          quillInstance.current = new window.Quill(editorRef.current, {
            theme: 'snow',
            modules: {
              toolbar: [
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ color: [] }, { background: [] }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image', 'blockquote', 'code-block'],
                ['clean']
              ]
            },
            placeholder: 'Write something amazing...',
          })

          // Set initial content if provided
          if (initialContent) {
            setEditorContent(initialContent);
          }

          // Add text change handler
          quillInstance.current.on('text-change', (delta, oldDelta, source) => {
            if (onChange && source === 'user') { // Only trigger on user changes
              const html = quillInstance.current.root.innerHTML;
              const text = quillInstance.current.getText();
              const delta = quillInstance.current.getContents();
              
              console.log('🔵 Quill text-change fired:', {
                htmlLength: html.length,
                htmlPreview: html.substring(0, 100),
                source: source
              });
              
              onChange({ html, text, delta });
            }
          });

          setIsLoaded(true)
          console.log('Quill editor initialized successfully with content:', initialContent.substring(0, 50) + '...');
        } catch (err) {
          setError('Failed to initialize editor')
          console.error('Quill initialization error:', err)
        }
      }
    }

    script.onerror = () => {
      setError('Failed to load Quill script')
    }

    document.body.appendChild(script)

    // Cleanup
    return () => {
      if (quillInstance.current) {
        quillInstance.current.off('text-change')
      }
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [onChange, setEditorContent, initialContent]) // Add dependencies

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reload Page
        </button>
      </div>
    )
  }

  return (
    <div className="quill-editor-container w-full">
      <div className="editor-wrapper border rounded-lg overflow-hidden">
        <div 
          ref={editorRef}
          className="min-h-[300px] bg-white dark:bg-gray-800 dark:text-white"
          style={{ 
            opacity: isLoaded ? 1 : 0.5,
            transition: 'opacity 0.3s ease'
          }}
        >
          {/* Initial content will be replaced by Quill */}
          <p>Loading editor...</p>
        </div>
      </div>
      {!isLoaded && !error && (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading editor...</p>
        </div>
      )}
    </div>
  )
}