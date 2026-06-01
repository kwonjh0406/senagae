import Link from "next/link";

type MainSection = "community" | "guide" | "home";

type SubNavItem = {
  href: string;
  isActive?: boolean;
  label: string;
};

const mainNavItems: { href: string; key: MainSection; label: string }[] = [
  { href: "/", key: "home", label: "홈" },
  { href: "/guide", key: "guide", label: "가이드" },
  { href: "/community", key: "community", label: "커뮤니티" },
];

export function AppHeader({
  active,
  subNavItems,
  subNavLabel,
}: {
  active: MainSection;
  subNavItems?: SubNavItem[];
  subNavLabel?: string;
}) {
  return (
    <header className="app-header">
      <div className="app-header-main">
        <Link className="brand-mark" href="/" aria-label="세상에 나쁜 개미는 없다 홈">
          <span className="brand-ant" aria-hidden="true">
            <span />
          </span>
          <span>세나개</span>
        </Link>
        <nav className="primary-nav" aria-label="주요 메뉴">
          {mainNavItems.map((item) => (
            <Link
              aria-current={active === item.key ? "page" : undefined}
              className={active === item.key ? "is-active" : undefined}
              href={item.href}
              key={item.key}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {subNavItems?.length ? (
        <nav className="section-nav" aria-label={subNavLabel ?? "섹션 메뉴"}>
          {subNavLabel ? <span>{subNavLabel}</span> : null}
          {subNavItems.map((item) => (
            <Link
              aria-current={item.isActive ? "page" : undefined}
              className={item.isActive ? "is-active" : undefined}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
