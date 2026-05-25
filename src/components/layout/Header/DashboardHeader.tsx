'use client';

// ua: Імпорти логіки, навігації та Zustand-стору
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthActions, useAuthUser } from '@/store/useAuthStore';
import { authService } from '@/services/auth.service';
import { getApiErrorMessage } from '@/utils/api-error';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faBell,
  faUserPlus,
  faChevronDown,
  faUser,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';

// ua: базовий хедер для сторінки Dashboard
export const DashboardHeader = () => {
  const router = useRouter();
  const user = useAuthUser(); // ua: дані юзера з стору
  const { clearAuth } = useAuthActions(); // ua: екшен для очищення стору

  // ua: стан для відкриття випадаючого меню профілю
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ua: реф для відстеження кліків поза межами випадаючого меню
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ua: ініціалізація аватару
  const getInitials = (nameString?: string) => {
    if (!nameString) return 'IN';
    const parts = nameString.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return nameString.slice(0, 2).toUpperCase();
  };

  // ua: мутація для безпечного виходу з системи (logout)
  const { mutate: handleLogout, isPending: isLoggingOut } = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: (data) => {
      clearAuth();
      toast.success(data.message || 'Logged out successfully');
      window.location.href = '/login'; // ua: повний редірект для очищення стану додатку
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      toast.error(message);
    },
  });

  // ua: обробник кліків поза межами випадаючого меню для його закриття

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // ua: якщо меню відкрите і клік відбувся по контейнеру dropdownRef
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    // ua: вішаємо прослух події на весь док браузера
    document.addEventListener('mousedown', handleClickOutside);

    // ua: видалення щоб не було витоку пам'яті
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background/50 px-6 backdrop-blur-md relative z-30">
      <div className="flex items-center gap-2 text-sm text-muted-foreground pl-12 md:pl-0 select-none">
        <span>Workspaces</span>
        <span className="text-border">/</span>
        <span className="font-medium text-foreground">infoNest Space</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="hidden sm:flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors cursor-pointer">
          <FontAwesomeIcon icon={faSearch} />
          <span>Search...</span>
          <kbd className="ml-2 rounded bg-background px-1.5 py-0.5 text-[10px] border border-border">
            Ctrl K
          </kbd>
        </button>

        <div className="relative cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
          <FontAwesomeIcon icon={faBell} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary border-2 border-background"></span>
        </div>

        <button className="hidden md:flex rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-all cursor-pointer">
          <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
          Invite
        </button>

        {/* ua: Меню користувача (Dropdown) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isLoggingOut}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer text-left select-none disabled:opacity-50"
          >
            <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shadow-sm shrink-0">
              {getInitials(user?.name)}
            </div>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`h-2.5 w-2.5 text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/*  ua: Контент випадаючого списку профілю  */}
          {isDropdownOpen && (
            <>
              <div
                onClick={() => setIsDropdownOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />

              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card p-1.5 shadow-2xl shadow-black/80 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                <div className="px-2.5 py-2 border-b border-border/50 mb-1">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {user?.email || 'email@example.com'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push('/profile');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                >
                  <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                  }}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <FontAwesomeIcon
                    icon={faRightFromBracket}
                    className="w-3.5 h-3.5"
                  />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
