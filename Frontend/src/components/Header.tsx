import { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Card Game', path: '/game1' },
        { name: 'Space Shooter', path: '/game2' },
        { name: 'Storybook', path: '/story' },
        { name: 'Dashboard', path: '/dashboard' }
    ];

    const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
        return `relative font-anglo-japanese px-3 py-2 transition-colors duration-300 ${
            isActive ? 'text-primary-button' : 'text-primary-foreground hover:text-pink-primary'
        } group`;
    };

    const getMobileNavLinkClass = ({ isActive }: { isActive: boolean }) => {
        return `block px-4 py-3 font-anglo-japanese transition-colors duration-300 ${
            isActive ? 'bg-primary-background/50 text-primary-button' : 'text-primary-foreground hover:bg-primary-background/30 hover:text-pink-primary'
        }`;
    };

    return (
        <header className="absolute top-0 left-0 w-full h-20 z-50 flex items-center justify-between px-6 bg-primary-background/40 backdrop-blur-md shadow-lg border-b border-primary-foreground/10">
            {/* Logo */}
            <div className="flex-shrink-0">
                <NavLink to="/" className="text-2xl font-anglo-japanese font-bold bg-gradient-to-r from-pink-primary to-blue-primary bg-clip-text text-transparent drop-shadow-sm">
                    日本語 Lab
                </NavLink>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
                {navLinks.map((link) => (
                    <NavLink key={link.path} to={link.path} className={getNavLinkClass}>
                        {({ isActive }) => (
                            <>
                                {link.name}
                                <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-pink-primary to-blue-primary transform transition-transform duration-300 ${
                                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                } origin-left`}></span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-primary-foreground hover:text-pink-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-primary rounded-md p-2 transition-colors relative w-10 h-10 flex items-center justify-center"
                    aria-expanded={isMobileMenuOpen}
                >
                    <span className="sr-only">Open main menu</span>
                    {/* Hamburger Icon */}
                    <svg className={`absolute h-6 w-6 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    {/* Close Icon */}
                    <svg className={`absolute h-6 w-6 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Mobile Dropdown Navigation */}
            <div className={`absolute top-20 left-0 w-full bg-primary-background/95 backdrop-blur-xl border-b border-primary-foreground/10 shadow-xl overflow-hidden transition-all duration-300 origin-top ${
                isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
            } md:hidden`}>
                <nav className="flex flex-col py-2">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={getMobileNavLinkClass}
                        >
                            {link.name}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </header>
    );
}