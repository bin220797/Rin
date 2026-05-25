import React, { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Loading from 'react-loading';
import { FlatInset, FlatTabButton } from "@rin/ui";
import { useAlert } from "./dialog";
import { uploadImageFile } from "../utils/image-upload";
import { Markdown } from "./markdown";

interface VisualEditorProps {
  content: string;
  setContent: (content: string) => void;
  placeholder?: string;
  height?: string;
}

interface MarkdownContent {
  type: 'paragraph' | 'heading' | 'list' | 'image' | 'code' | 'quote';
  content?: string;
  level?: number;
  items?: string[];
  ordered?: boolean;
  url?: string;
  alt?: string;
  language?: string;
}

export function VisualEditor({ content, setContent, placeholder = "Start writing your content...", height = "680px" }: VisualEditorProps) {
  const { t } = useTranslation();
  const colorMode = useColorMode();
  const editorRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<'edit' | 'preview' | 'comparison'>('edit');
  const [uploading, setUploading] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<MarkdownContent[]>([]);
  const { showAlert, AlertUI } = useAlert();

  // Convert Markdown to structured content
  useEffect(() => {
    const parseMarkdown = (md: string): MarkdownContent[] => {
      const lines = md.split('\n');
      const result: MarkdownContent[] = [];
      let currentBlock: MarkdownContent | null = null;
      let listItems: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();

        // Headers
        if (trimmed.startsWith('#')) {
          if (currentBlock) result.push(currentBlock);
          const level = trimmed.match(/^#+/)?.[0].length || 1;
          currentBlock = {
            type: 'heading',
            level,
            content: trimmed.replace(/^#+\s*/, '')
          };
        }
        // Lists
        else if (/^\d+\.\s+/.test(trimmed) || /^[-*+]\s+/.test(trimmed)) {
          if (currentBlock && currentBlock.type !== 'list') {
            result.push(currentBlock);
            currentBlock = null;
          }
          if (!currentBlock) {
            currentBlock = {
              type: 'list',
              ordered: /^\d+\./.test(trimmed),
              items: []
            };
          }
          const item = trimmed.replace(/^\d+\.\s+/, '').replace(/^[-*+]\s+/, '');
          currentBlock.items!.push(item);
        }
        // Images
        else if (trimmed.startsWith('![')) {
          if (currentBlock) result.push(currentBlock);
          const match = trimmed.match(/!\[([^\]]*)\]\(([^)]+)\)/);
          if (match) {
            currentBlock = {
              type: 'image',
              alt: match[1],
              url: match[2]
            };
            result.push(currentBlock);
            currentBlock = null;
          }
        }
        // Code blocks
        else if (trimmed.startsWith('```')) {
          if (currentBlock) result.push(currentBlock);
          const language = trimmed.replace(/```\w*/, '').trim();
          currentBlock = {
            type: 'code',
            language,
            content: ''
          };
        }
        // Quotes
        else if (trimmed.startsWith('> ')) {
          if (currentBlock) result.push(currentBlock);
          currentBlock = {
            type: 'quote',
            content: trimmed.replace(/^>\s*/, '')
          };
        }
        // Empty line ends paragraph
        else if (trimmed === '' && currentBlock && currentBlock.type === 'paragraph') {
          result.push(currentBlock);
          currentBlock = null;
        }
        // Regular paragraph
        else if (trimmed !== '') {
          if (!currentBlock || currentBlock.type !== 'paragraph') {
            if (currentBlock) result.push(currentBlock);
            currentBlock = {
              type: 'paragraph',
              content: trimmed
            };
          } else {
            currentBlock.content = (currentBlock.content || '') + ' ' + trimmed;
          }
        }
      }

      if (currentBlock) result.push(currentBlock);
      return result;
    };

    if (content) {
      setMarkdownContent(parseMarkdown(content));
    }
  }, [content]);

  // Convert structured content to HTML
  const renderContent = (blocks: MarkdownContent[]) => {
    return blocks.map((block, index) => {
      switch (block.type) {
        case 'heading':
          const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements;
          return (
            <HeadingTag key={index} className="font-bold mb-3">
              {block.content}
            </HeadingTag>
          );
        case 'paragraph':
          return (
            <p key={index} className="mb-4">
              {block.content}
            </p>
          );
        case 'list':
          const ListTag = block.ordered ? 'ol' : 'ul';
          return (
            <ListTag key={index} className={`mb-4 ${block.ordered ? 'list-decimal list-inside' : 'list-disc list-inside'}`}>
              {block.items!.map((item, i) => (
                <li key={i} className="mb-1">{item}</li>
              ))}
            </ListTag>
          );
        case 'image':
          return (
            <div key={index} className="my-4">
              <img
                src={block.url}
                alt={block.alt}
                className="max-w-full h-auto rounded-lg"
              />
              {block.alt && <p className="text-sm text-gray-500 mt-1">{block.alt}</p>}
            </div>
          );
        case 'code':
          return (
            <div key={index} className="my-4">
              {block.language && (
                <p className="text-sm text-gray-500 mb-1">{block.language}</p>
              )}
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto">
                <code>{block.content}</code>
              </pre>
            </div>
          );
        case 'quote':
          return (
            <blockquote key={index} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic">
              {block.content}
            </blockquote>
          );
        default:
          return null;
      }
    });
  };

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    const html = e.currentTarget.innerHTML;
    const plainText = e.currentTarget.innerText || '';

    // Simple conversion from HTML-like back to Markdown (simplified)
    let markdown = plainText;

    // Convert headers
    markdown = markdown.replace(/^<h1>/gi, '# ').replace(/<\/h1>/gi, '\n');
    markdown = markdown.replace(/^<h2>/gi, '## ').replace(/<\/h2>/gi, '\n');
    markdown = markdown.replace(/^<h3>/gi, '### ').replace(/<\/h3>/gi, '\n');

    setContent(markdown);
  };

  const handlePaste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboardData = event.clipboardData;
    if (clipboardData.files.length > 0) {
      event.preventDefault();
      const file = clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        insertImage(file);
      }
    }
  };

  const insertImage = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadImageFile(file);
      const url = result.url;
      const alt = file.name.split('.')[0];

      const markdown = `![${alt}](${url})`;
      setContent(prev => prev + '\n' + markdown);
    } catch (error) {
      console.error(error);
      showAlert(error instanceof Error ? error.message : t("upload.failed"));
    } finally {
      setUploading(false);
    }
  };

  const insertTextAtCaret = (text: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // Toolbar buttons
  const ToolbarButton = ({ onClick, icon, label }: { onClick: () => void; icon: string; label: string }) => (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-w px-3 py-2 text-sm t-primary transition-colors hover:border-black/20 dark:border-white/10 dark:hover:border-white/20"
      title={label}
    >
      <i className={icon} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col gap-0 sm:gap-3">
      <FlatInset className="flex flex-wrap items-center gap-2 border-0 border-b border-black/10 rounded-none bg-transparent p-3 dark:border-white/10">
        <FlatTabButton active={preview === 'edit'} onClick={() => setPreview('edit')}>
          {t("edit")}
        </FlatTabButton>
        <FlatTabButton active={preview === 'preview'} onClick={() => setPreview('preview')}>
          {t("preview")}
        </FlatTabButton>
        <FlatTabButton active={preview === 'comparison'} onClick={() => setPreview('comparison')}>
          {t("comparison")}
        </FlatTabButton>
        <div className="flex-grow" />

        <ToolbarButton
          onClick={() => insertTextAtCaret('**bold** ')}
          icon="ri-bold"
          label="Bold"
        />
        <ToolbarButton
          onClick={() => insertTextAtCaret('*italic* ')}
          icon="ri-italic"
          label="Italic"
        />
        <ToolbarButton
          onClick={() => insertTextAtCaret('# ')}
          icon="ri-heading"
          label="Heading"
        />
        <ToolbarButton
          onClick={() => insertTextAtCaret('* ')}
          icon="ri-list-unordered"
          label="Bullet List"
        />
        <ToolbarButton
          onClick={() => insertTextAtCaret('1. ')}
          icon="ri-list-ordered"
          label="Numbered List"
        />
        <ToolbarButton
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) insertImage(file);
            };
            input.click();
          }}
          icon="ri-image-add-line"
          label="Image"
        />

        {uploading && (
          <div className="flex flex-row items-center space-x-2">
            <Loading type="spin" color="#FC466B" height={16} width={16} />
            <span className="text-sm text-neutral-500">{t('uploading')}</span>
          </div>
        )}
      </FlatInset>

      <div className={`grid grid-cols-1 gap-0 sm:gap-4 ${preview === 'comparison' ? "lg:grid-cols-2" : ""}`}>
        {/* Editor View */}
        <div className={"flex min-w-0 flex-col " + (preview === 'preview' ? "hidden" : "")}>
          <div
            ref={editorRef}
            className="relative min-h-0 overflow-hidden rounded-none border-0 bg-w p-4"
            contentEditable
            onInput={handleEditorInput}
            onPaste={handlePaste}
            style={{ height }}
            dangerouslySetInnerHTML={preview === 'edit' ? { __html: renderContent(markdownContent).join('') } : undefined}
          />
        </div>

        {/* Preview View */}
        <div
          className={"min-h-0 overflow-y-auto rounded-none border-0 bg-w px-4 py-4 border-t sm:border-none " + (preview === 'edit' ? "hidden" : "")}
          style={{ height }}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {renderContent(markdownContent)}
          </div>
        </div>
      </div>

      <AlertUI />
    </div>
  );
}