import { ModuleMetadata } from '@nestjs/common';

export interface PostgresSqlOptions {
  host: string;
  port?: number;
  user: string;
  password?: string;
  database: string;

  connectionString?: string;
  keepAlive?: boolean;
  stream?: any;
  ssl?: any;
  query_timeout?: number;
  keepAliveInitialDelayMillis?: number;
  idle_in_transaction_session_timeout?: number;
  application_name?: string;
  connectionTimeoutMillis?: number;
  types?: any;
  options?: string;

  //  interface Defaults extends
  poolSize?: number;
  poolIdleTimeout?: number;
  reapIntervalMillis?: number;
  binary?: boolean;
  parseInt8?: boolean;
  parseInputDatesAsUTC?: boolean;

  //  interface PoolConfig extends
  max?: number;
  min?: number;
  idleTimeoutMillis?: number;
  log?: any;
  Promise?: PromiseConstructorLike;
  allowExitOnIdle?: boolean;
  maxUses?: number;
 
}

export interface PostgresSqlModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<PostgresSqlOptions> | PostgresSqlOptions;
  inject?: any[];
}
