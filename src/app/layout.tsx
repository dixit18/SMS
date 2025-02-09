// import { Inter } from 'next/font/google'
// import CssBaseline from '@mui/material/CssBaseline'
// import "./globals.css"
// import { getSession } from './lib/auth'
// import Sidebar from "./components/SideBar"
// import Header from "./components/Header"
// import React from 'react'; // Added import for React
// import { redirect } from 'next/navigation'

// const inter = Inter({ subsets: ["latin"] })

// export const metadata = {
//   title: "Stock Management System",
//   description: "Manage your inventory, customers and invoices",
// }

// export default async function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const session = await getSession();

//   if (!session) {
//     redirect('/login'); 
//   }

//   return (
//     <html lang="en">
//       <body className={inter.className}>
//           <CssBaseline />
//           {session ? (
//             <div className="flex h-screen">
//               <Sidebar />
//               <div className="flex-1 flex flex-col overflow-hidden">
//                 <Header />
//                 <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
//                   {children}
//                 </main>
//               </div>
//             </div>
//           ) : (
//             children
//           )}
//       </body>
//     </html>
//   )
// }
import { Inter } from 'next/font/google'
import CssBaseline from '@mui/material/CssBaseline'
import "./globals.css"
import Sidebar from "./components/SideBar"
import Header from "./components/Header"
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
