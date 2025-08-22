import {
    Code,
    Palette,
    Zap,
    Book,
    Settings,
    Monitor,
    Database,
    Grid,
    type LucideIcon,
    QrCode,
    Image,
    Globe,
    Text,
    Folder,
    Lock,
    Activity,
    EyeClosed,
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
    eyeClosed: EyeClosed,
};

// 优化的静态图标组件
export const DynamicIcon = ({
    name,
    ...props
}: {
    name?: string;
    className?: string;
}) => {
    if (name && (iconMap[name] || iconMap[name.toLowerCase()])) {
        const IconComponent = iconMap[name.toLowerCase()];
        return <IconComponent {...props} />;
    }

    console.warn(`Icon "${name}" not found in static icon map`);
    return null;
};
