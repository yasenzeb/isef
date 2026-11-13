/**
 * labTracker.ts
 * نظام التتبع الفعلي الصارم لوقت وتجارب المعامل ثلاثية الأبعاد (Zero Fake Data)
 * يسجل الثواني الحقيقية التي يقضيها المستخدم داخل المعامل ويحفظها مع الحساب.
 *
 * © SciNexa Platform — ISEF 2026
 */

import { useEffect, useRef } from 'react';
import { getPersistedItem, setPersistedItem, getPersistedJSON, setPersistedJSON } from './cookies';
import { getUserScopedKey, getScopedUserProfile, saveScopedUserProfile } from './userStorage';
import { dbSyncStudentProgress } from './supabase';

export interface RealLabStats {
  totalSeconds: number;
  totalHours: string;
  exploredLabs: string[];
  exploredCount: number;
  sessionsCount: number;
}

const DAILY_SECONDS_KEY = 'scinexa_daily_lab_seconds';

export function getWeeklyLabMinutes(): { isoDate: string; dayIndex: number; minutes: number }[] {
  const daily = getPersistedJSON<Record<string, number>>(DAILY_SECONDS_KEY, {});
  const result: { isoDate: string; dayIndex: number; minutes: number }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const isoDate = d.toISOString().slice(0, 10);
    const secs = typeof daily[isoDate] === 'number' ? daily[isoDate] : 0;
    result.push({
      isoDate,
      dayIndex: d.getDay(), // 0=Sun..6=Sat
      minutes: secs > 0 ? Math.max(1, Math.round(secs / 60)) : 0,
    });
  }
  return result;
}

export function getRealLabStats(emailOrId?: string | null): RealLabStats {
  const email = emailOrId || (typeof localStorage !== 'undefined' ? localStorage.getItem('scinexa_active_user_email') : '') || '';
  const scoped = email ? getScopedUserProfile(email) : null;

  const totalSeconds = scoped?.totalLabSeconds ?? parseInt(getPersistedItem('scinexa_total_lab_seconds', '0'), 10);
  const exploredLabs = scoped?.exploredLabs ?? getPersistedJSON<string[]>('scinexa_explored_labs', []);
  const sessionsCount = scoped?.sessionsCount ?? parseInt(getPersistedItem('scinexa_lab_sessions_count', '0'), 10);

  const hoursNum = totalSeconds / 3600;
  const totalHours = hoursNum < 0.1 && totalSeconds > 0 ? '0.1' : hoursNum.toFixed(1);

  return {
    totalSeconds,
    totalHours,
    exploredLabs,
    exploredCount: exploredLabs.length,
    sessionsCount,
  };
}

export function addLabTime(emailOrId: string | null | undefined, secondsToAdd: number, currentLabId?: string): void {
  if (secondsToAdd <= 0) return;
  const email = emailOrId || (typeof localStorage !== 'undefined' ? localStorage.getItem('scinexa_active_user_email') : '') || '';
  const current = getRealLabStats(email);

  const nextSeconds = current.totalSeconds + secondsToAdd;
  const nextExplored = currentLabId && !current.exploredLabs.includes(currentLabId)
    ? [...current.exploredLabs, currentLabId]
    : current.exploredLabs;

  setPersistedItem('scinexa_total_lab_seconds', String(nextSeconds));
  setPersistedJSON('scinexa_explored_labs', nextExplored);

  const todayKey = new Date().toISOString().slice(0, 10);
  const daily = getPersistedJSON<Record<string, number>>(DAILY_SECONDS_KEY, {});
  const nextDaily = { ...daily, [todayKey]: (typeof daily[todayKey] === 'number' ? daily[todayKey] : 0) + secondsToAdd };
  setPersistedJSON(DAILY_SECONDS_KEY, nextDaily);

  if (email) {
    saveScopedUserProfile(email, {
      totalLabSeconds: nextSeconds,
      exploredLabs: nextExplored,
    });
  }

  try {
    window.dispatchEvent(new CustomEvent('scinexa_lab_time_updated', {
      detail: { totalSeconds: nextSeconds, totalHours: (nextSeconds / 3600).toFixed(1), exploredCount: nextExplored.length }
    }));
  } catch {
    /* ignore */
  }
}

export function recordLabSessionStart(emailOrId: string | null | undefined, labId: string): void {
  const email = emailOrId || (typeof localStorage !== 'undefined' ? localStorage.getItem('scinexa_active_user_email') : '') || '';
  const current = getRealLabStats(email);

  const nextSessions = current.sessionsCount + 1;
  const nextExplored = !current.exploredLabs.includes(labId)
    ? [...current.exploredLabs, labId]
    : current.exploredLabs;

  setPersistedItem('scinexa_lab_sessions_count', String(nextSessions));
  setPersistedJSON('scinexa_explored_labs', nextExplored);

  if (email) {
    saveScopedUserProfile(email, {
      sessionsCount: nextSessions,
      exploredLabs: nextExplored,
    });
  }

  try {
    window.dispatchEvent(new CustomEvent('scinexa_lab_time_updated', {
      detail: { sessionsCount: nextSessions, exploredCount: nextExplored.length }
    }));
  } catch {
    /* ignore */
  }
}

/**
 * Hook يتتبع مدة البقاء الحقيقية داخل المعمل بدقة
 */
export function useLabActiveTracker(labId?: string, userEmail?: string | null): void {
  const accumulatedRef = useRef(0);

  useEffect(() => {
    if (!labId) return;
    recordLabSessionStart(userEmail, labId);

    const interval = setInterval(() => {
      accumulatedRef.current += 5;
      addLabTime(userEmail, 5, labId);
    }, 5000);

    return () => {
      clearInterval(interval);
      if (accumulatedRef.current > 0 && userEmail) {
        const xp = parseInt(getPersistedItem(getUserScopedKey(userEmail, 'scinexa_user_xp')) || getPersistedItem('scinexa_user_xp') || '0', 10) || undefined;
        const stars = parseInt(getPersistedItem(getUserScopedKey(userEmail, 'scinexa_user_stars')) || getPersistedItem('scinexa_user_stars') || '0', 10) || undefined;
        const streak = parseInt(getPersistedItem(getUserScopedKey(userEmail, 'scinexa_real_streak')) || getPersistedItem('scinexa_real_streak') || '1', 10) || undefined;
        void dbSyncStudentProgress({
          email: userEmail,
          xp,
          stars,
          streak,
        });
      }
    };
  }, [labId, userEmail]);
}
