import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 py-6 md:px-8 md:py-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
