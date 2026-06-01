import { AppHeader } from "../components/AppHeader";

const navItems = [
  { label: "가이드", href: "/guide" },
  { label: "용어", href: "/guide/terms" },
  { label: "차트", href: "/guide/charts" },
  { label: "체크리스트", href: "/guide/checklist" },
];

export function GuideHeader({ current = "/guide" }: { current?: string }) {
  return (
    <AppHeader
      active="guide"
      subNavItems={navItems.map((item) => ({
        ...item,
        isActive: item.href === current,
      }))}
    />
  );
}
