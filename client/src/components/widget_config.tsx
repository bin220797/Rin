import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatPanel, FlatInset } from "@rin/ui";
import { Input } from "../components/input";
import { Checkbox } from "../components/input";

interface ContactWidget {
  id: string;
  type: 'wechat' | 'qq' | 'email' | 'link' | 'custom';
  title: string;
  value: string;
  icon: string;
  url?: string;
  color?: string;
  enabled: boolean;
}

interface WidgetConfigProps {
  onWidgetsChange: (widgets: ContactWidget[]) => void;
}

export function WidgetConfig({ onWidgetsChange }: WidgetConfigProps) {
  const { t } = useTranslation();
  const [widgets, setWidgets] = useState<ContactWidget[]>([
    {
      id: 'wechat',
      type: 'wechat',
      title: '微信号',
      value: '',
      icon: 'ri-wechat-fill',
      color: '#07c160',
      enabled: true
    },
    {
      id: 'qq',
      type: 'qq',
      title: 'QQ号',
      value: '',
      icon: 'ri-qq-fill',
      color: '#12b7f5',
      enabled: true
    },
    {
      id: 'email',
      type: 'email',
      title: '邮箱',
      value: '',
      icon: 'ri-mail-fill',
      color: '#ff6b6b',
      enabled: true
    },
    {
      id: 'github',
      type: 'link',
      title: 'GitHub',
      value: '',
      icon: 'ri-github-fill',
      color: '#24292e',
      enabled: true
    },
    {
      id: 'twitter',
      type: 'link',
      title: 'Twitter',
      value: '',
      icon: 'ri-twitter-fill',
      color: '#1da1f2',
      enabled: true
    },
    {
      id: 'custom1',
      type: 'custom',
      title: '自定义链接',
      value: '',
      icon: 'ri-link',
      color: '#7c3aed',
      enabled: false
    }
  ]);

  const [newCustomWidget, setNewCustomWidget] = useState({
    title: '',
    value: '',
    icon: 'ri-link'
  });

  useEffect(() => {
    const enabledWidgets = widgets.filter(w => w.enabled);
    onWidgetsChange(enabledWidgets);
  }, [widgets, onWidgetsChange]);

  const updateWidget = (id: string, field: keyof ContactWidget, value: any) => {
    setWidgets(prev => prev.map(w =>
      w.id === id ? { ...w, [field]: value } : w
    ));
  };

  const addCustomWidget = () => {
    if (newCustomWidget.title && newCustomWidget.value) {
      const customWidget: ContactWidget = {
        id: `custom-${Date.now()}`,
        type: 'custom',
        title: newCustomWidget.title,
        value: newCustomWidget.value,
        icon: newCustomWidget.icon,
        enabled: true
      };
      setWidgets(prev => [...prev, customWidget]);
      setNewCustomWidget({ title: '', value: '', icon: 'ri-link' });
    }
  };

  const removeCustomWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  return (
    <FlatPanel className="overflow-hidden">
      <FlatInset className="border-b border-black/10 dark:border-white/10 pb-4">
        <h3 className="text-lg font-semibold">{t('contact_widget_config')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t('contact_widget_config_desc')}
        </p>
      </FlatInset>

      <div className="p-4 space-y-4">
        {/* 预设联系人 */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            {t('preset_contacts')}
          </h4>
          <div className="space-y-3">
            {widgets.filter(w => !w.id.startsWith('custom')).map((widget) => (
              <div key={widget.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Checkbox
                  value={widget.enabled}
                  setValue={(v) => updateWidget(widget.id, 'enabled', v)}
                  placeholder={t('show')}
                />
                <div className="flex items-center gap-2 flex-1">
                  <i className={`${widget.icon}`} style={{ color: widget.color }} />
                  <span className="text-sm font-medium">{widget.title}</span>
                </div>
                {widget.type !== 'link' && (
                  <Input
                    value={widget.value}
                    setValue={(v) => updateWidget(widget.id, 'value', v)}
                    placeholder={`输入${widget.title}`}
                    className="flex-1 max-w-xs"
                  />
                )}
                {widget.type === 'link' && (
                  <Input
                    value={widget.value}
                    setValue={(v) => updateWidget(widget.id, 'value', v)}
                    placeholder="输入链接"
                    className="flex-1 max-w-xs"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 自定义联系人 */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            {t('custom_contacts')}
          </h4>
          <div className="space-y-3">
            {widgets.filter(w => w.id.startsWith('custom')).map((widget) => (
              <div key={widget.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Checkbox
                  value={widget.enabled}
                  setValue={(v) => updateWidget(widget.id, 'enabled', v)}
                  placeholder={t('show')}
                />
                <div className="flex items-center gap-2 flex-1">
                  <i className={`${widget.icon}`} style={{ color: widget.color }} />
                  <Input
                    value={widget.title}
                    setValue={(v) => updateWidget(widget.id, 'title', v)}
                    placeholder="标题"
                    className="flex-1 max-w-xs"
                  />
                  <Input
                    value={widget.value}
                    setValue={(v) => updateWidget(widget.id, 'value', v)}
                    placeholder="内容"
                    className="flex-1 max-w-xs"
                  />
                  <button
                    onClick={() => removeCustomWidget(widget.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <i className="ri-delete-bin-line" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 添加自定义联系人 */}
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex gap-2">
              <Input
                value={newCustomWidget.title}
                setValue={(v) => setNewCustomWidget(prev => ({ ...prev, title: v }))}
                placeholder="标题"
                className="flex-1"
              />
              <Input
                value={newCustomWidget.value}
                setValue={(v) => setNewCustomWidget(prev => ({ ...prev, value: v }))}
                placeholder="内容"
                className="flex-1"
              />
              <button
                onClick={addCustomWidget}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {t('add')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </FlatPanel>
  );
}