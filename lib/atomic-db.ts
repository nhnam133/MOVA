import { env } from 'cloudflare:workers';

import type { SqlCommand } from './commerce-commands';
export { guard, type SqlCommand } from './commerce-commands';

export async function atomicBatch(commands: SqlCommand[]) {
  return env.DB.batch(
    [...commands, { sql: 'DELETE FROM transaction_guards' }].map(
      ({ sql, params }) => env.DB.prepare(sql).bind(...(params ?? [])),
    ),
  );
}
