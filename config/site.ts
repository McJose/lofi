export const SITE_CONFIG = {
  navigation: [
    { name: 'Home', href: '/' },
    { name: 'Lost Items', href: '/lost-items' },
    { name: 'Found Items', href: '/found-items' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ],
  appNavigation: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'My Items', href: '/my-items' },
    { name: 'Report Lost', href: '/report/lost' },
    { name: 'Report Found', href: '/report/found' },
  ],
  authNavigation: [
    { name: 'Login', href: '/login' },
    { name: 'Sign Up', href: '/signup', isPrimary: true },
  ],
  footerLinks: {
    company: [
      { name: 'About', href: '/about' },
      { name: 'Team', href: '/team' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Safety', href: '/safety' },
      { name: 'Community Guidelines', href: '/guidelines' },
      { name: 'Contact Us', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
    ],
  },
} as const;
