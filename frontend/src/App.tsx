import React, { useState } from 'react';
import { Sidebar, type NavMenuId } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './views/HomeView';
import { PanduanView } from './views/PanduanView';
import { PengaturanView } from './views/PengaturanView';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

export const App: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<NavMenuId>('beranda');

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800 antialiased'>
      {/* =========================================================
          1. SIDEBAR DESKTOP (Tampil di layar Desktop/Tablet >= md)
         ========================================================= */}
      <Sidebar activeMenu={activeMenu} onSelectMenu={setActiveMenu} />

      {/* =========================================================
          2. KONTEN UTAMA (Beranda, Panduan, Pengaturan)
         ========================================================= */}
      <main className='flex-1 md:ml-64 pb-24 md:pb-10 bg-white min-h-screen'>
        {activeMenu === 'beranda' && <HomeView onNavigate={setActiveMenu} />}
        {activeMenu === 'panduan' && <PanduanView onNavigate={setActiveMenu} />}
        {activeMenu === 'pengaturan' && <PengaturanView onNavigate={setActiveMenu} />}
      </main>

      {/* =========================================================
          3. BOTTOM NAVIGATION BAR (Tampil di layar Mobile < md)
         ========================================================= */}
      <BottomNav activeMenu={activeMenu} onSelectMenu={setActiveMenu} />

      {/* =========================================================
          4. PWA INSTALL BANNER
         ========================================================= */}
      <PWAInstallPrompt />
    </div>
  );
};

export default App;
