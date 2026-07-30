'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

// Dynamically import the QuillEditor with no SSR
const QuillEditor = dynamic(
  () => import('./QuillEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="p-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }
)

export default function EditorWrapper() {
  const [editorContent, setEditorContent] = useState(null)
  const [savedContent, setSavedContent] = useState('')
  const [isReadOnly, setIsReadOnly] = useState(false)

  // Handle content changes
  const handleEditorChange = (content) => {
    setEditorContent(content)
    console.log('Content updated:', content)
  }

  // Save content
  const saveContent = () => {
    if (editorContent) {
      localStorage.setItem('quillContent', JSON.stringify(editorContent))
      setSavedContent('Content saved successfully!')
      setTimeout(() => setSavedContent(''), 3000)
    }
  }

  // Load content
  const loadContent = () => {
    const saved = localStorage.getItem('quillContent')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setEditorContent(parsed)
        setSavedContent('Content loaded successfully!')
        setTimeout(() => setSavedContent(''), 3000)
      } catch (err) {
        console.error('Error loading content:', err)
      }
    }
  }

  // Clear content
  const clearContent = () => {
    if (confirm('Are you sure you want to clear the editor?')) {
      setEditorContent({ html: '<p><br></p>' })
      setSavedContent('Editor cleared')
      setTimeout(() => setSavedContent(''), 3000)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quill Editor</h1>
        
        <div className="space-x-2">
          <button
            onClick={() => setIsReadOnly(!isReadOnly)}
            className={`px-4 py-2 rounded ${
              isReadOnly 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-yellow-500 hover:bg-yellow-600'
            } text-white`}
          >
            {isReadOnly ? 'Switch to Edit Mode' : 'Switch to Read Only'}
          </button>
        </div>
      </div>

      {/* Status message */}
      {savedContent && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {savedContent}
        </div>
      )}

      {/* Editor */}
      <QuillEditor
        onChange={handleEditorChange}
        initialContent={editorContent?.html || '<p>Start writing...</p>'}
        readOnly={isReadOnly}
      />

      {/* Editor toolbar */}
      <div className="mt-4 flex space-x-2">
        <button
          onClick={saveContent}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Content
        </button>
        <button
          onClick={loadContent}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Load Content
        </button>
        <button
          onClick={clearContent}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Editor
        </button>
      </div>

      {/* Content preview */}
      {editorContent && (
        <div className="mt-8 p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Content Preview:</h2>
          <div className="bg-gray-50 p-4 rounded">
            <div dangerouslySetInnerHTML={{ __html: editorContent.html }} />
          </div>
          
          <details className="mt-4">
            <summary className="cursor-pointer text-blue-600">View raw content</summary>
            <pre className="mt-2 p-4 bg-gray-900 text-gray-100 rounded overflow-auto text-sm">
              {JSON.stringify(editorContent, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}