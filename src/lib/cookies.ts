/**
 * cookies.ts
 * إدارة ملفات تعريف الارتباط (Cookies) والتزامن الشامل مع LocalStorage
 * لضمان استمرارية تسجيل الدخول، الاسم الرباعي، الصف الدراسي، الستريك، ونقاط الخبرة عبر جميع الجلسات.
 *
 * © SciNexa Platform — ISEF 2026
 */

/**
 * ضبط قيمة كوكيز مع مدة صلاحية محددة بالأيام (الافتراضي سنة كاملة 365 يوماً)
 */
export function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const safeName = encodeURIComponent(name);
  const safeValue = encodeURIComponent(value);
  document.cookie = `${safeName}=${safeValue}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * قراءة قيمة كوكي بالاسم
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const target = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.indexOf(target) === 0) {
      try {
        return decodeURIComponent(trimmed.substring(target.length));
      } catch {
        return trimmed.substring(target.length);
      }
    }
  }
  return null;
}

/**
 * حذف كوكي بالاسم
 */
export function removeCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

/**
 * قراءة قيمة محفوظة متزامنة (تفحص LocalStorage أولاً، ثم Cookies، وتزامن بينهما)
 */
export function getPersistedItem(key: string, fallback = ''): string {
  if (typeof window === 'undefined') return fallback;
  try {
    const fromLocal = localStorage.getItem(key);
    if (fromLocal !== null && fromLocal !== '') {
      // مزامنة الكوكي تلقائياً
      setCookie(key, fromLocal);
      return fromLocal;
    }
    const fromCookie = getCookie(key);
    if (fromCookie !== null && fromCookie !== '') {
      // استعادة في LocalStorage
      localStorage.setItem(key, fromCookie);
      return fromCookie;
    }
  } catch {
    /* fallback to cookies if localStorage blocked */
    const fromCookie = getCookie(key);
    if (fromCookie) return fromCookie;
  }
  return fallback;
}

/**
 * حفظ قيمة متزامنة في كل من LocalStorage وملفات الكوكيز معاً
 */
export function setPersistedItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore localStorage errors */
  }
  try {
    setCookie(key, value);
  } catch {
    /* ignore cookie errors */
  }
}

/**
 * إزالة قيمة من كل من LocalStorage والكوكيز
 */
export function removePersistedItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
  try {
    removeCookie(key);
  } catch {
    /* ignore */
  }
}

/**
 * قراءة كائن JSON محفوظ من الكوكيز أو LocalStorage
 */
export function getPersistedJSON<T>(key: string, fallback: T): T {
  const raw = getPersistedItem(key, '');
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * حفظ كائن JSON متزامن في الكوكيز و LocalStorage
 */
export function setPersistedJSON<T>(key: string, value: T): void {
  try {
    const str = JSON.stringify(value);
    setPersistedItem(key, str);
  } catch {
    /* ignore */
  }
}
