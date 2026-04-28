import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FotoFlow - Vos Photos Instantanées',
    short_name: 'FotoFlow',
    description: 'Retrouvez instantanément vos photos d\'événements grâce à l\'IA.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#3B82F6',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
