import {
  Activity, AppWindow, Archive, BarChart, BookOpen, Bot, Calculator, CalendarDays, CircleHelp, ClipboardList, Contact,
  FileCog, FileSignature, FileText, GraduationCap, Home, House, Images, Landmark, Map, MessageCircle, MessageSquare,
  MessagesSquare, Network, PackageSearch, Phone, Presentation, Radar, Route, ScrollText, Send, ShieldAlert, Sparkles,
  TrendingUp, Users, Wallet, type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  activity: Activity, archive: Archive, "bar-chart": BarChart, "book-open": BookOpen, bot: Bot, calculator: Calculator,
  "calendar-days": CalendarDays, "circle-help": CircleHelp, "clipboard-list": ClipboardList, contact: Contact,
  "file-cog": FileCog, "file-signature": FileSignature, "file-text": FileText, "graduation-cap": GraduationCap, home: Home,
  house: House, images: Images, landmark: Landmark, map: Map, "message-circle": MessageCircle, "message-square": MessageSquare,
  "messages-square": MessagesSquare, network: Network, "package-search": PackageSearch, phone: Phone, presentation: Presentation,
  radar: Radar, route: Route, "scroll-text": ScrollText, send: Send, "shield-alert": ShieldAlert, sparkles: Sparkles,
  "trending-up": TrendingUp, users: Users, wallet: Wallet,
};

export function AppIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? AppWindow;
  return <Icon className={className} strokeWidth={1.6} aria-hidden />;
}

export const KNOWN_ICONS = Object.keys(ICONS);
