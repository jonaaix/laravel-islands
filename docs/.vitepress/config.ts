import { defineConfig } from 'vitepress'

export default defineConfig({
   title: 'Laravel Islands',
   description: 'Elegant frontend islands for Laravel — framework-agnostic core with a Vue adapter.',
   base: '/laravel-islands/',
   cleanUrls: true,
   lastUpdated: true,

   head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/laravel-islands/logo.svg' }]],

   themeConfig: {
      logo: '/logo.svg',

      nav: [
         { text: 'Guide', link: '/introduction' },
         { text: 'Helpers', link: '/helpers' },
         { text: 'Datagrid', link: 'https://jonaaix.github.io/laravel-islands-datagrid/' },
      ],

      sidebar: [
         {
            text: 'Getting Started',
            items: [
               { text: 'Introduction', link: '/introduction' },
               { text: 'Installation', link: '/installation' },
               { text: 'Quickstart', link: '/quickstart' },
            ],
         },
         {
            text: 'Guide',
            items: [
               { text: 'Island Structure', link: '/structure' },
               { text: 'Mounting', link: '/mounting' },
               { text: 'Endpoints & Props', link: '/endpoints' },
               { text: 'Real-Time Models', link: '/realtime' },
               { text: 'Translations', link: '/translations' },
               { text: 'Configuration', link: '/configuration' },
            ],
         },
         {
            text: 'Reference',
            items: [
               { text: 'Composables', link: '/composables' },
               { text: 'UI Helpers', link: '/helpers' },
            ],
         },
      ],

      socialLinks: [
         { icon: 'github', link: 'https://github.com/jonaaix/laravel-islands' },
      ],

      footer: {
         message: 'Released under the MIT License.',
         copyright: 'Copyright © 2026 Jonas Gnioui',
      },

      search: {
         provider: 'local',
      },
   },
})
