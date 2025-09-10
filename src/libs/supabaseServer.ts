import { createClient } from "@supabase/supabase-js"

import type { Database } from "@src/types/database-generated"
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "@src/utils/environment"

export class SupabaseConfigError extends Error {
  code = "SUPABASE_CONFIG_MISSING" as const
  constructor(message: string) {
    super(message)
    this.name = "SupabaseConfigError"
  }
}

export function getSupabase() {
  const missing: string[] = []
  if (!SUPABASE_URL) missing.push("SUPABASE_URL")
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY")
  if (missing.length > 0) {
    throw new SupabaseConfigError(
      `Supabase configuration missing: ${missing.join(", ")}`
    )
  }

  return createClient<Database>(
    SUPABASE_URL as string,
    SUPABASE_SERVICE_ROLE_KEY as string
  )
}
