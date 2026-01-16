import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router';

export default function Layout() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="px-6 pt-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight">
            <Link to="/" className="text-primary hover:text-primary/90 transition-colors">
              GeorgCodeTemplate
            </Link>
          </h1>
        </div>
      </header>

      <main className="px-6 pb-10">
        <div className="mx-auto max-w-3xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}