"use client";

import { useEffect } from "react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    AlignCenter,
    AlignLeft,
    AlignRight,
    AlignJustify,
    Heading1,
    Heading2,
    Heading3
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);

        if (url === null) {
            return;
        }

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-white/20 bg-white/30 backdrop-blur-sm rounded-t-xl">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn("h-8 w-8 rounded-lg", editor.isActive("bold") && "bg-[#0A1F1C] text-[#44C3B2]")}
                type="button"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn("h-8 w-8 rounded-lg", editor.isActive("italic") && "bg-[#0A1F1C] text-[#44C3B2]")}
                type="button"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={cn("h-8 w-8 rounded-lg", editor.isActive("underline") && "bg-[#0A1F1C] text-[#44C3B2]")}
                type="button"
            >
                <UnderlineIcon className="h-4 w-4" />
            </Button>

            <div className="w-[1px] h-4 bg-white/20 mx-1 self-center" />

            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn("h-8 w-8 rounded-lg", editor.isActive("heading", { level: 1 }) && "bg-[#0A1F1C] text-[#44C3B2]")}
                type="button"
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn("h-8 w-8 rounded-lg", editor.isActive("heading", { level: 2 }) && "bg-[#0A1F1C] text-[#44C3B2]")}
                type="button"
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={cn("h-8 w-8 rounded-lg", editor.isActive("heading", { level: 3 }) && "bg-[#0A1F1C] text-[#44C3B2]")}
                type="button"
            >
                <Heading3 className="h-4 w-4" />
            </Button>

            <div className="w-[1px] h-4 bg-white/20 mx-1 self-center" />

            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                className={cn("h-8 w-8 rounded-lg", editor.isActive({ textAlign: "left" }) && "bg-[#0A1F1C] text-[#44C3B2]")}
                type="button"
            >
                <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                className={cn("h-8 w-8 rounded-lg", editor.isActive({ textAlign: "center" }) && "bg-[#0A1F1C] text-[#44C3B2]")}
                type="button"
            >
                <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                className={cn("h-8 w-8 rounded-lg", editor.isActive({ textAlign: "right" }) && "bg-[#0A1F1C] text-[#44C3B2]")}
                type="button"
            >
                <AlignRight className="h-4 w-4" />
            </Button>

            <div className="w-[1px] h-4 bg-white/20 mx-1 self-center" />

            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn("h-8 w-8 rounded-lg", editor.isActive("bulletList") && "bg-[#0A1F1C] text-[#44C3B2]")}
                type="button"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn("h-8 w-8 rounded-lg", editor.isActive("orderedList") && "bg-[#0A1F1C] text-[#44C3B2]")}
                type="button"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn("h-8 w-8 rounded-lg", editor.isActive("blockquote") && "bg-[#0A1F1C] text-[#44C3B2]")}
                type="button"
            >
                <Quote className="h-4 w-4" />
            </Button>

            <div className="w-[1px] h-4 bg-white/20 mx-1 self-center" />

            <Button
                variant="ghost"
                size="icon"
                onClick={setLink}
                className={cn("h-8 w-8 rounded-lg", editor.isActive("link") && "bg-[#0A1F1C] text-[#44C3B2]")}
                type="button"
            >
                <LinkIcon className="h-4 w-4" />
            </Button>

            <div className="flex-1" />

            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().undo().run()}
                className="h-8 w-8 rounded-lg"
                type="button"
            >
                <Undo className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().redo().run()}
                className="h-8 w-8 rounded-lg"
                type="button"
            >
                <Redo className="h-4 w-4" />
            </Button>
        </div>
    );
};

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-[#44C3B2] underline",
                },
            }),
            Placeholder.configure({
                placeholder: placeholder || "Comece a escrever...",
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
        ],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none text-[#0A1F1C] min-h-[200px] max-w-full font-body",
            },
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    return (
        <div className="rounded-xl border border-white/50 bg-white/50 overflow-hidden focus-within:ring-2 focus-within:ring-[#44C3B2] transition-all">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
            <style jsx global>{`
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: rgba(10, 31, 28, 0.4);
                    pointer-events: none;
                    height: 0;
                }
                .ProseMirror {
                    padding: 1rem;
                }
                .ProseMirror h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }
                .ProseMirror h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem; }
                .ProseMirror h3 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5rem; }
                .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
                .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
                .ProseMirror blockquote { border-left: 4px solid #44C3B2; padding-left: 1rem; font-style: italic; margin-bottom: 1rem; }
            `}</style>
        </div>
    );
}
