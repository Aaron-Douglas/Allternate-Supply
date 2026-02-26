'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import { Button } from '@/components/atoms/Button';
import { Label } from '@/components/atoms/Label';
import { cn } from '@/lib/utils';

type PolicyEditorProps = {
  initialContent: string;
  effectiveDate: string;
  onSave: (content: string, effectiveDate: string) => Promise<void>;
  isLoading?: boolean;
};

export function PolicyEditor({ initialContent, effectiveDate: initialDate, onSave, isLoading }: PolicyEditorProps) {
  const [date, setDate] = useState(initialDate);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      LinkExtension.configure({ openOnClick: false }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none',
      },
    },
  });

  const handleSave = async () => {
    if (!editor) return;
    await onSave(editor.getHTML(), date);
  };

  if (!editor) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border border-gray-200 rounded-t-lg p-2 bg-gray-50">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>B</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>I</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>H2</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>H3</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>UL</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>OL</ToolbarButton>
      </div>
      <div className="border border-t-0 border-gray-200 rounded-b-lg">
        <EditorContent editor={editor} />
      </div>
      <div>
        <Label htmlFor="effective_date">Effective Date</Label>
        <input type="date" id="effective_date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px]" />
      </div>
      <Button onClick={handleSave} isLoading={isLoading}>Save Policy</Button>
    </div>
  );
}

function ToolbarButton({ onClick, active, children }: { onClick: () => void; active: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-2.5 py-1.5 rounded text-sm font-medium transition-colors',
        active ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
      )}
    >
      {children}
    </button>
  );
}
