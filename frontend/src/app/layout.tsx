'use client'
import "../app/globals.css";
import StoreProvider from "./storeProvider";
import Navbar from "../components/Navbar";
import Sidebar from "../components/sideBar";
import { useState, useEffect } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Navbar toggleSidebar={toggleSidebar} />
          <div className="flex min-h-screen">
            {isMobile && isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/60 z-30 md:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            <div
              className={`fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
              <Sidebar />
            </div>
            <main
              className={`flex-1 min-w-0 transition-[margin] duration-300 ease-in-out
                ${isSidebarOpen && !isMobile ? "md:ml-64" : "ml-0"}`}
            >
              {children}
            </main>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
