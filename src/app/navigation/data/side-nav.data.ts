import {SideNavItems, SideNavSection} from '@app/navigation/models';

export const sideNavSections: SideNavSection[] = [
  {
    text: 'INTERFACE',
    items: ['pages'],
  }
];

export const sideNavItems: SideNavItems = {
  pages: {
    icon: 'book-open',
    text: 'Pages',
    submenu: [
      {
        text: 'Authentication',
        submenu: [
          {
            text: 'Login',
            link: '/auth/login',
          },
          {
            text: 'Register',
            link: '/auth/register',
          },
          {
            text: 'Forgot Password',
            link: '/auth/forgot-password',
          },
        ],
      },
      {
        text: 'Error',
        submenu: [
          {
            text: '401 Page',
            link: '/error/401',
          },
          {
            text: '404 Page',
            link: '/error/404',
          },
          {
            text: '500 Page',
            link: '/error/500',
          },
        ],
      },
    ],
  }
};
