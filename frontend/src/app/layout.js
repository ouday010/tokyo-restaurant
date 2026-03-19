import './globals.css';
import { CartProvider } from '@/components/CartContext';

export const metadata = {
  title: 'Tokyo Healthy & Tacos | Fresh, Healthy & Delicious',
  description: 'Experience the fusion of Japanese healthy cuisine and vibrant tacos. Fresh ingredients, bold flavors.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
