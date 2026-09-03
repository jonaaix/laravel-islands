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
         { text: 'UI Helpers', link: '/helpers/' },
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
            text: 'The Basics',
            items: [
               { text: 'Directory Structure', link: '/directory-structure' },
               { text: 'Mounting Islands', link: '/mounting' },
               { text: 'Props', link: '/props' },
               { text: 'Routes & Controllers', link: '/routes-and-controllers' },
               { text: 'Real-Time Models', link: '/realtime' },
               { text: 'Translations', link: '/translations' },
               { text: 'Configuration', link: '/configuration' },
            ],
         },
         {
            text: 'Frontend',
            items: [
               { text: 'Composables', link: '/composables' },
               { text: 'Layout & Styling', link: '/styling' },
            ],
         },
         {
            text: 'UI Helpers',
            items: [
               { text: 'Overview & Icons', link: '/helpers/' },
               { text: 'Buttons & Fields', link: '/helpers/buttons-and-fields' },
               { text: 'Selects & Inline Editing', link: '/helpers/selects-and-editing' },
               { text: 'Overlays & Display', link: '/helpers/overlays-and-display' },
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
