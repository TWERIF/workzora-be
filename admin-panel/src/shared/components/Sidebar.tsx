import { Button } from '@/components/ui/button';
import { logout } from '@/pages/auth/model/api';
import {
  ListTree,
  Menu,
  MessageCircle,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
}

const menuItems: MenuItem[] = [
  { title: 'Категорії', path: '/categories', icon: ListTree },
  { title: 'Чати', path: '/chats', icon: MessageCircle },
];

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const activeLink = "bg-blue-600 text-white shadow-lg shadow-blue-500/30";
  const normalLink =
    "text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200";

  return (
    <>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="
          fixed top-4 left-4 z-[60]
          p-2 rounded-lg
          bg-gray-900 text-white
          hover:bg-gray-800
          transition
        "
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div
          className="
            fixed inset-0
            bg-black/50
            z-40
          "
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0
          z-50
          h-screen
          w-64
          bg-white
          border-r border-gray-800
          transition-transform duration-300 ease-in-out

          ${isOpen
            ? "translate-x-0 py-10"
            : "-translate-x-full"
          }
        `}
      >
        <div className="p-6 px-[30px] flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight">
            AdminPanel
          </h1>
        </div>

        <nav className="mt-4 px-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3
                p-3 rounded-xl
                font-medium

                ${isActive ? activeLink : normalLink}
              `}
            >
              <item.icon size={20} />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>

        <div
          className="
            absolute bottom-0
            w-full
            p-6
            border-t border-gray-800
            flex flex-col gap-3
          "
        >
          <div className="flex items-center gap-3">
            <div className="
              w-10 h-10 rounded-full
              bg-gradient-to-tr from-blue-500 to-purple-500
            "/>

            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">
                Admin User
              </p>
              <p className="text-xs text-gray-500 truncate">
                admin@example.com
              </p>
            </div>
          </div>

          <Button variant="destructive" onClick={logout}>
            Вийти
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;