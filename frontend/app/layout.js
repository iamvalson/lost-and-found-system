import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Found — Campus Lost & Found',
  description: 'The official lost and found platform for campus students and staff. Report lost items, find what was found, and reconnect with your belongings.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

