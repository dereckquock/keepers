import { Analytics } from '@vercel/analytics/react';
import '../styles/globals.css';

export const metadata = {
  title: '🏈🐶💯',
  description: 'Fantasy football keepers & weekly scores',
};

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
