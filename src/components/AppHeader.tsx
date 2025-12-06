import { useEffect, useState } from 'react';

type MeResponse = { user?: { id?: number; email?: string; name?: string; picture_url?: string } };

const AppHeader = () => {
  const [user, setUser] = useState<MeResponse['user'] | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/auth/me', { credentials: 'include' });
        if (!res.ok) return;
        const data: MeResponse = await res.json();
        if (data?.user) setUser(data.user);
      } catch { /* ignore */ }
    };
    fetchUser();
  }, []);

  const getInitial = (email?: string, name?: string) => (name || email || '?').charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
    } catch { /* ignore */ }
    window.location.href = '/auth/login';
  };

  const title = '입시 정보';

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-indigo-700 via-purple-600 to-fuchsia-600 shadow-lg">
      <div className="px-4 lg:px-6">
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-sm font-semibold transition-colors"
            >
              홈
            </a>
            <div className="leading-tight">
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-semibold">Homegroup</div>
              <div className="text-lg lg:text-xl font-extrabold">{title}</div>
            </div>
          </div>

          <div className="relative">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => setOpen((o) => !o)}
                  className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-white/30 border border-white/40 overflow-hidden flex items-center justify-center text-sm font-bold">
                    {user.picture_url ? (
                      <img src={user.picture_url} alt="profile" className="w-full h-full object-cover" />
                    ) : (
                      getInitial(user.email, user.name)
                    )}
                  </div>
                  <span className="text-sm font-semibold">{user.name || user.email}</span>
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-xl shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="text-sm font-semibold">{user.name || '사용자'}</div>
                      <div className="text-xs text-slate-500 break-all">{user.email}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-100"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </>
            ) : (
              <a
                href="/auth/login"
                className="inline-flex items-center px-3 py-2 rounded-lg bg-white text-indigo-700 font-semibold hover:bg-slate-100 transition-colors"
              >
                로그인
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
