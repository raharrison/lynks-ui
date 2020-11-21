import {SideNavItems, SideNavSection} from '@app/navigation/models';

export const sideNavSections: SideNavSection[] = [
  {
    text: 'CORE',
    items: ['entries', 'links', 'notes', 'groups'],
  },
  {
    text: 'INTERFACE',
    items: ['pages'],
  }
];

export const sideNavItems: SideNavItems = {
  entries: {
    icon: 'table',
    text: 'Entries',
    link: '/entries',
  },
  links: {
    icon: 'link',
    text: 'Links',
    link: '/entries/links',
  },
  notes: {
    icon: 'sticky-note',
    text: 'Notes',
    link: '/entries/notes',
  },
  groups: {
    icon: 'object-group',
    text: 'Groups',
    link: '/groups',
  },
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
