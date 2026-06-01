import Link from "next/link";
import Image from "next/image";

type MainSection = "analysis" | "community" | "guide" | "home" | "market" | "news";

type SubNavItem = {
  href: string;
  isActive?: boolean;
  label: string;
};

const mainNavItems: { href: string; key: MainSection; label: string }[] = [
  { href: "/", key: "home", label: "홈" },
  { href: "/news", key: "news", label: "뉴스·이벤트" },
  { href: "/market", key: "market", label: "증시 현황" },
  { href: "/analysis", key: "analysis", label: "종목 분석" },
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
          <Image className="brand-logo" src="/senagae-logo.png" alt="" width={64} height={43} priority />
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

      <form action="/analysis" className="stock-search" role="search" aria-label="종목 검색">
        <label htmlFor="stock-search-input">종목 검색</label>
        <input id="stock-search-input" name="symbol" placeholder="종목명 또는 티커를 입력하세요" />
        <button type="submit">검색</button>
      </form>

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
