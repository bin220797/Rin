import React, { useState, useEffect } from "react";
import { FlatTabButton } from "@rin/ui";
import { uploadImageFile } from "../utils/image-upload";

interface MarkdownEditorProps {
  content: string;
  setContent: (content: string) => void;
  height?: string;
}

interface ToolbarButtonProps {
  icon: string;
  onClick: () => void;
  tooltip: string;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, onClick, tooltip, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    title={tooltip}
  >
    <i className={icon} />
  </button>
);

export function MarkdownEditorVisual({ content, setContent, height = "680px" }: MarkdownEditorProps) {
  const [editorType, setEditorType] = useState<'visual' | 'markdown' | 'split'>('visual');
  const [isUploading, setIsUploading] = useState(false);
  const [markdownContent, setMarkdownContent] = useState(content);

  // 同步内容
  useEffect(() => {
    setMarkdownContent(content);
  }, [content]);

  const insertText = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea[name="markdown"]') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdownContent.substring(start, end);
    const textToInsert = before + selectedText + after;

    const newContent =
      markdownContent.substring(0, start) +
      textToInsert +
      markdownContent.substring(end);

    setMarkdownContent(newContent);
    setContent(newContent);

    // 恢复焦点和选择
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const insertHeading = (level: number) => {
    insertText('#'.repeat(level) + ' ', '\n');
  };

  const insertList = (ordered: boolean = false) => {
    insertText(ordered ? '1. ' : '* ', '');
  };

  const insertBold = () => {
    insertText('**', '**');
  };

  const insertItalic = () => {
    insertText('*', '*');
  };

  const insertLink = () => {
    insertText('[', '](url)');
  };

  const insertImage = () => {
    insertText('![', '](url)');
  };

  const insertCode = () => {
    insertText('`', '`');
  };

  const insertCodeBlock = () => {
    insertText('\n```\n', '\n```\n');
  };

  const insertQuote = () => {
    insertText('> ', '');
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImageFile(file);
      const markdown = `![${file.name}](${url})`;

      const newContent = markdownContent + '\n' + markdown;
      setMarkdownContent(newContent);
      setContent(newContent);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handlePaste = async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboardData = event.clipboardData;
    const items = clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file) {
          setIsUploading(true);
          try {
            const url = await uploadImageFile(file);
            const markdown = `![${file.name}](${url})`;

            const newContent = markdownContent + '\n' + markdown;
            setMarkdownContent(newContent);
            setContent(newContent);
          } catch (error) {
            console.error(error);
          } finally {
            setIsUploading(false);
          }
        }
        break;
      }
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ height }}>
      {/* 工具栏 */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-2">
        <div className="flex items-center gap-2 mb-2">
          <ToolbarButton
            icon="ri-bold"
            onClick={insertBold}
            tooltip="粗体"
          />
          <ToolbarButton
            icon="ri-italic"
            onClick={insertItalic}
            tooltip="斜体"
          />
          <ToolbarButton
            icon="ri-link"
            onClick={insertLink}
            tooltip="链接"
          />
          <ToolbarButton
            icon="ri-image-2"
            onClick={insertImage}
            tooltip="图片"
          />
          <ToolbarButton
            icon="ri-code-s-slash-line"
            onClick={insertCode}
            tooltip="行内代码"
          />
          <ToolbarButton
            icon="ri-code-box-line"
            onClick={insertCodeBlock}
            tooltip="代码块"
          />
          <ToolbarButton
            icon="ri-quote-text"
            onClick={insertQuote}
            tooltip="引用"
          />
        </div>

        <div className="flex items-center gap-2">
          <ToolbarButton
            icon="ri-h1"
            onClick={() => insertHeading(1)}
            tooltip="标题1"
          />
          <ToolbarButton
            icon="ri-h2"
            onClick={() => insertHeading(2)}
            tooltip="标题2"
          />
          <ToolbarButton
            icon="ri-h3"
            onClick={() => insertHeading(3)}
            tooltip="标题3"
          />
          <ToolbarButton
            icon="ri-list-unordered"
            onClick={() => insertList(false)}
            tooltip="无序列表"
          />
          <ToolbarButton
            icon="ri-list-ordered"
            onClick={() => insertList(true)}
            tooltip="有序列表"
          />
          <ToolbarButton
            icon="ri-upload-cloud-2"
            onClick={() => document.querySelector<HTMLInputElement>('input[name="upload-image"]')?.click()}
            tooltip={isUploading ? "上传中..." : "上传图片"}
            disabled={isUploading}
          />
          <input
            name="upload-image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* 编辑器切换 */}
        <div className="flex gap-2 mt-2">
          <FlatTabButton
            active={editorType === 'visual'}
            onClick={() => setEditorType('visual')}
            className="flex-1"
          >
            可视化
          </FlatTabButton>
          <FlatTabButton
            active={editorType === 'markdown'}
            onClick={() => setEditorType('markdown')}
            className="flex-1"
          >
            Markdown
          </FlatTabButton>
          <FlatTabButton
            active={editorType === 'split'}
            onClick={() => setEditorType('split')}
            className="flex-1"
          >
            分屏
          </FlatTabButton>
        </div>
      </div>

      {/* 编辑器区域 */}
      <div className="flex-1 flex overflow-hidden">
        {editorType === 'visual' && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <textarea
                name="markdown"
                value={markdownContent}
                onChange={(e) => {
                  const newContent = e.target.value;
                  setMarkdownContent(newContent);
                  setContent(newContent);
                }}
                onPaste={handlePaste}
                className="w-full h-full border-none outline-none resize-none font-mono text-sm"
                placeholder="开始编写你的博客内容..."
              />
            </div>
          </div>
        )}

        {editorType === 'markdown' && (
          <div className="flex-1 overflow-y-auto">
            <textarea
              value={markdownContent}
              onChange={(e) => {
                const newContent = e.target.value;
                setMarkdownContent(newContent);
                setContent(newContent);
              }}
              onPaste={handlePaste}
              className="w-full h-full p-4 border-none outline-none resize-none font-mono text-sm"
              style={{ fontFamily: 'monospace' }}
              placeholder="开始编写你的博客内容..."
            />
          </div>
        )}

        {editorType === 'split' && (
          <div className="flex h-full">
            <div className="flex-1 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
              <textarea
                value={markdownContent}
                onChange={(e) => {
                  const newContent = e.target.value;
                  setMarkdownContent(newContent);
                  setContent(newContent);
                }}
                onPaste={handlePaste}
                className="w-full h-full p-4 border-none outline-none resize-none font-mono text-sm"
                style={{ fontFamily: 'monospace' }}
                placeholder="开始编写你的博客内容..."
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="prose prose-gray dark:prose-invert max-w-none p-4">
                <textarea
                  value={markdownContent}
                  onChange={(e) => {
                    const newContent = e.target.value;
                    setMarkdownContent(newContent);
                    setContent(newContent);
                  }}
                  className="w-full h-full border-none outline-none resize-none font-mono text-sm opacity-0 absolute"
                />
                <div className="markdown-content">
                  {markdownContent.split('\n').map((line, index) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={index} className="text-2xl font-bold mb-4">{line.substring(2)}</h1>;
                    } else if (line.startsWith('## ')) {
                      return <h2 key={index} className="text-xl font-semibold mb-3">{line.substring(3)}</h2>;
                    } else if (line.startsWith('### ')) {
                      return <h3 key={index} className="text-lg font-medium mb-2">{line.substring(4)}</h3>;
                    } else if (line.startsWith('- ') || line.startsWith('* ')) {
                      return <li key={index} className="ml-4 mb-1">• {line.substring(2)}</li>;
                    } else if (line.startsWith('> ')) {
                      return <blockquote key={index} className="border-l-4 border-gray-300 pl-4 mb-2 italic">{line.substring(2)}</blockquote>;
                    } else if (line.trim() === '') {
                      return <br key={index} />;
                    } else {
                      return <p key={index} className="mb-2">{line}</p>;
                    }
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}