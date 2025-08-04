import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";   // <-- ✅ import your global CSS here

import { ReactNode } from "react";

export const metadata = {
  title: "ADmyBRAND Dashboard",
  description: "Analytics Dashboard",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Font for modern look */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-dark text-light">{children}</body>
    </html>
  );
}

