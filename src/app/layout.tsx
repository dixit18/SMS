
import { Inter } from 'next/font/google'
import CssBaseline from '@mui/material/CssBaseline'
import "./globals.css"
import { getSession } from "./lib/auth"
import SessionGuard from "./components/SessionGuard"
import LayoutWrapper from './components/LayoutWrapper'

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Stock Management System",
  description: "Manage your inventory, customers and invoices",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <CssBaseline />
        <SessionGuard session={session}>
          <LayoutWrapper>{children}</LayoutWrapper>
        </SessionGuard>
      </body>
    </html>
  );
}
