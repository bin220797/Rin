import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { SidebarWidgets } from "./sidebar_widgets";

interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  content: string;
  icon: string;
  color: string;
  link?: string;
}

interface SidebarWidgetsConfig {
  left_widgets?: WidgetConfig[];
  right_widgets?: WidgetConfig[];
}

interface RawWidgetsResponse {
  sidebar_widgets?: SidebarWidgetsConfig;
}

export function Padding({
  className = "mx-8",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const [location] = useLocation();
  const [widgetsConfig, setWidgetsConfig] = useState<SidebarWidgetsConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWidgets() {
      try {
        const response = await fetch("/sidebar_widgets.json");
        if (response.ok) {
          const data: RawWidgetsResponse = await response.json();
          setWidgetsConfig(data.sidebar_widgets || null);
        }
      } catch (error) {
        console.error("Failed to load sidebar widgets:", error);
      } finally {
        setLoading(false);
      }
    }
    loadWidgets();
  }, []);

  const isHomePage = location === "/";
  const showWidgets = isHomePage && widgetsConfig && !loading;

  if (showWidgets) {
    const leftWidgets = widgetsConfig.left_widgets?.map(w => ({
      id: w.id,
      type: w.type as any,
      title: w.title,
      value: w.content,
      icon: w.icon,
      url: w.link,
      color: w.color,
    })) || [];
    
    const rightWidgets = widgetsConfig.right_widgets?.map(w => ({
      id: w.id,
      type: w.type as any,
      title: w.title,
      value: w.content,
      icon: w.icon,
      url: w.link,
      color: w.color,
    })) || [];
    
    return (
      <div className="flex justify-center gap-4">
        <div className="hidden lg:block w-64 flex-shrink-0">
          {leftWidgets.length > 0 && <SidebarWidgets widgets={leftWidgets} />}
        </div>
        <div className={`${className} sm:mx-8 md:mx-12 lg:mx-16 xl:mx-24 2xl:mx-32 duration-300`}>
          {children}
        </div>
        <div className="hidden lg:block w-64 flex-shrink-0">
          {rightWidgets.length > 0 && <SidebarWidgets widgets={rightWidgets} />}
        </div>
      </div>
    );
  }

  return <div className={`${className} sm:mx-8 md:mx-12 lg:mx-16 xl:mx-24 2xl:mx-32 duration-300`}>{children}</div>;
}
