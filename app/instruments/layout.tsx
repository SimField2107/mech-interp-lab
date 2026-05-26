import { TopBar, LeftRail, StatusBar } from "@/components/chrome";
import { DesktopGate } from "@/components/ui";

export default function InstrumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DesktopGate minWidth={1024}>
      <div className="h-screen flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 flex min-h-0">
          <LeftRail />
          <main className="flex-1 overflow-hidden bg-surface-0">{children}</main>
        </div>
        <StatusBar />
      </div>
    </DesktopGate>
  );
}
