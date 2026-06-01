import Link from "next/link";

const navItems = [
  { label: "홈", href: "/" },
  { label: "커뮤니티", href: "/community" },
];

export function CommunityHeader() {
  return (
    <header className="site-header guide-header" aria-label="커뮤니티 메뉴">
      <Link className="brand-mark" href="/" aria-label="세상에 나쁜 개미는 없다 홈">
        <span className="brand-ant" aria-hidden="true">
          <span />
        </span>
        <span>세나개</span>
      </Link>
      <nav className="nav-tabs" aria-label="커뮤니티 내비게이션">
        {navItems.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
