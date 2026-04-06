import {
  Activity,
  Book,
  Calculator,
  Code,
  Database,
  Folder,
  Globe,
  Grid,
  Image,
  Lock,
  type LucideIcon,
  Monitor,
  Palette,
  QrCode,
  Server,
  Settings,
  Shield,
  Text,
  Zap,
} from "lucide-react";

// 预定义常用图标映射
const iconMap: Record<string, LucideIcon> = {
  code: Code,
  palette: Palette,
  zap: Zap,
  book: Book,
  settings: Settings,
  monitor: Monitor,
  database: Database,
  grid: Grid,
  qrcode: QrCode,
  image: Image,
  globe: Globe,
  text: Text,
  folder: Folder,
  lock: Lock,
  activity: Activity,
  shield: Shield,
  server: Server,
  calculator: Calculator,
};

// 优化的静态图标组件
export const DynamicIcon = ({
  name,
  ...props
}: {
  name?: string;
  className?: string;
}) => {
  if (name && iconMap[name]) {
    const IconComponent = iconMap[name];
    return <IconComponent {...props} />;
  }

  console.warn(`Icon "${name}" not found in static icon map`);
  return null;
};
