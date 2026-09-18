import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { CitySelectorModal } from '../common/CitySelectorModal';

export interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      <Header />
      <main className="flex-1 w-full flex flex-col">{children}</main>
      <Footer />
      <CitySelectorModal />
    </div>
  );
};
