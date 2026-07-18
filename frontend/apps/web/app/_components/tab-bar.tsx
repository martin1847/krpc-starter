'use client';

import { usePathname, useRouter } from 'next/navigation';
import { HouseIcon, DocIcon, colors, type IconProps } from '@krpc-starter/app';
import type { ComponentType } from 'react';

// Web shell bottom tab bar (routing belongs to the shell), web-only (next/navigation). Mobile uses
// expo-router Tabs and does not reuse this. Semantic DOM (nav/button/span) + tailwind classes:
// this file compiles under apps/web (React's jsx-runtime, not NativeWind's interop), so RN
// primitives' classNames wouldn't reach the DOM — semantic DOM takes className natively.
type Tab = { href: string; label: string; Icon: ComponentType<IconProps> };

const TABS: Tab[] = [
  { href: '/', label: 'Home', Icon: HouseIcon },
  { href: '/catalog', label: 'Catalog', Icon: DocIcon },
];

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <nav className="absolute inset-x-0 bottom-0 z-30 flex h-16 items-stretch border-t border-line bg-surface">
      {TABS.map(({ href, label, Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <button
            key={href}
            type="button"
            onClick={() => router.push(href)}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-transparent"
          >
            <Icon size={24} color={active ? colors.brand500 : colors.inkMuted} />
            <span className={`text-[11px] ${active ? 'text-brand-500' : 'text-ink-muted'}`}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
