// Settings, saved in localStorage. Rules live here so the UI never hard-codes them.
const DEFAULT_SETTINGS = {
  theme: 'cosmos',
  jumps: true,   // rule option: allow jumping two tiles in a straight line
  hints: true,   // highlight the tiles you can move to
  anim: true,
  fall: false,   // rule option: a direction/tap with no step or jump falls, restarting the level
};

const THEMES = ['cosmos', 'space', 'sand', 'ice', 'classic'];

const Settings = {
  key: 'cangupa.settings',
  load() {
    try {
      const s = { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(this.key) || '{}') };
      if (!THEMES.includes(s.theme)) s.theme = DEFAULT_SETTINGS.theme; // e.g. a theme that was renamed
      return s;
    } catch { return { ...DEFAULT_SETTINGS }; }
  },
  save(s) {
    try { localStorage.setItem(this.key, JSON.stringify(s)); } catch {}
  },
};

// Which levels have been cleared, and the level to resume.
const Progress = {
  key: 'cangupa.progress',
  load() {
    try {
      const p = JSON.parse(localStorage.getItem(this.key) || '{}');
      return { done: Array.isArray(p.done) ? p.done : [], level: +p.level || 0 };
    } catch { return { done: [], level: 0 }; }
  },
  save(p) {
    try { localStorage.setItem(this.key, JSON.stringify(p)); } catch {}
  },
};
