export default function SiteLightLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-bone text-ink">
      {children}
    </div>
  );
}
