import "bootstrap/dist/css/bootstrap.min.css";
import { ReactNode } from "react";

export const metadata = {
  title: "ADmyBRAND Dashboard",
  description: "Analytics Dashboard",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-dark text-light">{children}</body>
    </html>
  );
}

