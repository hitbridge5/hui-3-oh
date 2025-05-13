import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';

export const metadata = {
  title: 'HUI',
  description: 'Internal AI Builder',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-black dark:bg-black dark:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
