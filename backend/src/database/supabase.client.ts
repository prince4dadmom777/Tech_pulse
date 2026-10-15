import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { logger } from '../logging/logger.js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  if (config.supabase.isConfigured && config.supabase.url) {
    const key = config.supabase.serviceRoleKey || config.supabase.anonKey;
    if (key) {
      try {
        supabaseClient = createClient(config.supabase.url, key, {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        });
        logger.info(`Supabase client initialized successfully for: ${config.supabase.url}`);
      } catch (err: any) {
        logger.error(`Failed to initialize Supabase client: ${err.message}`);
      }
    }
  }

  return supabaseClient;
}

export async function checkSupabaseStatus(): Promise<{
  connected: boolean;
  url: string;
  tablesFound: boolean;
  message: string;
  details?: any;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      url: config.supabase.url || 'Not configured',
      tablesFound: false,
      message: 'Supabase credentials not configured or client initialization failed.'
    };
  }

  try {
    // Attempt to query a core table
    const { data, error } = await client.from('workspaces').select('id, name').limit(1);

    if (error) {
      // If error is relation does not exist or table not in schema cache (PGRST205)
      if (error.code === '42P01' || error.code === 'PGRST205' || error.message?.includes('relation') || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
        return {
          connected: true,
          url: config.supabase.url,
          tablesFound: false,
          message: 'Connected to Supabase successfully! The database tables need to be migrated. Run supabase/migrations/20250101000000_flowpilot_core.sql in your Supabase SQL Editor.',
          details: error.message
        };
      }

      return {
        connected: false,
        url: config.supabase.url,
        tablesFound: false,
        message: `Supabase query returned error: ${error.message}`,
        details: error
      };
    }

    return {
      connected: true,
      url: config.supabase.url,
      tablesFound: true,
      message: 'Successfully connected to live Supabase PostgreSQL database with active schema.',
      details: { sampleWorkspaceCount: data ? data.length : 0 }
    };
  } catch (err: any) {
    return {
      connected: false,
      url: config.supabase.url,
      tablesFound: false,
      message: `Failed to reach Supabase: ${err.message}`,
      details: err
    };
  }
}

export async function syncTableToSupabase(table: string, records: any[]): Promise<{ count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client || records.length === 0) return { count: 0 };

  try {
    const { error } = await client.from(table).upsert(records, { onConflict: 'id' });
    if (error) {
      return { count: 0, error: error.message };
    }
    return { count: records.length };
  } catch (err: any) {
    return { count: 0, error: err.message };
  }
}
