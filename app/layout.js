export const metadata = {
  title: "File Hosting",
  description: "Simple file hosting on Vercel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f2f4f8" }}>
        {children}
      </body>
    </html>
  );
}
