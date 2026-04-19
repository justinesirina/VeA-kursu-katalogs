import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered } from 'lucide-react';

/**
 * RichTextEditor — koplietojams Tiptap teksta redaktors ar Bold/Italic/Underline/List toolbar.
 *
 * Props:
 *   initialValue  {string}    — sākotnējais HTML saturs (uncontrolled)
 *   onChange      {function}  — izsaukts ar HTML string katru reizi, kad saturs mainās
 *   placeholder   {string}    — (neizmantots Tiptap, bet paredzēts nākotnes paplašinājumam)
 *   minHeight     {string}    — CSS min-height vērtība redaktora laukam (noklusēts: "52px")
 *   maxHeight     {string}    — CSS max-height resize ierobežojumam (noklusēts: "400px")
 */
function RichTextEditor({ initialValue, onChange, minHeight = '52px', maxHeight = '400px' }) {
    const editor = useEditor({
        extensions: [StarterKit, Underline],
        content: initialValue || '',
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    if (!editor) return null;

    const toolbarGroups = [
        [
            { name: 'bold',      cmd: 'toggleBold',      Icon: Bold,          title: 'Treknraksts (Ctrl+B)'  },
            { name: 'italic',    cmd: 'toggleItalic',    Icon: Italic,        title: 'Slīpraksts (Ctrl+I)'   },
            { name: 'underline', cmd: 'toggleUnderline', Icon: UnderlineIcon, title: 'Pasvītrojums (Ctrl+U)' },
        ],
        [
            { name: 'bulletList',  cmd: 'toggleBulletList',  Icon: List,        title: 'Nesakārtots saraksts' },
            { name: 'orderedList', cmd: 'toggleOrderedList', Icon: ListOrdered, title: 'Numurēts saraksts'    },
        ],
    ];

    return (
        <div className="border rounded border-gray-300 focus-within:border-vea-green text-sm">
            {/* Toolbar */}
            <div className="flex items-center gap-1 border-b border-gray-200 px-2 py-1 bg-gray-50 rounded-t">
                {toolbarGroups.map((group, gi) => (
                    <div key={gi} className="flex items-center gap-0.5">
                        {gi > 0 && <span className="w-px h-4 bg-gray-300 mx-1" />}
                        {group.map(({ name, cmd, Icon, title }) => (
                            <button
                                key={name}
                                type="button"
                                title={title}
                                aria-label={title}
                                onMouseDown={e => { e.preventDefault(); editor.chain().focus()[cmd]().run(); }}
                                className={`p-1 rounded transition-colors ${
                                    editor.isActive(name)
                                        ? 'bg-vea-green-light text-vea-green'
                                        : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                                }`}
                            >
                                <Icon size={13} />
                            </button>
                        ))}
                    </div>
                ))}
            </div>
            {/* Resizable editor area */}
            <div className="resize-y overflow-auto" style={{ minHeight, maxHeight }}>
                <EditorContent
                    editor={editor}
                    className="px-2 py-1.5 text-sm text-vea-text [&_.ProseMirror:focus]:outline-none"
                />
            </div>
        </div>
    );
}

export default RichTextEditor;
