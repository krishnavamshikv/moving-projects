import React, { useEffect, useState } from 'react';
import { 
  X, 
  Target, 
  PackageCheck, 
  ListChecks, 
  Flame, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  FileEdit,
  Sparkles,
  FileText
} from 'lucide-react';
import { marked } from 'marked';

export default function TaskModal({ task, isOpen, onClose, isCompleted, onToggleComplete, onOpenStudio }) {
  const [sections, setSections] = useState(null);
  const [rawHtml, setRawHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedMdFile, setExtractedMdFile] = useState('');

  useEffect(() => {
    if (!isOpen || !task) return;

    setLoading(true);
    const dayStr = String(task.id || 1).padStart(2, '0');
    const defaultFilename = task.expectedFilename || `day-${dayStr}-notes.md`;
    setExtractedMdFile(defaultFilename);

    const path = task.pathRelative || `2026/day-${dayStr}/README.md`;

    fetch(`/${path}`)
      .then((res) => {
        if (res.ok) return res.text();
        throw new Error('File not found');
      })
      .then((text) => {
        parseMarkdownContent(text, task);
        setLoading(false);
      })
      .catch(() => {
        const fallbackText = `
# ${task.dayFormatted || 'Day'} – ${task.title || 'DevOps Task'}

## Task
Today's goal is to **master ${task.title || 'DevOps principles'}** within the **${task.module || 'Core'}** module.

## Expected Output
By the end of today, submit a markdown file detailing your step-by-step commands:
\`${defaultFilename}\`

## Guidelines
- Write clean execution logs or scripts.
- Test your configurations before committing to GitHub.
        `;
        parseMarkdownContent(fallbackText, task);
        setLoading(false);
      });
  }, [isOpen, task]);

  const parseMarkdownContent = (text, taskObj) => {
    if (!text) return;
    const lines = text.split('\n');
    let title = taskObj?.title || 'DevOps Task';
    const parsedSections = { task: '', expectedOutput: '', guidelines: '', resources: '', whyItMatters: '', other: [] };

    const mdMatch = text.match(/`([a-zA-Z0-9_-]+\.md)`/);
    if (taskObj?.expectedFilename) {
      setExtractedMdFile(taskObj.expectedFilename);
    } else if (mdMatch && mdMatch[1]) {
      setExtractedMdFile(mdMatch[1]);
    }

    let currentSection = 'other';
    let currentBuffer = [];

    const flushBuffer = () => {
      const contentStr = currentBuffer.join('\n').trim();
      if (!contentStr) return;
      
      try {
        const html = marked.parse(contentStr);
        if (currentSection === 'task') parsedSections.task = html;
        else if (currentSection === 'expectedOutput') parsedSections.expectedOutput = html;
        else if (currentSection === 'guidelines') parsedSections.guidelines = html;
        else if (currentSection === 'resources') parsedSections.resources = html;
        else if (currentSection === 'whyItMatters') parsedSections.whyItMatters = html;
        else parsedSections.other.push(html);
      } catch (e) {}

      currentBuffer = [];
    };

    lines.forEach((line) => {
      if (line.startsWith('# ')) {
        title = line.replace('# ', '').trim();
      } else if (line.startsWith('## Task') || line.startsWith('## Goal')) {
        flushBuffer(); currentSection = 'task';
      } else if (line.startsWith('## Expected Output') || line.startsWith('## Output')) {
        flushBuffer(); currentSection = 'expectedOutput';
      } else if (line.startsWith('## Guidelines') || line.startsWith('## Steps')) {
        flushBuffer(); currentSection = 'guidelines';
      } else if (line.startsWith('## Resources')) {
        flushBuffer(); currentSection = 'resources';
      } else if (line.startsWith('## Why This Matters')) {
        flushBuffer(); currentSection = 'whyItMatters';
      } else if (line.startsWith('## ')) {
        flushBuffer(); currentSection = 'other'; currentBuffer.push(line);
      } else {
        currentBuffer.push(line);
      }
    });

    flushBuffer();
    setSections({ title, ...parsedSections });
    setRawHtml(marked.parse(text));
  };

  if (!isOpen || !task) return null;

  const handleLaunchStudio = (filename, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (onOpenStudio) {
      onOpenStudio(task, filename || task?.expectedFilename || extractedMdFile, e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-lg animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {task.module || 'DevOps'}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Accelerated Day {task.acceleratedDay || 1} of 30
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
                {sections?.title || `${task.dayFormatted || 'Day'} – ${task.title || 'Task'}`}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-slate-300">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-400">Formatting task definition...</p>
            </div>
          ) : sections ? (
            <>
              {/* Section 1: Task Goal */}
              {sections.task && (
                <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-2xl p-5 space-y-3 shadow-lg shadow-cyan-500/5">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm uppercase tracking-wider">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <span>Today's Goal & Overview</span>
                  </div>
                  <div 
                    className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed prose-strong:text-cyan-300"
                    dangerouslySetInnerHTML={{ __html: sections.task }} 
                  />
                </div>
              )}

              {/* Section 2: Expected Output / Deliverable (With Create/Edit Button) */}
              {sections.expectedOutput && (
                <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 space-y-4 shadow-lg shadow-emerald-500/5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
                      <PackageCheck className="w-4 h-4 text-emerald-400" />
                      <span>Expected Output & Deliverable</span>
                    </div>

                    <button
                      onClick={(e) => handleLaunchStudio(task.expectedFilename || extractedMdFile, e)}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Create / Edit {task.expectedFilename || extractedMdFile}</span>
                    </button>
                  </div>

                  <div 
                    className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed prose-code:bg-emerald-950/80 prose-code:text-emerald-300 prose-code:px-2 prose-code:py-0.5 prose-code:rounded-md prose-code:border prose-code:border-emerald-500/30"
                    dangerouslySetInnerHTML={{ __html: sections.expectedOutput }} 
                  />
                </div>
              )}

              {/* Section 3: Guidelines & Hands-on Steps */}
              {sections.guidelines && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
                  <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm uppercase tracking-wider">
                    <ListChecks className="w-4 h-4 text-cyan-400" />
                    <span>Guidelines & Practical Rules</span>
                  </div>
                  <div 
                    className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed prose-li:marker:text-cyan-400 prose-strong:text-slate-100"
                    dangerouslySetInnerHTML={{ __html: sections.guidelines }} 
                  />
                </div>
              )}

              {/* Section 4: Why This Matters for DevOps */}
              {sections.whyItMatters && (
                <div className="bg-gradient-to-br from-amber-950/30 via-slate-900 to-purple-950/30 border border-amber-500/30 rounded-2xl p-5 space-y-3 shadow-lg">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Why This Matters for DevOps & Production</span>
                  </div>
                  <div 
                    className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed prose-strong:text-amber-300"
                    dangerouslySetInnerHTML={{ __html: sections.whyItMatters }} 
                  />
                </div>
              )}

              {/* Section 5: Resources & Reference Links */}
              {sections.resources && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
                  <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Resources & Documentation</span>
                  </div>
                  <div 
                    className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: sections.resources }} 
                  />
                </div>
              )}
            </>
          ) : (
            <div 
              className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: rawHtml }} 
            />
          )}
        </div>

        {/* Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => onToggleComplete(task.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                  : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{isCompleted ? 'Marked Completed ✓' : 'Mark Completed'}</span>
            </button>

            <button
              onClick={(e) => handleLaunchStudio(task.expectedFilename || extractedMdFile, e)}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm hover:from-cyan-400 hover:to-blue-500 transition shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <FileEdit className="w-5 h-5 text-slate-950" />
              <span>Open Editor Studio</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Path: <strong className="text-slate-300 font-mono">{task.pathRelative}</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
}
