import "../app/globals.css";
import StoreProvider from "./storeProvider";
import Navbar from "../components/Navbar";
export const Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Navbar  />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}