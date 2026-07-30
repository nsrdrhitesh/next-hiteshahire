"use client";

import { useMemo, useRef, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function QuillEditor({
  value = "<p></p>",
  onChange,
  placeholder = "Start writing...",
  readOnly = false,
  ...props
}) {
  const quillRef = useRef(null);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }], // 'bullet' is a value, not a format name
        ["link", "image", "video"],
        ["clean"],
      ],
    }),
    []
  );

  // Correct formats: 'list' covers both ordered and bullet
  const formats = [
    "header", "bold", "italic", "underline", "strike", "blockquote",
    "list", "bullet", "link", "image", "video",
  ];

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg min-h-[300px] bg-white dark:bg-gray-800">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        className="h-full ql-editor"
        {...props}
      />
    </div>
  );
}