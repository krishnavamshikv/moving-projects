import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  CheckCircle2, 
  Eye, 
  Edit3, 
  FileCode, 
  Sparkles, 
  Target, 
  PackageCheck, 
  ListChecks, 
  Flame, 
  BookOpen,
  ArrowLeft,
  Check,
  Maximize2,
  Minimize2,
  Loader2
} from 'lucide-react';
import { marked } from 'marked';

const API_BASE = 'http://localhost:3001/api';

export default function TaskEditorStudio({ task, initialFile, initialTab = 'edit', isOpen, onClose, isCompleted, onToggleComplete }) {
  const [editorContent, setEditorContent] = useState('');
  const [activeFile, setActiveFile] = useState('');
  const [editorTab, setEditorTab] = useState(initialTab || 'edit'); // 'edit' | 'preview'
  const [isFullWidthEditor, setIsFullWidthEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fileLoading, setFileLoading] = useState(true);
  const [taskSections, setTaskSections] = useState(null);

  const taskId = task?.id;

  useEffect(() => {
    if (!isOpen || !task) return;

    setEditorTab(initialTab || 'edit');
    setFileLoading(true);
    const dayStr = String(task.id || 1).padStart(2, '0');
    const path = task.pathRelative || `2026/day-${dayStr}/README.md`;

    // Fetch Task Description
    fetch(`/${path}`)
      .then(res => {
        if (res.ok) return res.text();
        throw new Error('Task readme fallback');
      })
      .then(text => {
        parseTaskMarkdown(text, task);
      })
      .catch(() => {
        setTaskSections({
          title: `${task.dayFormatted || 'Task'} – ${task.title || 'DevOps Task'}`,
          task: `<p>Today's goal is to complete the hands-on DevOps exercise for ${task.title || 'this day'}.</p>`,
          expectedOutput: `<p>Submit required solution notes or shell logs.</p>`,
          guidelines: `<p>Follow standard DevOps scripting best practices.</p>`,
          whyItMatters: `<p>Builds hands-on production engineering skills.</p>`
        });
      });

    // Determine filename to open - PREFER task.expectedFilename
    const fileToOpen = initialFile || task?.expectedFilename || `day-${dayStr}-notes.md`;
    const relativeDir = `2026/day-${dayStr}`;

    fetch(`${API_BASE}/file/open-or-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        relativeDir,
        filename: fileToOpen,
        title: `${task.dayFormatted || 'Task'} - ${task.title || 'Solution'}`
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          setActiveFile(data.relativePath || `${relativeDir}/${fileToOpen}`);
          setEditorContent(data.content || '');
        } else {
          setActiveFile(`${relativeDir}/${fileToOpen}`);
        }
        setFileLoading(false);
      })
      .catch(() => {
        setActiveFile(`${relativeDir}/${fileToOpen}`);
        setEditorContent(`# ${(task.dayFormatted || 'Day').trim()} Solution\n\n- Write your implementation notes here...\n`);
        setFileLoading(false);
      });

  }, [isOpen, taskId, initialFile]);

  const parseTaskMarkdown = (text, taskObj) => {
    if (!text || typeof text !== 'string') return;
    const lines = text.split('\n');
    let title = taskObj?.title || 'DevOps Task';
    const parsed = { task: '', expectedOutput: '', guidelines: '', resources: '', whyItMatters: '' };

    let currentSection = 'other';
    let currentBuffer = [];

    const flushBuffer = () => {
      const contentStr = currentBuffer.join('\n').trim();
      if (!contentStr) return;
      try {
        const html = marked.parse(contentStr);
        if (currentSection === 'task') parsed.task = html;
        else if (currentSection === 'expectedOutput') parsed.expectedOutput = html;
        else if (currentSection === 'guidelines') parsed.guidelines = html;
        else if (currentSection === 'resources') parsed.resources = html;
        else if (currentSection === 'whyItMatters') parsed.whyItMatters = html;
      } catch (e) {}

      currentBuffer = [];
    };

    lines.forEach((line) => {
      if (line.startsWith('# ')) title = line.replace('# ', '').trim();
      else if (line.startsWith('## Task') || line.startsWith('## Goal')) { flushBuffer(); currentSection = 'task'; }
      else if (line.startsWith('## Expected Output') || line.startsWith('## Output')) { flushBuffer(); currentSection = 'expectedOutput'; }
      else if (line.startsWith('## Guidelines') || line.startsWith('## Steps')) { flushBuffer(); currentSection = 'guidelines'; }
      else if (line.startsWith('## Resources')) { flushBuffer(); currentSection = 'resources'; }
      else if (line.startsWith('## Why This Matters')) { flushBuffer(); currentSection = 'whyItMatters'; }
      else { currentBuffer.push(line); }
    });
    flushBuffer();
    setTaskSections({ title, ...parsed });
  };

  const handleSaveFile = async (markCompleteAfterSave = false) => {
    if (!activeFile) return;
    setSaving(true);

    try {
      await fetch(`${API_BASE}/file/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relativePath: activeFile,
          content: editorContent
        })
      });

      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);

      if (markCompleteAfterSave && !isCompleted && task?.id && onToggleComplete) {
        onToggleComplete(task.id);
      }
    } catch (err) {
      setSaving(false);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all text in the editor?')) {
      setEditorContent('');
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950 text-slate-100 animate-fadeIn overflow-hidden">
      
      {/* Studio Header Toolbar */}
      <header className="px-6 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 text-xs font-semibold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <div className="h-5 w-px bg-slate-800"></div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {task.module || 'DevOps'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {activeFile || 'Loading file...'}
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-100 truncate max-w-md">
              {task.dayFormatted || 'Task'}: {task.title || ''}
            </h2>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center space-x-3">
          
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setEditorTab('edit')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                editorTab === 'edit'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={() => setEditorTab('preview')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                editorTab === 'preview'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullWidthEditor(!isFullWidthEditor)}
            className="hidden lg:flex items-center space-x-1 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition cursor-pointer"
            title={isFullWidthEditor ? 'Show Task Left Panel' : 'Expand Editor Full Width'}
          >
            {isFullWidthEditor ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Studio Body (Split View) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Task Definition (Updated to balanced text-sm sizing) */}
        {!isFullWidthEditor && (
          <div className="hidden lg:block lg:w-1/2 border-r border-slate-800 bg-slate-950/60 p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Task Definition & Requirements
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {task.dayFormatted || 'Day'}
              </span>
            </div>

            {taskSections ? (
              <>
                {taskSections.task && (
                  <div className="bg-slate-900/80 border border-cyan-500/20 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                      <Target className="w-4 h-4" />
                      <span>Today's Goal</span>
                    </div>
                    <div 
                      className="markdown-body"
                      dangerouslySetInnerHTML={{ __html: taskSections.task }}
                    />
                  </div>
                )}

                {taskSections.expectedOutput && (
                  <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                      <PackageCheck className="w-4 h-4" />
                      <span>Expected Output</span>
                    </div>
                    <div 
                      className="markdown-body"
                      dangerouslySetInnerHTML={{ __html: taskSections.expectedOutput }}
                    />
                  </div>
                )}

                {taskSections.guidelines && (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center space-x-2 text-slate-200 font-bold text-xs uppercase tracking-wider">
                      <ListChecks className="w-4 h-4 text-cyan-400" />
                      <span>Guidelines & Rules</span>
                    </div>
                    <div 
                      className="markdown-body"
                      dangerouslySetInnerHTML={{ __html: taskSections.guidelines }}
                    />
                  </div>
                )}

                {taskSections.whyItMatters && (
                  <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                      <Flame className="w-4 h-4" />
                      <span>Why This Matters for DevOps</span>
                    </div>
                    <div 
                      className="markdown-body"
                      dangerouslySetInnerHTML={{ __html: taskSections.whyItMatters }}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Loading task instructions...</span>
              </div>
            )}
          </div>
        )}

        {/* RIGHT PANEL: Text Editor / Rich Markdown Preview */}
        <div className={`flex-1 flex flex-col bg-slate-900/40 ${isFullWidthEditor ? 'w-full' : 'w-full lg:w-1/2'}`}>
          
          {/* Sub-header Bar */}
          <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-200 font-bold">{activeFile || 'Loading...'}</span>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              {fileLoading ? 'Initializing...' : editorTab === 'preview' ? 'Previewing Rendered Output' : `${editorContent.split('\n').length} lines | ${editorContent.length} chars`}
            </div>
          </div>

          {/* Right Pane Body */}
          <div className="flex-1 relative overflow-hidden bg-slate-950">
            {fileLoading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 text-slate-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                <span>Opening solution workspace on disk...</span>
              </div>
            ) : editorTab === 'preview' ? (
              <div className="h-full p-6 sm:p-8 overflow-y-auto markdown-body">
                <div dangerouslySetInnerHTML={{ __html: marked.parse(editorContent || '*No content written yet. Switch to Edit tab to write notes...*') }} />
              </div>
            ) : (
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                placeholder="# Write your solution and notes in Markdown here..."
                className="w-full h-full p-6 bg-slate-950 text-slate-200 font-mono text-sm leading-relaxed border-0 focus:outline-none resize-none selection:bg-cyan-500 selection:text-slate-950"
                spellCheck="false"
              />
            )}
          </div>

          {/* BOTTOM TOOLBAR: Action Buttons */}
          <footer className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClearAll}
              disabled={fileLoading}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              title="Clear all text in editor"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleSaveFile(false)}
                disabled={saving || fileLoading}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 cursor-pointer disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Saved to Disk!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-cyan-400" />
                    <span>{saving ? 'Saving...' : 'Save File'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSaveFile(true)}
                disabled={saving || fileLoading}
                className="flex items-center space-x-2 px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Save & Complete Task</span>
              </button>
            </div>
          </footer>

        </div>

      </div>

    </div>
  );
}
