import { SupabaseClient } from '@supabase/supabase-js';
export declare function getSupabaseClient(): SupabaseClient | null;
export declare function checkSupabaseStatus(): Promise<{
    connected: boolean;
    url: string;
    tablesFound: boolean;
    message: string;
    details?: any;
}>;
export declare function syncTableToSupabase(table: string, records: any[]): Promise<{
    count: number;
    error?: string;
}>;
//# sourceMappingURL=supabase.client.d.ts.map