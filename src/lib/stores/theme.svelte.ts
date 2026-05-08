class ThemeStore {
  isDark = $state(false);

  constructor() {
    if (typeof window !== 'undefined') {
      // Restore from localStorage first, then check document class
      const stored = localStorage.getItem('theme');
      if (stored === 'dark') {
        this.isDark = true;
        document.documentElement.classList.add('dark');
      } else if (stored === 'light') {
        this.isDark = false;
        document.documentElement.classList.remove('dark');
      } else {
        // No stored preference: detect from the class set by the inline script in app.html
        // (which checks both localStorage and prefers-color-scheme)
        this.isDark = document.documentElement.classList.contains('dark');
        // Persist the detected preference so it survives future visits
        localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
      }
    }
  }

  toggle() {
    this.isDark = !this.isDark;
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', this.isDark);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
    }
  }

  setDark(dark: boolean) {
    this.isDark = dark;
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', dark);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    }
  }
}

export const themeStore = new ThemeStore();
