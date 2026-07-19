import "./globals.css";
import ScrollTopButton from "@/components/ScrollTopButton";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata = {
  title: "Onkar Pest Control | Smart Protection. Safer Spaces.",
  description: "Professional pest control services for homes and businesses across Sangli and nearby areas.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <ScrollTopButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
