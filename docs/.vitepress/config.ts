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
         { text: 'Guide', link: '/installation-and-usage' },
         { text: 'Reference', link: '/helpers' },
      ],

      sidebar: [
         {
            text: 'Guide',
            items: [
               { text: 'Installation & Usage', link: '/installation-and-usage' },
               { text: 'Island Structure', link: '/island-structure' },
            ],
         },
         {
            text: 'Reference',
            items: [
               { text: 'Composables', link: '/composables' },
               { text: 'Helpers', link: '/helpers' },
               { text: 'Translations', link: '/translations' },
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
