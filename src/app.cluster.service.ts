import cluster from 'cluster';
import * as os from 'os';
import { Injectable } from '@nestjs/common';


const VERSION = process.env.VERSION || 'unknown';
const TIMEZONE = process.env.DB_TIMEZONE || 'unknown';
const WORKER_COUNT = ((process.env.WORKER_COUNT == 'auto')
  ? os.cpus().length 
  : Number(process.env.WORKER_COUNT || 1)
  ) * 1;


//const numCPUs = os.cpus().length;
//const numCPUs = 1;
const setCronWorker = new Set();


@Injectable()
export class AppClusterService {

  static clusterize(callback: Function): void {
    if (cluster.isMaster) {
      console.info(`--------------------------------------------------------------------------------`);
      console.info(`[] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] []`);
      console.info(`--------------------------------------------------------------------------------`);
      console.info(`    ####    #    #    ####      ###     ##    #   #     #     ###      #####    `);
      console.info(`   #    #   #   #    #    #    #   #    # #   #   #     #    #   #    #         `);
      console.info(`   #    #   ###      #        #######   #  #  #   #     #   #######   #######   `);
      console.info(`   #    #   #   #    #    #   #     #   #   # #    #   #    #     #         #   `);
      console.info(`    ####    #    #    ####    #     #   #    ##     ###     #     #    #####    `);
      console.info(`--------------------------------------------------------------------------------`);
      console.info(`[] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] [] []`);
      console.info(`--------------------------------------------------------------------------------`);
      console.info(`OKCANVAS API`);
      console.info(`version : `, VERSION);
      console.info(`time zone : `, TIMEZONE);
      console.info(`worker count : `, WORKER_COUNT);
      console.info(`Copyright 2022 OKCANVAS Inc. all rights reserved. `);
      console.info(``);
      console.info(`Master server started on `, process.pid);
      console.info(`--------------------------------------------------------------------------------`);

      const workerParams = {
        'MASTER_ID': process.pid, 
      };
      const cronWorkerParams = {
        'MASTER_ID': process.pid, 
        'WORKER_CRON': true
      };

      for (let i = 0; i < WORKER_COUNT; i++) {
        if (setCronWorker.size == 0) {
          const worker = cluster.fork(cronWorkerParams);
          setCronWorker.add(worker.process.pid);
        } else {
          const worker = cluster.fork(workerParams);
        }
        //console.log('FORK', setCronWorker);
      }
      cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        setCronWorker.delete(worker.process.pid);
        if (setCronWorker.size == 0) {
          const worker = cluster.fork(cronWorkerParams);
          setCronWorker.add(worker.process.pid)
        } else {
          const worker = cluster.fork(workerParams);
        }
        //console.log('EXIT', setCronWorker);
      });
    } else {
      console.info(`--------------------------------------------------------------------------------`);
      console.log('Cluster server started on', process.pid)
      console.log('Service type :', process.env['WORKER_CRON'] ? 'CRON' : 'SERVICE')
      console.info(`--------------------------------------------------------------------------------`);
      callback();

      //  worker exit TEST !!!
      /*
      if (process.env['WORKER_CRON']) {
        setTimeout(() => process.exit(1), Math.round(Math.random() * 5000))
      } else {
        setTimeout(() => process.exit(1), Math.round(Math.random() * 5000))
      }
      */
    }
  }
}
