import type { CategoryId } from "./types";

export const CATEGORIES: readonly { id: CategoryId; label: string; icon: string }[] = [
  { id: "sales", label: "営業支援", icon: "trending-up" },
  { id: "customer", label: "顧客・案件管理", icon: "users" },
  { id: "proposal", label: "提案・お客様資料", icon: "file-text" },
  { id: "finance", label: "財務・管理部", icon: "landmark" },
  { id: "org", label: "組織・人事・教育", icon: "network" },
  { id: "line", label: "LINE・チャット", icon: "message-circle" },
  { id: "ai", label: "AI・自動化", icon: "sparkles" },
];

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
