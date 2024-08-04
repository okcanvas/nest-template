import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from './common.constants';
import {
  PostgresSqlModuleAsyncOptions,
  PostgresSqlOptions,
} from '../interfaces/config.postgresql.interface';
import { PostgresSqlService } from './sql.service';

@Module({})
@Global()
export class PostgresSqlModule {
  
  static forRoot(options: PostgresSqlOptions): DynamicModule {
    return {
      module: PostgresSqlModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        PostgresSqlService,
      ],
      exports: [PostgresSqlService],
    };
  }

  static forRootAsync(options: PostgresSqlModuleAsyncOptions): DynamicModule {
    return {
      module: PostgresSqlModule,
      imports: options.imports,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        PostgresSqlService,
      ],
      exports: [PostgresSqlService],
    };
  }
}
