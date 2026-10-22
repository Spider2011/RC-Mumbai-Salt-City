/** The narrow centred column used by the portal's own pages (the tracker uses the full width). */
export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-28">
      <div className="mx-auto w-full max-w-3xl">{children}</div>
    </div>
  );
}
