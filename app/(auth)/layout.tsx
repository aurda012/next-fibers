import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "../globals.css";

export const metadata = {
  title: "Fibers",
  description: "A NextJS Meta Threads Application",
};

const inter = Inter({ subsets: ["latin"] });

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-dark-1`}>
          <main className="mx-auto flex max-w-xl flex-col justify-start px-10 py-20">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
