import React from 'react';
import { NAV_ITEMS, type NavMenuId } from './Sidebar';

interface BottomNavProps {
  activeMenu: NavMenuId;
  onSelectMenu: (menu: NavMenuId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeMenu, onSelectMenu }) => {
  return (
    <nav
      className='md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 flex justify-around items-center z-30 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] select-none'
      style={{
        paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom, 0px))',
      }}
      aria-label='Navigasi Mobile'
    >
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = activeMenu === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectMenu(item.id)}
            className='flex flex-col items-center gap-1 py-1 px-4 focus:outline-hidden min-w-[64px] transition-transform active:scale-95'
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              className={`w-6 h-6 transition-colors duration-200 ${
                isActive ? 'text-[#219E9A]' : 'text-gray-400'
              }`}
            />
            <span
              className={`text-[11px] font-medium transition-colors duration-200 ${
                isActive ? 'text-[#219E9A] font-semibold' : 'text-gray-500'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
