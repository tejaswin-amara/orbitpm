import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";

export const metadata: Metadata = {
  title: "OrbitPM — Project management without the infrastructure tax",
  description: "Vercel-native project management for focused teams.",
};

const themeInitScript = `(function(){try{var s=localStorage.getItem('orbitpm-theme');var l=window.matchMedia('(prefers-color-scheme: light)').matches;var t='dark';if(s==='light'){t='light';}else if(s==='system'){t=l?'light':'dark';}else{t='dark';}if(t==='dark'){document.documentElement.classList.add('dark');document.documentElement.classList.remove('light');}else{document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <head>
        <script id="orbitpm-theme-init">{themeInitScript}</script>
      </head>
      <body className="spatial-root selection:bg-orbit-indigo/30 selection:text-white">
        <ThemeProvider>
          {children}
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
