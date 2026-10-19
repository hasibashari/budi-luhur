import React from 'react';
import { Home, BookOpen, Settings, PlusSquare } from 'lucide-react';

export type NavMenuId = 'beranda' | 'panduan' | 'pengaturan';

export interface NavItem {
  id: NavMenuId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'beranda', label: 'Beranda', icon: Home },
  { id: 'panduan', label: 'Panduan', icon: BookOpen },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
];

interface SidebarProps {
  activeMenu: NavMenuId;
  onSelectMenu: (menu: NavMenuId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeMenu, onSelectMenu }) => {
  return (
    <aside className='hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-20 select-none'>
      {/* Brand & Logo Header */}
      <div className='p-5 flex items-center gap-3 border-b border-gray-100'>
        <div className='w-11 h-11 rounded-xl overflow-hidden shadow-xs shrink-0 flex items-center justify-center bg-white border border-gray-100 p-1'>
          <img
            src='/images/sora.png'
            alt='Logo Aplikasi SORA'
            className='w-full h-full object-contain'
          />
        </div>
        <div>
          <h1 className='font-bold text-gray-900 text-base leading-tight'>Aplikasi SORA</h1>
          <p className='text-xs text-gray-500 font-medium'>STIKes Budi Luhur</p>
        </div>
      </div>

      {/* Navigasi Utama Sidebar */}
      <nav className='flex-1 p-4 space-y-2' aria-label='Navigasi Sidebar Desktop'>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectMenu(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 text-left ${
                isActive
                  ? 'bg-teal-50 text-[#149690] font-semibold shadow-2xs'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#149690]' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info Sidebar */}
      <div className='p-4 border-t border-gray-100 text-[11px] text-gray-400'>
        <p className='font-semibold text-gray-600'>Aplikasi SORA</p>
        <p>© 2026 STIKes Budi Luhur Cimahi</p>
      </div>
    </aside>
  );
};

export default Sidebar;
