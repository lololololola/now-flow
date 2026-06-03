import type { NowCategory } from "@/types/nowFlow";

export function categoryLabel(category: NowCategory) {
  if (category === "basis") return "基础";
  if (category === "energy") return "蓄能";
  return "创造";
}

export function categoryColorVar(category: NowCategory) {
  if (category === "basis") return "var(--basis)";
  if (category === "energy") return "var(--energy)";
  return "var(--creation)";
}
