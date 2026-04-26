import { Suspense } from 'react';
import { Outlet } from 'react-router';

export default function MainLayout() {
  return (
    <Suspense>
      <Outlet />
    </Suspense>
  );
}