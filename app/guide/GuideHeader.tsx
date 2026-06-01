import Link from "next/link";

const navItems = [
  { label: "홈", href: "/" },
  { label: "가이드", href: "/guide" },
  { label: "용어", href: "/guide/terms" },
  { label: "차트", href: "/guide/charts" },
  { label: "체크리스트", href: "/guide/checklist" },
];

export function GuideHeader() {
  return (
    <header className="site-header guide-header" aria-label="가이드 메뉴">
      <Link className="brand-mark" href="/" aria-label="세상에 나쁜 개미는 없다 홈">
        <span className="brand-ant" aria-hidden="true">
          <span />
        </span>
        <span>세나개</span>
      </Link>
      <nav className="nav-tabs" aria-label="가이드 내비게이션">
        {navItems.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
