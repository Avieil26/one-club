import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #10211A;
  direction: rtl;
}
*::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
*::-webkit-scrollbar-track {
  background: #14120e;
}
*::-webkit-scrollbar-thumb {
  background: #8a7340;
  border-radius: 8px;
  border: 2px solid #14120e;
}
*::-webkit-scrollbar-button,
*::-webkit-scrollbar-button:single-button,
*::-webkit-scrollbar-button:vertical:decrement,
*::-webkit-scrollbar-button:vertical:increment,
*::-webkit-scrollbar-button:horizontal:decrement,
*::-webkit-scrollbar-button:horizontal:increment,
*::-webkit-scrollbar-button:start:decrement,
*::-webkit-scrollbar-button:end:increment,
*::-webkit-scrollbar-button:vertical:start:decrement,
*::-webkit-scrollbar-button:vertical:end:increment {
  display: none;
  width: 0;
  height: 0;
  background: transparent;
}`;
