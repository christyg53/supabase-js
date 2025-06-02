import { AuthClient } from '@supabase/auth-js'
import { Database } from './customTypes';

export class SupabaseAuthClient extends AuthClient {
  constructor(options: SupabaseAuthClientOptions) {
    super(options)
  }
}
