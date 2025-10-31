import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// --- Thanh công cụ (MenuBar) với Tailwind ---
const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    // Hàm helper để tạo class cho button
    const getButtonClass = (type, options = {}) => {
        const isActive = editor.isActive(type, options)
            ? 'bg-blue-500 text-white' // Class khi active
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'; // Class khi không active
        return `px-3 py-1 text-sm font-medium rounded ${isActive}`;
    };

    return (
        <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-t-md bg-white">
            <button
                type="button" // Thêm type="button" để tránh submit form
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={getButtonClass('bold')}
            >
                Bold
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={getButtonClass('italic')}
            >
                Italic
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={getButtonClass('heading', { level: 1 })}
            >
                H1
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={getButtonClass('heading', { level: 2 })}
            >
                H2
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={getButtonClass('bulletList')}
            >
                List
            </button>
        </div>
    );
};

// --- Trình soạn thảo (TiptapEditor) ---
const TiptapEditor = ({ content, onChange }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Tùy chỉnh các extension nếu cần
                heading: {
                    levels: [1, 2, 3],
                },
            }),
        ],
        // 1. Nội dung ban đầu truyền từ cha
        content: content,

        // 2. Tự động cập nhật nội dung cho cha
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML()); // Gửi HTML về cho cha
        },

        // 3. Thêm class của Tailwind cho bản thân editor (chỉ class bên ngoài)
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert prose-sm sm:prose-base max-w-none focus:outline-none',
            },
        },
    });

    return (
        <div className="border border-gray-300 rounded-b-md">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="p-4 min-h-[200px]" />
        </div>
    );
};

export default TiptapEditor;