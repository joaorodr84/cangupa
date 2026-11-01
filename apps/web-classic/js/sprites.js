// The kangaroo, drawn as inline SVG. `side` faces right; the UI mirrors it for left.
const ROO = {
  side: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#5a3515" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">
    <path d="M30 70 C16 74 8 84 4 94 C14 92 28 86 38 80 Z" fill="#c98b4a"/>
    <ellipse cx="55" cy="12" rx="4.5" ry="11" transform="rotate(-12 55 12)" fill="#b57535"/>
    <path d="M34 78 C26 60 34 40 50 36 C62 34 68 46 66 60 C64 72 56 82 44 84 Z" fill="#d9954f"/>
    <path d="M56 46 C64 52 63 68 54 78 C50 68 50 54 56 46 Z" fill="#f3d6a6" stroke="none"/>
    <path d="M52 64 C56 70 62 68 63 63" fill="none" stroke="#a9733a" stroke-width="1.8"/>
    <path d="M50 38 C48 26 56 18 66 20 C74 22 82 30 84 36 C82 40 74 40 70 42 C62 46 54 46 50 38 Z" fill="#d9954f"/>
    <ellipse cx="62" cy="14" rx="4.5" ry="11" transform="rotate(10 62 14)" fill="#d9954f"/>
    <ellipse cx="62.5" cy="15" rx="1.8" ry="7" transform="rotate(10 62 14)" fill="#f3b9a0" stroke="none"/>
    <path d="M32 66 C26 78 34 90 44 88 C56 86 60 78 54 72 C48 66 38 62 32 66 Z" fill="#c98b4a"/>
    <path d="M40 88 L74 90 C80 90 80 96 74 96 L36 96 C32 96 32 90 40 88 Z" fill="#b57535"/>
    <path d="M62 52 C70 54 74 58 76 62" fill="none" stroke-width="4.5"/>
  </g>
  <circle cx="68" cy="29" r="2.6" fill="#fff" stroke="#5a3515" stroke-width="1"/>
  <circle cx="69" cy="29.5" r="1.3" fill="#111"/>
  <ellipse cx="83.5" cy="35" rx="2.4" ry="1.8" fill="#3b2410"/>
</svg>`,

  front: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#5a3515" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="37" cy="13" rx="4.8" ry="11" transform="rotate(-14 37 13)" fill="#d9954f"/>
    <ellipse cx="63" cy="13" rx="4.8" ry="11" transform="rotate(14 63 13)" fill="#d9954f"/>
    <ellipse cx="37" cy="14" rx="1.9" ry="7" transform="rotate(-14 37 13)" fill="#f3b9a0" stroke="none"/>
    <ellipse cx="63" cy="14" rx="1.9" ry="7" transform="rotate(14 63 13)" fill="#f3b9a0" stroke="none"/>
    <path d="M50 38 C32 40 26 62 30 76 C34 88 66 88 70 76 C74 62 68 40 50 38 Z" fill="#d9954f"/>
    <ellipse cx="29" cy="76" rx="9" ry="13" fill="#c98b4a"/>
    <ellipse cx="71" cy="76" rx="9" ry="13" fill="#c98b4a"/>
    <path d="M50 46 C38 48 36 66 40 78 C44 86 56 86 60 78 C64 66 62 48 50 46 Z" fill="#f3d6a6" stroke="none"/>
    <path d="M42 68 C46 74 54 74 58 68" fill="none" stroke="#a9733a" stroke-width="1.8"/>
    <path d="M32 50 C26 54 26 60 30 64" fill="none" stroke-width="4.5"/>
    <path d="M68 50 C74 54 74 60 70 64" fill="none" stroke-width="4.5"/>
    <ellipse cx="50" cy="26" rx="17" ry="15" fill="#d9954f"/>
    <ellipse cx="50" cy="32" rx="9" ry="7" fill="#f3d6a6" stroke="none"/>
    <path d="M14 94 C14 86 30 86 34 90 C36 96 30 98 22 98 C16 98 14 96 14 94 Z" fill="#b57535"/>
    <path d="M86 94 C86 86 70 86 66 90 C64 96 70 98 78 98 C84 98 86 96 86 94 Z" fill="#b57535"/>
  </g>
  <circle cx="43" cy="23" r="2.6" fill="#fff" stroke="#5a3515" stroke-width="1"/>
  <circle cx="57" cy="23" r="2.6" fill="#fff" stroke="#5a3515" stroke-width="1"/>
  <circle cx="43.4" cy="23.6" r="1.3" fill="#111"/><circle cx="56.6" cy="23.6" r="1.3" fill="#111"/>
  <ellipse cx="50" cy="29.5" rx="3.2" ry="2.2" fill="#3b2410"/>
  <path d="M50 31.5 V34.5 M46.5 35 C48.5 37 51.5 37 53.5 35" fill="none" stroke="#5a3515" stroke-width="1.3" stroke-linecap="round"/>
</svg>`,

  back: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#5a3515" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="37" cy="13" rx="4.8" ry="11" transform="rotate(-14 37 13)" fill="#c98b4a"/>
    <ellipse cx="63" cy="13" rx="4.8" ry="11" transform="rotate(14 63 13)" fill="#c98b4a"/>
    <path d="M50 38 C32 40 26 62 30 76 C34 88 66 88 70 76 C74 62 68 40 50 38 Z" fill="#d9954f"/>
    <path d="M50 70 C40 74 38 88 36 98 L64 98 C62 88 60 74 50 70 Z" fill="#c98b4a"/>
    <path d="M50 76 V96" fill="none" stroke="#a9733a" stroke-width="1.6"/>
    <ellipse cx="29" cy="76" rx="9" ry="13" fill="#c98b4a"/>
    <ellipse cx="71" cy="76" rx="9" ry="13" fill="#c98b4a"/>
    <ellipse cx="50" cy="26" rx="17" ry="15" fill="#d9954f"/>
    <path d="M14 94 C14 86 30 86 34 90 C36 96 30 98 22 98 C16 98 14 96 14 94 Z" fill="#b57535"/>
    <path d="M86 94 C86 86 70 86 66 90 C64 96 70 98 78 98 C84 98 86 96 86 94 Z" fill="#b57535"/>
  </g>
</svg>`,
};
