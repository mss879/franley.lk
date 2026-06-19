"use client";

import React, { useRef, useEffect, useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write description here...",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Keep track of the internal value to avoid cursor jump
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const executeCommand = (command: string, arg: string = "") => {
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div
      className={`w-full rounded-2xl bg-white border transition-all duration-300 flex flex-col overflow-hidden ${
        isFocused
          ? "border-[#7b0323]/80 shadow-[0_0_15px_rgba(123,3,35,0.05)]"
          : "border-slate-250"
      }`}
    >
      {/* Format Controls Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-1 items-center z-10">
        {[
          { icon: "B", command: "bold", title: "Bold" },
          { icon: "I", command: "italic", title: "Italic" },
          { icon: "U", command: "underline", title: "Underline" },
          { icon: "S", command: "strikeThrough", title: "Strikethrough" },
        ].map((btn) => (
          <button
            key={btn.command}
            type="button"
            onClick={() => executeCommand(btn.command)}
            className="w-7 h-7 flex items-center justify-center font-bold text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-all cursor-pointer border-0"
            title={btn.title}
          >
            <span className={btn.command === "italic" ? "italic" : btn.command === "underline" ? "underline" : btn.command === "strikeThrough" ? "line-through" : ""}>
              {btn.icon}
            </span>
          </button>
        ))}

        <div className="w-[1px] h-4 bg-slate-200 mx-1" />

        {[
          { icon: "H1", command: "formatBlock", arg: "<h1>", title: "Heading 1" },
          { icon: "H2", command: "formatBlock", arg: "<h2>", title: "Heading 2" },
          { icon: "P", command: "formatBlock", arg: "<p>", title: "Paragraph" },
        ].map((btn) => (
          <button
            key={btn.title}
            type="button"
            onClick={() => executeCommand(btn.command, btn.arg)}
            className="w-8 h-7 flex items-center justify-center font-extrabold text-[10px] text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-all cursor-pointer border-0"
            title={btn.title}
          >
            {btn.icon}
          </button>
        ))}

        <div className="w-[1px] h-4 bg-slate-200 mx-1" />

        {[
          {
            icon: (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ),
            command: "insertUnorderedList",
            title: "Bullet List",
          },
          {
            icon: (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            ),
            command: "insertOrderedList",
            title: "Numbered List",
          },
        ].map((btn, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => executeCommand(btn.command)}
            className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-all cursor-pointer border-0"
            title={btn.title}
          >
            {btn.icon}
          </button>
        ))}

        <div className="w-[1px] h-4 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand("removeFormat")}
          className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer border-0"
          title="Clear Formatting"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Editor editable container */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="flex-grow min-h-[160px] max-h-[300px] overflow-y-auto p-4 text-sm text-slate-800 outline-none leading-relaxed prose prose-slate max-w-none focus:outline-none"
        style={{
          caretColor: "#7b0323",
        }}
        data-placeholder={placeholder}
      />

      {/* Tailwind Prose override inline styles for contenteditable */}
      <style jsx global>{`
        div[contenteditable]:empty::before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
          display: block; /* For Firefox */
        }
        div[contenteditable] h1 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          color: #0f172a;
        }
        div[contenteditable] h2 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          color: #0f172a;
        }
        div[contenteditable] ul {
          list-style-type: disc;
          padding-left: 1.25rem;
          margin-bottom: 0.5rem;
        }
        div[contenteditable] ol {
          list-style-type: decimal;
          padding-left: 1.25rem;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}
