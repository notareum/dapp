'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAccount, useDisconnect } from 'wagmi';
import ConnectButton from './ConnectButton';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    ),
  },
  {
    href: '/registry',
    label: 'Registry',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16v16H4z" />
        <path d="M4 10h16" />
        <path d="M10 10v10" />
      </svg>
    ),
  },
  {
    href: '/nota',
    label: '.nota Files',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    href: '/verification',
    label: 'Verification',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    href: '/staking',
    label: 'Staking',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="10" rx="2" />
        <path d="M6 11h.01" />
        <path d="M6 17v-6" />
        <path d="M18 17V7" />
      </svg>
    ),
  },
  {
    href: '/governance',
    label: 'Governance',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V8l7-5 7 5v13" />
        <path d="M9 21v-8h6v8" />
      </svg>
    ),
  },
  {
    href: '/explorer',
    label: 'Explorer',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
];

function normalizePath(path: string) {
  if (path === '/') return '/';
  return path.replace(/\/+$/, '');
}

function truncateAddr(addr: string) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => setMounted(true), []);
  useEffect(() => setMobileOpen(false), [pathname]);

  const isDark = resolvedTheme === 'dark';
  const currentPath = normalizePath(pathname || '/');

  const isActive = (href: string) => {
    const n = normalizePath(href);
    return currentPath === n || currentPath.startsWith(`${n}/`);
  };

  const widthClass = collapsed ? 'lg:w-[68px]' : 'lg:w-[240px]';

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b backdrop-blur-sm"
        style={{ borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--bg) 92%, transparent)' }}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Notareum" width={32} height={32} className="h-8 w-8" />
          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Notareum</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Toggle menu"
        >
          <div className="w-5 h-0.5 bg-current mb-1 transition-all" style={{ transform: mobileOpen ? 'rotate(45deg) translateY(6px)' : '' }} />
          <div className="w-5 h-0.5 bg-current mb-1 transition-all" style={{ opacity: mobileOpen ? 0 : 1 }} />
          <div className="w-5 h-0.5 bg-current transition-all" style={{ transform: mobileOpen ? 'rotate(-45deg) translateY(-6px)' : '' }} />
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col
          transition-all duration-200
          ${widthClass}
          ${mobileOpen ? 'w-[260px] translate-x-0' : 'w-[260px] -translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'var(--bg-alt)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Logo + collapse toggle */}
        <div
          className="flex items-center justify-between h-16 px-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <Image src="/logo.png" alt="Notareum" width={36} height={36} className="h-9 w-9 flex-shrink-0" />
            {!collapsed && (
              <span className="font-semibold text-base truncate" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
                Notareum
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-[color-mix(in_srgb,var(--border)_80%,transparent)]"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Toggle sidebar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${collapsed ? 'lg:justify-center lg:px-2' : ''}
                    `}
                    style={{
                      background: active ? 'color-mix(in srgb, var(--brand) 12%, transparent)' : 'transparent',
                      color: active ? 'var(--brand)' : 'var(--text-body)',
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="flex-shrink-0" style={{ color: active ? 'var(--brand)' : 'var(--text-muted)' }}>
                      {item.icon}
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer: theme toggle + wallet */}
        <div className="flex-shrink-0 p-3 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`
                flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors
                ${collapsed ? 'lg:justify-center lg:px-2' : ''}
              `}
              style={{ color: 'var(--text-muted)' }}
              title={collapsed ? 'Toggle theme' : undefined}
            >
              {isDark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
              {!collapsed && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
            </button>
          )}

          {isConnected && address ? (
            <div
              className={`rounded-xl p-3 flex items-center gap-3 ${collapsed ? 'lg:p-2 lg:justify-center' : ''}`}
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-soft) 100%)' }}
              >
                {address.slice(2, 4).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono truncate" style={{ color: 'var(--text)' }}>
                    {truncateAddr(address)}
                  </div>
                  <button
                    type="button"
                    onClick={() => disconnect()}
                    className="text-xs hover:underline"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={collapsed ? 'lg:hidden' : ''}>
              <ConnectButton variant="secondary" fullWidth />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
