import React from 'react';
import { ThemeToggle } from './ThemeToggle';

export const Header = () => (
  <header className="header flex items-center justify-between p-4 bg-white shadow-md">
    <h1 className="text-2xl font-bold">GlobalTrade Dashboard</h1>
    <ThemeToggle />
  </header>
);
