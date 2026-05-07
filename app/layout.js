import './globals.css';
export const metadata = { title: '🗝️ Macaroom Dashboard' };
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
