import './globals.css';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import { TabBar } from './_components/tab-bar';
import { RNWStyleRegistry } from './_components/rnw-style-registry';

export const metadata = {
  title: 'krpc Front Starter',
  description: 'Universal React Native + Web starter wired to a krpc backend.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RNWStyleRegistry>
          <Providers>
            <div className="phone-shell">
              {children}
              <TabBar />
            </div>
          </Providers>
        </RNWStyleRegistry>
      </body>
    </html>
  );
}
