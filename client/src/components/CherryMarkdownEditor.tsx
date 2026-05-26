import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import 'cherry-markdown/dist/cherry-markdown.css';
import Cherry from 'cherry-markdown';
import { uploadImageFile } from '../utils/image-upload';

interface CherryMarkdownEditorProps {
  content: string;
  setContent: (content: string) => void;
  height?: string;
}

export function CherryMarkdownEditor({ content, setContent, height = '680px' }: CherryMarkdownEditorProps) {
  const { t } = useTranslation();
  const cherryRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastContentRef = useRef(content);

  useEffect(() => {
    if (!containerRef.current) return;

    // 创建 Cherry 编辑器实例
    const cherry = new Cherry({
      id: 'cherry-editor',
      value: content,
      editor: {
        theme: 'light',
        defaultModel: 'editOnly',
        height,
        toolbars: {
          toolbar: ['bold', 'italic', 'strikethrough', '|', 'color', 'header', '|', 'list', 'orderedList', 'checkList', '|', 'link', 'image', 'code', 'codeBlock', 'quote', 'table', '|', 'undo', 'redo', '|', 'preview', 'fullScreen'],
          sidebar: [],
          bubble: ['bold', 'italic', 'underline', 'strikethrough', 'sub', 'sup', '|', 'size', 'color'],
          float: ['h1', 'h2', 'h3', '|', 'list', 'orderedList', 'checkList', '|', 'quote', 'table', 'codeBlock'],
        },
      },
      fileUpload: async (file: File) => {
        try {
          const result = await uploadImageFile(file);
          return result.url;
        } catch (error) {
          console.error('Image upload failed:', error);
          throw new Error(t('upload.failed'));
        }
      },
      callback: {
        afterChange: (value: string) => {
          if (value !== lastContentRef.current) {
            lastContentRef.current = value;
            setContent(value);
          }
        },
      },
    } as any);

    cherryRef.current = cherry;

    return () => {
      cherryRef.current = null;
    };
  }, []);

  // 同步外部内容变化
  useEffect(() => {
    if (cherryRef.current && content !== lastContentRef.current) {
      lastContentRef.current = content;
      cherryRef.current.setMarkdown(content);
    }
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      id="cherry-editor" 
      className="w-full"
      style={{ height }}
    />
  );
}
