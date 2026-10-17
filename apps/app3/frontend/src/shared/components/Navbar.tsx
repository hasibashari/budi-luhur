import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShieldCheck, LogOut, LayoutDashboard, Sparkles, ChevronDown } from 'lucide-react';
import { Avatar } from './ui/Avatar';
import { cn } from '../utils/cn';
import { useAuth } from '@/src/features/auth';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const dashboardHref = user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
  const roleLabel = user?.role === 'admin' ? 'PETUGAS FASKES' : 'CALON PENGANTIN';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm py-3 border-b border-[#e2e8f0]'
          : 'bg-transparent py-5',
      )}
    >
      <div className='container mx-auto px-4 sm:px-6 max-w-7xl flex items-center justify-between'>
        <Link to='/' className='flex items-center gap-2.5 group'>
          <div className='bg-gradient-to-tr from-[#059669] to-[#10b981] text-white p-2 rounded-xl group-hover:scale-105 transition-transform shadow-md shadow-emerald-700/20'>
            <ShieldCheck size={22} className='text-white' />
          </div>
          <span className='text-xl font-extrabold text-[#0f172a] tracking-tight flex items-center gap-1.5'>
            <span>PRELUNA</span>
          </span>
        </Link>

        {/* Desktop Nav (>= lg) */}
        <nav className='hidden lg:flex items-center gap-6 xl:gap-8'>
          <a
            href='/#benefits'
            className='text-sm font-medium text-[#475569] hover:text-[#059669] transition-colors'
          >
            Manfaat Imunisasi TT
          </a>
          <a
            href='/#schedule'
            className='text-sm font-medium text-[#475569] hover:text-[#059669] transition-colors'
          >
            Jadwal 5 Dosis Kemenkes
          </a>
          <a
            href='/#screening'
            className='text-sm font-medium text-[#475569] hover:text-[#059669] transition-colors'
          >
            Skrining Pranikah
          </a>
          <a
            href='/#faq'
            className='text-sm font-medium text-[#475569] hover:text-[#059669] transition-colors'
          >
            Tanya Jawab
          </a>
        </nav>

        <div className='hidden lg:flex items-center gap-3'>
          {isAuthenticated && user ? (
            <div className='relative' ref={profileDropdownRef}>
              <button
                type='button'
                onClick={() => setIsProfileMenuOpen(prev => !prev)}
                aria-expanded={isProfileMenuOpen}
                aria-haspopup='true'
                className='flex items-center gap-2 bg-white/90 hover:bg-white border border-slate-200/80 hover:border-emerald-200 rounded-full py-1.5 pl-1.5 pr-3 shadow-xs hover:shadow-sm transition-all cursor-pointer group'
              >
                <Avatar
                  src={user.avatarUrl}
                  name={user.name}
                  size='sm'
                  ringClassName='ring-1.5 ring-[#059669]'
                />
                <div className='flex items-center gap-1.5 text-left'>
                  <span className='text-xs font-bold text-slate-800 leading-none truncate max-w-28 group-hover:text-[#059669] transition-colors'>
                    {user.name.split(',')[0]}
                  </span>
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full text-white ${
                      user.role === 'admin' ? 'bg-[#059669]' : 'bg-[#d97706]'
                    }`}
                  >
                    {roleLabel}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={cn(
                    'text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ml-0.5',
                    isProfileMenuOpen && 'rotate-180 text-[#059669]',
                  )}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className='absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white border border-emerald-100 shadow-xl shadow-emerald-950/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150'>
                  {/* Menu Links */}
                  <div className='p-1 flex flex-col gap-0.5'>
                    <Link
                      to={dashboardHref}
                      onClick={() => setIsProfileMenuOpen(false)}
                      className='flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#059669] hover:bg-emerald-50/70 rounded-xl transition-colors'
                    >
                      <LayoutDashboard size={15} className='text-[#059669]' />
                      <span>Ke Dashboard</span>
                    </Link>

                    <button
                      type='button'
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className='w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50/80 rounded-xl transition-colors text-left cursor-pointer'
                    >
                      <LogOut size={15} className='text-red-500' />
                      <span>Keluar Akun</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to='/splash'
              className='bg-gradient-to-r from-[#059669] to-[#10b981] hover:from-[#047857] hover:to-[#059669] text-white px-5 py-2.25 rounded-full text-sm font-bold transition-all shadow-md shadow-emerald-700/20 flex items-center gap-1.5 hover:scale-105 active:scale-95'
            >
              <Sparkles size={16} />
              <span>Buka Aplikasi</span>
            </Link>
          )}
        </div>

        {/* Mobile Toggle (< lg) */}
        <button
          className='lg:hidden text-[#0f172a] p-2 cursor-pointer'
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label='Toggle Menu'
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className='absolute top-full left-0 right-0 bg-white border-b border-emerald-100 shadow-xl py-4 px-6 flex flex-col gap-4 lg:hidden animate-fade-in'>
          <a
            href='/#benefits'
            onClick={() => setIsMobileMenuOpen(false)}
            className='text-base font-medium text-slate-700 py-2 border-b border-slate-100'
          >
            Manfaat Imunisasi TT
          </a>
          <a
            href='/#schedule'
            onClick={() => setIsMobileMenuOpen(false)}
            className='text-base font-medium text-slate-700 py-2 border-b border-slate-100'
          >
            Jadwal 5 Dosis Kemenkes
          </a>
          <a
            href='/#screening'
            onClick={() => setIsMobileMenuOpen(false)}
            className='text-base font-medium text-slate-700 py-2 border-b border-slate-100'
          >
            Skrining Pranikah
          </a>
          <a
            href='/#faq'
            onClick={() => setIsMobileMenuOpen(false)}
            className='text-base font-medium text-slate-700 py-2 border-b border-slate-100'
          >
            Tanya Jawab
          </a>

          <div className='pt-2 flex flex-col gap-3'>
            {isAuthenticated && user ? (
              <div className='flex flex-col gap-2 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Avatar
                      src={user.avatarUrl}
                      name={user.name}
                      size='sm'
                      ringClassName='ring-1.5 ring-[#059669]'
                    />
                    <div>
                      <div className='text-sm font-bold text-slate-800'>{user.name}</div>
                      <div className='text-xs text-slate-500'>{user.email}</div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white ${
                      user.role === 'admin' ? 'bg-[#059669]' : 'bg-[#d97706]'
                    }`}
                  >
                    {roleLabel}
                  </span>
                </div>
                <Link
                  to={dashboardHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className='bg-[#059669] text-white text-center py-2.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 mt-1 shadow-sm'
                >
                  <LayoutDashboard size={16} />
                  <span>Buka Dashboard ({roleLabel})</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className='text-red-500 font-semibold text-sm py-2 hover:bg-red-50 rounded-full flex items-center justify-center gap-2 cursor-pointer'
                >
                  <LogOut size={16} />
                  <span>Keluar Akun</span>
                </button>
              </div>
            ) : (
              <Link
                to='/splash'
                onClick={() => setIsMobileMenuOpen(false)}
                className='bg-gradient-to-r from-[#059669] to-[#10b981] text-white text-center py-3 rounded-full font-bold shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2'
              >
                <Sparkles size={16} />
                <span>Buka Aplikasi Sekarang</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
