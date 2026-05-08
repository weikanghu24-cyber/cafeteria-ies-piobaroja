import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { SideNav } from './SideNav';

export function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24 md:pb-12">
        <div className="flex gap-8">
          <SideNav />
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
