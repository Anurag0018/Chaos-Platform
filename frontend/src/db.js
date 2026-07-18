import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured =
  supabaseUrl &&
  supabaseUrl !== 'your_supabase_project_url_here' &&
  supabaseUrl !== '' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your_supabase_anon_key_here' &&
  supabaseAnonKey !== '';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase environment variables are missing or default. Falling back to local/mock mode.'
  );
}

// --- Cookie Helpers ---

export function setCookie(name, value, days = 7) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  const isSecure = window.location.protocol === 'https:';
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax" + (isSecure ? "; Secure" : "");
}

export function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function eraseCookie(name) {
  const isSecure = window.location.protocol === 'https:';
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax' + (isSecure ? '; Secure' : '');
}

// --- Auth Helpers ---

export async function signInWithGitHub() {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured. Simulating GitHub Auth.');
    // Simulated auth: write a mock user to localStorage
    const mockUser = {
      id: 'mock-user-id',
      email: 'mock.operator@github.com',
      user_metadata: {
        avatar_url: 'https://github.com/github.png',
        user_name: 'Mock GitHub Operator',
        preferred_username: 'mock-operator',
      },
    };
    const mockSession = { user: mockUser, access_token: 'mock-jwt-token-12345', refresh_token: 'mock-refresh-token-67890' };
    localStorage.setItem('supabase.auth.token', JSON.stringify({ currentSession: mockSession }));
    localStorage.setItem('access_token', 'mock-jwt-token-12345');
    setCookie('access_token', 'mock-jwt-token-12345', 7);
    setCookie('refresh_token', 'mock-refresh-token-67890', 30);
    window.location.reload();
    return { data: { user: mockUser }, error: null };
  }
  return supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin,
    },
  });
}

export async function signOut() {
  localStorage.removeItem('access_token');
  eraseCookie('access_token');
  eraseCookie('refresh_token');
  if (!isSupabaseConfigured) {
    localStorage.removeItem('supabase.auth.token');
    window.location.reload();
    return { error: null };
  }
  return supabase.auth.signOut();
}

export async function getSession() {
  if (!isSupabaseConfigured) {
    const tokenStr = localStorage.getItem('supabase.auth.token');
    if (tokenStr) {
      try {
        const { currentSession } = JSON.parse(tokenStr);
        if (currentSession?.access_token) {
          localStorage.setItem('access_token', currentSession.access_token);
          setCookie('access_token', currentSession.access_token, 7);
        }
        if (currentSession?.refresh_token) {
          setCookie('refresh_token', currentSession.refresh_token, 30);
        }
        return { data: { session: currentSession }, error: null };
      } catch (e) {
        return { data: { session: null }, error: null };
      }
    }
    return { data: { session: null }, error: null };
  }
  const res = await supabase.auth.getSession();
  if (res.data?.session?.access_token) {
    localStorage.setItem('access_token', res.data.session.access_token);
    setCookie('access_token', res.data.session.access_token, 7);
    if (res.data.session.refresh_token) {
      setCookie('refresh_token', res.data.session.refresh_token, 30);
    }
  } else {
    localStorage.removeItem('access_token');
    eraseCookie('access_token');
    eraseCookie('refresh_token');
  }
  return res;
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured) {
    // Basic mock subscription using polling/events
    const checkAuth = () => {
      const tokenStr = localStorage.getItem('supabase.auth.token');
      if (tokenStr) {
        try {
          const { currentSession } = JSON.parse(tokenStr);
          if (currentSession?.access_token) {
            localStorage.setItem('access_token', currentSession.access_token);
            setCookie('access_token', currentSession.access_token, 7);
          }
          if (currentSession?.refresh_token) {
            setCookie('refresh_token', currentSession.refresh_token, 30);
          }
          callback('SIGNED_IN', currentSession);
          return;
        } catch (e) {}
      }
      localStorage.removeItem('access_token');
      eraseCookie('access_token');
      eraseCookie('refresh_token');
      callback('SIGNED_OUT', null);
    };
    
    // Initial check
    checkAuth();
    
    const interval = setInterval(checkAuth, 1000);
    return {
      data: {
        subscription: {
          unsubscribe: () => clearInterval(interval),
        },
      },
    };
  }
  return supabase.auth.onAuthStateChange((event, session) => {
    if (session?.access_token) {
      localStorage.setItem('access_token', session.access_token);
      setCookie('access_token', session.access_token, 7);
      if (session.refresh_token) {
        setCookie('refresh_token', session.refresh_token, 30);
      }
    } else {
      localStorage.removeItem('access_token');
      eraseCookie('access_token');
      eraseCookie('refresh_token');
    }
    callback(event, session);
  });
}

// --- Database Helpers ---

// 1. Experiments
export async function fetchExperiments(userId) {
  if (!isSupabaseConfigured) {
    const local = localStorage.getItem(`experiments_${userId}`);
    return local ? JSON.parse(local) : null;
  }

  const { data, error } = await supabase
    .from('experiments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function upsertExperiment(experiment, userId) {
  if (!isSupabaseConfigured) {
    const local = await fetchExperiments(userId) || [];
    const index = local.findIndex((e) => e.id === experiment.id);
    if (index > -1) {
      local[index] = { ...local[index], ...experiment };
    } else {
      local.unshift({ ...experiment, user_id: userId });
    }
    localStorage.setItem(`experiments_${userId}`, JSON.stringify(local));
    return experiment;
  }

  const { data, error } = await supabase
    .from('experiments')
    .upsert({
      id: experiment.id,
      user_id: userId,
      name: experiment.name,
      description: experiment.description,
      type: experiment.type,
      namespace: experiment.namespace,
      target: experiment.target,
      status: experiment.status,
      last_run: experiment.lastRun || experiment.last_run,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 2. Results
export async function fetchResults(userId) {
  if (!isSupabaseConfigured) {
    const local = localStorage.getItem(`results_${userId}`);
    return local ? JSON.parse(local) : null;
  }

  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function upsertResult(result, userId) {
  if (!isSupabaseConfigured) {
    const local = await fetchResults(userId) || [];
    const index = local.findIndex((r) => (r.runId || r.run_id) === (result.runId || result.run_id));
    if (index > -1) {
      local[index] = { ...local[index], ...result };
    } else {
      local.unshift({ ...result, user_id: userId });
    }
    localStorage.setItem(`results_${userId}`, JSON.stringify(local));
    return result;
  }

  const { data, error } = await supabase
    .from('results')
    .upsert({
      run_id: result.runId || result.run_id,
      user_id: userId,
      name: result.name,
      type: result.type,
      status: result.status,
      namespace: result.namespace,
      target: result.target,
      started_at: result.startedAt || result.started_at,
      duration: result.duration,
      impact: result.impact,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 3. Settings
export async function fetchSettings(userId) {
  if (!isSupabaseConfigured) {
    const local = localStorage.getItem(`settings_${userId}`);
    return local ? JSON.parse(local) : null;
  }

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  
  if (data) {
    // Map database snake_case to frontend camelCase
    return {
      successRate: data.success_rate,
      simulationSpeed: data.simulation_speed,
      autoHeal: data.auto_heal,
      voiceAlerts: data.voice_alerts,
    };
  }
  return null;
}

export async function saveSettings(settings, userId) {
  if (!isSupabaseConfigured) {
    localStorage.setItem(`settings_${userId}`, JSON.stringify(settings));
    return settings;
  }

  const { data, error } = await supabase
    .from('settings')
    .upsert({
      user_id: userId,
      success_rate: settings.successRate,
      simulation_speed: settings.simulationSpeed,
      auto_heal: settings.autoHeal,
      voice_alerts: settings.voiceAlerts,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
