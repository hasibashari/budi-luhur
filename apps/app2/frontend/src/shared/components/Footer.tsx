import React from 'react';
import { Link } from 'react-router-dom';
import { Cross, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className='bg-surface-dark text-white pt-20 pb-10 border-t border-white/10'>
      <div className='container mx-auto px-6 max-w-7xl'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16'>
          <div className='col-span-1 lg:col-span-1'>
            <Link to='/' className='flex items-center gap-2 mb-6 inline-flex'>
              <div className='bg-primary text-white p-1.5 rounded-lg'>
                <Cross size={20} />
              </div>
              <span className='text-xl font-bold tracking-tight'>
                Medi<span className='text-primary'>Core</span>
              </span>
            </Link>
            <p className='text-surface-soft/70 text-sm leading-relaxed mb-6'>
              Pioneering the future of medicine through rigorous scientific research and
              uncompromising quality standards.
            </p>
            <div className='flex flex-col gap-3 text-sm text-surface-soft/80'>
              <div className='flex items-center gap-3'>
                <MapPin size={16} className='text-primary' />
                <span>100 Medical Parkway, Boston, MA 02115</span>
              </div>
              <div className='flex items-center gap-3'>
                <Phone size={16} className='text-primary' />
                <span>1-800-MEDICAL</span>
              </div>
              <div className='flex items-center gap-3'>
                <Mail size={16} className='text-primary' />
                <span>contact@medicore-science.com</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className='font-semibold text-lg mb-6'>Our Science</h4>
            <ul className='space-y-4 text-sm text-surface-soft/70'>
              <li>
                <Link to='#' className='hover:text-primary transition-colors'>
                  Clinical Trials
                </Link>
              </li>
              <li>
                <Link to='#' className='hover:text-primary transition-colors'>
                  Research Partners
                </Link>
              </li>
              <li>
                <Link to='#' className='hover:text-primary transition-colors'>
                  Quality Control
                </Link>
              </li>
              <li>
                <Link to='#' className='hover:text-primary transition-colors'>
                  Manufacturing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-semibold text-lg mb-6'>Products</h4>
            <ul className='space-y-4 text-sm text-surface-soft/70'>
              <li>
                <Link to='#' className='hover:text-primary transition-colors'>
                  CardioSupport™
                </Link>
              </li>
              <li>
                <Link to='#' className='hover:text-primary transition-colors'>
                  NeuroProtect™
                </Link>
              </li>
              <li>
                <Link to='#' className='hover:text-primary transition-colors'>
                  ImmunoDefense™
                </Link>
              </li>
              <li>
                <Link to='#' className='hover:text-primary transition-colors'>
                  Physician Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-semibold text-lg mb-6'>Legal</h4>
            <ul className='space-y-4 text-sm text-surface-soft/70'>
              <li>
                <Link to='#' className='hover:text-primary transition-colors'>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to='#' className='hover:text-primary transition-colors'>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to='#' className='hover:text-primary transition-colors'>
                  HIPAA Compliance
                </Link>
              </li>
              <li>
                <Link to='#' className='hover:text-primary transition-colors'>
                  Medical Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className='border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-surface-soft/50 text-center md:text-left'>
          <p>
            * These statements have not been evaluated by the Food and Drug Administration. This
            product is not intended to diagnose, treat, cure, or prevent any disease.
          </p>
          <p className='shrink-0'>
            &copy; {new Date().getFullYear()} MediCore Science. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
