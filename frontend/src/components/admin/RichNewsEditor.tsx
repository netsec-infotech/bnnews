'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Table,
  Image as ImageIcon,
  Video as VideoIcon,
  Code,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  X,
  Upload,
  Link as LinkIcon,
  Check,
  Eye,
  Edit,
  FolderOpen,
} from 'lucide-react';
import api from '../../lib/api';
import { getMediaUrl } from '../../lib/media';

interface RichNewsEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function RichNewsEditor({
  value,
  onChange,
  placeholder = 'અહીં સમાચારની સંપૂર્ણ વિગતવાર માહિતી લખો... (પેરાગ્રાફ વચ્ચે છબી અથવા વિડિયો ઉમેરી શકો છો)',
}: RichNewsEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // Modals state
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Image form
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Video form
  const [videoUrl, setVideoUrl] = useState('');
  const [videoCaption, setVideoCaption] = useState('');

  // Synchronize incoming value with contentEditable innerHTML
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      saveSelection();
      onChange(editorRef.current.innerHTML);
    }
  };

  // Remember exact cursor position so modals can drop content exactly between paragraphs
  const saveSelection = () => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current && editorRef.current.contains(sel.anchorNode)) {
      try {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      } catch {
        // ignore
      }
    }
  };

  const openImageModal = () => {
    saveSelection();
    setImageUrl('');
    setImageCaption('');
    setImageAlt('');
    setShowImageModal(true);
  };

  const openVideoModal = () => {
    saveSelection();
    setVideoUrl('');
    setVideoCaption('');
    setShowVideoModal(true);
  };

  // Execute standard formatting commands
  const execCmd = (cmd: string, val: string | undefined = undefined) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    handleInput();
  };

  // Universal DOM node insertion at saved cursor or clean paragraph append
  const insertNodeAtSelection = (nodeHtml: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    if (savedRangeRef.current) {
      try {
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(savedRangeRef.current);
          const range = sel.getRangeAt(0);
          range.deleteContents();

          // Create temporary container
          const temp = document.createElement('div');
          temp.innerHTML = nodeHtml;

          const frag = document.createDocumentFragment();
          let node;
          let lastNode;
          while ((node = temp.firstChild)) {
            lastNode = frag.appendChild(node);
          }
          range.insertNode(frag);

          if (lastNode) {
            range.setStartAfter(lastNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }

          onChange(editorRef.current.innerHTML);
          savedRangeRef.current = range.cloneRange();
          return;
        }
      } catch (e) {
        console.warn('Range insertion error, falling back to append', e);
      }
    }

    // Fallback: append cleanly to editor HTML
    const current = (editorRef.current.innerHTML || '').trim();
    editorRef.current.innerHTML = current
      ? `${current}<p><br/></p>${nodeHtml}<p><br/></p>`
      : `${nodeHtml}<p><br/></p>`;
    onChange(editorRef.current.innerHTML);
  };

  // Insert Inline Image between paragraphs
  const insertInlineImage = () => {
    if (!imageUrl.trim()) return;

    const resolvedUrl = getMediaUrl(imageUrl);
    const html = `
      <figure class="my-5 block text-center" contenteditable="false">
        <img src="${resolvedUrl}" alt="${imageAlt || imageCaption || 'News Image'}" class="w-full max-h-[480px] object-cover rounded-xl shadow-xs mx-auto border border-gray-200" />
        ${
          imageCaption
            ? `<figcaption class="text-xs text-gray-500 mt-2 font-medium italic text-center">${imageCaption}</figcaption>`
            : ''
        }
      </figure>
      <p><br/></p>
    `;

    insertNodeAtSelection(html);
    setImageUrl('');
    setImageAlt('');
    setImageCaption('');
    setShowImageModal(false);
  };

  // Upload image from PC directly inside editor
  const handleUploadInlineImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'news-inline');

    setUploadingImage(true);
    try {
      const res = await api.post('/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data.data?.url) {
        setImageUrl(res.data.data.url);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'ઇમેજ અપલોડ નિષ્ફળ');
    } finally {
      setUploadingImage(false);
    }
  };

  // Insert Inline Video between paragraphs
  const insertInlineVideo = () => {
    if (!videoUrl.trim()) return;

    let embedSrc = videoUrl;
    if (videoUrl.includes('youtube.com/watch')) {
      const vidId = videoUrl.split('v=')[1]?.split('&')[0];
      embedSrc = `https://www.youtube.com/embed/${vidId}`;
    } else if (videoUrl.includes('youtu.be/')) {
      const vidId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
      embedSrc = `https://www.youtube.com/embed/${vidId}`;
    } else if (videoUrl.includes('youtube.com/shorts/')) {
      const vidId = videoUrl.split('/shorts/')[1]?.split('?')[0];
      embedSrc = `https://www.youtube.com/embed/${vidId}`;
    }

    const isDirectMp4 = videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm');

    const html = isDirectMp4
      ? `
        <figure class="my-5 block" contenteditable="false">
          <div class="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-xs">
            <video src="${videoUrl}" controls class="w-full h-full"></video>
          </div>
          ${videoCaption ? `<figcaption class="text-xs text-gray-500 mt-2 font-medium italic text-center">${videoCaption}</figcaption>` : ''}
        </figure>
        <p><br/></p>
      `
      : `
        <figure class="my-5 block" contenteditable="false">
          <div class="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-xs">
            <iframe src="${embedSrc}" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
          ${videoCaption ? `<figcaption class="text-xs text-gray-500 mt-2 font-medium italic text-center">${videoCaption}</figcaption>` : ''}
        </figure>
        <p><br/></p>
      `;

    insertNodeAtSelection(html);
    setVideoUrl('');
    setVideoCaption('');
    setShowVideoModal(false);
  };

  // Insert Simple Table
  const insertTable = () => {
    const html = `
      <table class="w-full border-collapse border border-gray-300 my-4 text-xs" contenteditable="true">
        <thead>
          <tr class="bg-gray-100 font-bold">
            <th class="border border-gray-300 p-2">મુદ્દો / વિગત</th>
            <th class="border border-gray-300 p-2">માહિતી</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 p-2">વિગત ૧</td>
            <td class="border border-gray-300 p-2">માહિતી ૧</td>
          </tr>
          <tr>
            <td class="border border-gray-300 p-2">વિગત ૨</td>
            <td class="border border-gray-300 p-2">માહિતી ૨</td>
          </tr>
        </tbody>
      </table>
      <p><br/></p>
    `;
    insertNodeAtSelection(html);
  };

  const plainText = (value || '').replace(/<[^>]+>/g, '').trim();
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  const charCount = plainText.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 120));

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 transition-all font-gujarati ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : 'relative shadow-xs'
      }`}
    >
      {/* Editor Toolbar matching Reference Screenshot */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 border-b border-gray-200 bg-gray-50/70 rounded-t-xl text-gray-700">
        <div className="flex flex-wrap items-center gap-0.5">
          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => execCmd('undo')}
            className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
            title="અનડુ (Undo)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('redo')}
            className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
            title="રીડુ (Redo)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-gray-300 mx-1" />

          {/* Formatting */}
          <button
            type="button"
            onClick={() => execCmd('bold')}
            className="p-1.5 hover:bg-gray-200 rounded font-bold text-gray-800"
            title="ઘાટા અક્ષરો (Bold)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('italic')}
            className="p-1.5 hover:bg-gray-200 rounded italic text-gray-800"
            title="ત્રાંસા અક્ષરો (Italic)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('underline')}
            className="p-1.5 hover:bg-gray-200 rounded underline text-gray-800"
            title="નીચે લીટી (Underline)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-gray-300 mx-1" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => execCmd('formatBlock', '<h2>')}
            className="px-2 py-1 hover:bg-gray-200 rounded font-bold text-xs"
            title="મુખ્ય ઉપશીર્ષક (H2)"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => execCmd('formatBlock', '<h3>')}
            className="px-2 py-1 hover:bg-gray-200 rounded font-semibold text-xs"
            title="નાનું શીર્ષક (H3)"
          >
            H3
          </button>

          <span className="w-px h-4 bg-gray-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => execCmd('insertUnorderedList')}
            className="p-1.5 hover:bg-gray-200 rounded"
            title="બુલેટ લિસ્ટ"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('insertOrderedList')}
            className="p-1.5 hover:bg-gray-200 rounded"
            title="ક્રમાંકિત લિસ્ટ"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-gray-300 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => execCmd('justifyLeft')}
            className="p-1.5 hover:bg-gray-200 rounded"
            title="ડાબે"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyCenter')}
            className="p-1.5 hover:bg-gray-200 rounded"
            title="મધ્યમાં"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyRight')}
            className="p-1.5 hover:bg-gray-200 rounded"
            title="જમણે"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-gray-300 mx-1" />

          {/* Quote */}
          <button
            type="button"
            onClick={() => execCmd('formatBlock', '<blockquote>')}
            className="p-1.5 hover:bg-gray-200 rounded text-gray-700"
            title="ક્વોટ (Quote)"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          {/* Table */}
          <button
            type="button"
            onClick={insertTable}
            className="p-1.5 hover:bg-gray-200 rounded text-gray-700"
            title="કોષ્ટક ઉમેરો (Insert Table)"
          >
            <Table className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-gray-300 mx-1" />

          {/* INLINE IMAGE INSERTION BUTTON (CRITICAL REQUIREMENT) */}
          <button
            type="button"
            onClick={openImageModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-primary border border-primary/20 hover:bg-blue-100 rounded text-xs font-bold transition-colors shadow-2xs"
            title="પેરાગ્રાફ વચ્ચે છબી ઉમેરો (Insert Inline Image)"
          >
            <ImageIcon className="w-3.5 h-3.5 text-primary" />
            <span>ઇમેજ ઉમેરો</span>
          </button>

          {/* INLINE VIDEO INSERTION BUTTON (CRITICAL REQUIREMENT) */}
          <button
            type="button"
            onClick={openVideoModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-[#ED1C2E] border border-red-200 hover:bg-red-100 rounded text-xs font-bold transition-colors shadow-2xs"
            title="પેરાગ્રાફ વચ્ચે વિડિયો ઉમેરો (Insert Inline Video / YouTube)"
          >
            <VideoIcon className="w-3.5 h-3.5 text-[#ED1C2E]" />
            <span>વિડિયો ઉમેરો</span>
          </button>
        </div>

        {/* View mode toggle & Fullscreen */}
        <div className="flex items-center gap-1">
          <div className="flex items-center bg-gray-200/80 p-0.5 rounded-lg text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-2 py-0.5 rounded ${activeTab === 'edit' ? 'bg-white shadow-xs text-primary' : 'text-gray-600'}`}
            >
              સંપાદન
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-2 py-0.5 rounded ${activeTab === 'preview' ? 'bg-white shadow-xs text-primary' : 'text-gray-600'}`}
            >
              પ્રિવ્યૂ
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
            title={isFullscreen ? 'નાનું કરો' : 'મોટું કરો (Fullscreen)'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className={`p-4 ${isFullscreen ? 'flex-1 overflow-y-auto' : 'min-h-[260px]'}`}>
        {activeTab === 'edit' ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={saveSelection}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            className="outline-none min-h-[240px] text-xs sm:text-sm leading-relaxed text-gray-800 space-y-3 [&>p]:mb-3 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:my-3 [&>h3]:text-base [&>h3]:font-bold [&>h3]:my-2 [&>blockquote]:border-l-4 [&>blockquote]:border-[#ED1C2E] [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:my-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>figure]:my-4 [&_img]:rounded-xl [&_img]:max-h-[420px] [&_img]:mx-auto [&_iframe]:rounded-xl [&_iframe]:w-full [&_iframe]:aspect-video [&_video]:rounded-xl [&_video]:w-full"
            data-placeholder={placeholder}
          />
        ) : (
          <div
            className="prose max-w-none text-xs sm:text-sm leading-relaxed text-gray-800 [&>figure]:my-4 [&_img]:rounded-xl [&_img]:w-full [&_iframe]:w-full [&_iframe]:rounded-xl [&_iframe]:aspect-video"
            dangerouslySetInnerHTML={{ __html: value || '<p className="text-gray-400">કોઈ સામગ્રી નથી</p>' }}
          />
        )}
      </div>

      {/* Footer Status Bar: Character Count, Word Count, Reading Time */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50/50 text-[11px] text-gray-400 font-medium rounded-b-xl">
        <div className="flex items-center gap-3">
          <span>પાત્રો: {charCount}</span>
          <span>શબ્દો: {wordCount}</span>
        </div>
        <span>વાંચન સમય: ~{readingTime} મિનિટ</span>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* MODAL 1: INSERT INLINE IMAGE MODAL                          */}
      {/* ----------------------------------------------------------- */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                <span>પેરાગ્રાફ વચ્ચે છબી ઉમેરો (Insert Inline Image)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Option A: Upload from computer */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  કોમ્પ્યુટર માંથી છબી પસંદ કરો:
                </label>
                <label className="cursor-pointer flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary bg-gray-50 text-gray-600 transition-colors">
                  <Upload className="w-4 h-4 text-primary" />
                  <span>{uploadingImage ? 'અપલોડ થઈ રહ્યું છે...' : 'ઇમેજ ફાઇલ પસંદ કરો (JPG, PNG, WebP)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadInlineImage}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Option B: Image URL */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">અથવા ઇમેજ URL દાખલ કરો:</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg અથવા /uploads/..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs font-mono"
                />
              </div>

              {/* Preview if image URL exists */}
              {imageUrl && (
                <div className="aspect-video max-h-36 rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center p-1">
                  <img
                    src={getMediaUrl(imageUrl)}
                    alt="Preview"
                    onError={(e) => {
                      (e.target as any).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80';
                    }}
                    className="max-h-36 w-full object-contain"
                  />
                </div>
              )}

              {/* Alt text & Caption */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">ઇમેજ કેપ્શન (Caption - નીચે દર્શાવાશે):</label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="દા.ત. ગાંધીનગર ખાતે યોજાયેલ ઉચ્ચસ્તરીય બેઠક..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg font-bold"
                >
                  રદ કરો
                </button>
                <button
                  type="button"
                  onClick={insertInlineImage}
                  disabled={!imageUrl.trim()}
                  className="px-4 py-1.5 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover disabled:opacity-50"
                >
                  છબી ઉમેરો (Insert)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* MODAL 2: INSERT INLINE VIDEO MODAL                          */}
      {/* ----------------------------------------------------------- */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <VideoIcon className="w-4 h-4 text-[#ED1C2E]" />
                <span>પેરાગ્રાફ વચ્ચે વિડિયો ઉમેરો (Insert Inline Video)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  વિડિયો URL (YouTube, Shorts અથવા Direct MP4):
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">વિડિયો કેપ્શન (Caption):</label>
                <input
                  type="text"
                  value={videoCaption}
                  onChange={(e) => setVideoCaption(e.target.value)}
                  placeholder="દા.ત. ખાસ ઇન્ટરવ્યુ અને ગ્રાઉન્ડ રિપોર્ટ..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg font-bold"
                >
                  રદ કરો
                </button>
                <button
                  type="button"
                  onClick={insertInlineVideo}
                  disabled={!videoUrl.trim()}
                  className="px-4 py-1.5 bg-[#ED1C2E] text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  વિડિયો ઉમેરો (Insert)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
