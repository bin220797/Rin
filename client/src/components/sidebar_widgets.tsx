import React from 'react';
import { useSiteConfig } from '../hooks/useSiteConfig';

interface ContactWidget {
  id: string;
  type: 'wechat' | 'qq' | 'email' | 'link' | 'custom';
  title: string;
  value: string;
  icon: string;
  url?: string;
  color?: string;
}

interface SidebarWidgetsProps {
  position: 'left' | 'right';
  widgets?: ContactWidget[];
  className?: string;
}

export function SidebarWidgets({ position, widgets = [], className = '' }: SidebarWidgetsProps) {
  const siteConfig = useSiteConfig();

  // 默认 widget 数据，后续可以从配置中读取
  const defaultWidgets: ContactWidget[] = [
    {
      id: 'wechat',
      type: 'wechat',
      title: '微信号',
      value: 'your_wechat_id',
      icon: 'ri-wechat-fill',
      color: '#07c160'
    },
    {
      id: 'qq',
      type: 'qq',
      title: 'QQ号',
      value: 'your_qq_number',
      icon: 'ri-qq-fill',
      color: '#12b7f5'
    },
    {
      id: 'email',
      type: 'email',
      title: '邮箱',
      value: 'your@email.com',
      icon: 'ri-mail-fill',
      color: '#ff6b6b'
    },
    {
      id: 'github',
      type: 'link',
      title: 'GitHub',
      value: 'github.com/username',
      icon: 'ri-github-fill',
      url: 'https://github.com/username',
      color: '#24292e'
    },
    {
      id: 'twitter',
      type: 'link',
      title: 'Twitter',
      value: '@username',
      icon: 'ri-twitter-fill',
      url: 'https://twitter.com/username',
      color: '#1da1f2'
    }
  ];

  const displayWidgets = widgets.length > 0 ? widgets : defaultWidgets;

  const renderWidget = (widget: ContactWidget) => {
    const content = (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg"
          style={{ backgroundColor: `${widget.color}20`, color: widget.color }}
        >
          <i className={`${widget.icon} text-xl`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {widget.title}
          </p>
          {widget.type === 'link' ? (
            <a
              href={widget.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 dark:text-gray-400 truncate hover:text-gray-900 dark:hover:text-gray-100"
            >
              {widget.value}
            </a>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {widget.value}
            </p>
          )}
        </div>
      </div>
    );

    if (widget.type === 'link' && widget.url) {
      return content;
    }

    return content;
  };

  if (displayWidgets.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 px-3">
        联系方式
      </h3>
      <div className="space-y-2">
        {displayWidgets.map((widget) => (
          <div key={widget.id}>
            {renderWidget(widget)}
          </div>
        ))}
      </div>
    </div>
  );
}