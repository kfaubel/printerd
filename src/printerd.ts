#!/usr/bin/env node
/* eslint-disable no-case-declarations */
import { Logger } from "./Logger";                             // https://www.npmjs.com/package/winston
import { print, getPrinters, Printer } from "pdf-to-printer";  // https://www.npmjs.com/package/pdf-to-printer
import { program } from "commander";                           // https://www.npmjs.com/package/commander
import path from "path";
import * as fs from "fs";

const sleep = (time: number) => {
    return new Promise((resolve) => setTimeout(resolve, time));
};

async function run() {
    const logger: Logger = new Logger("printerd");

    program
        .name("printerd")
        .description("Service that sends pdf files to a printer")
        .option("-v, --verbose", "Log additional information")
        .option("-t, --testonly", "Process pdf files but don't actually queue to the printer")
        .option("-h, --help", "Show this help")
        .option("-l, --list", "List the printers only")
        .option("-q, --queue <queue>", "directory of the printer queue")
        .option("-p, --printer <printer>", "Printer name");

    program.parse();

    const options = program.opts();

    const verbose = options.verbose ?? false;
    const testOnly = options.testonly ?? false;
    const listOnly = options.list ?? false;
    const helpOnly = options.help ?? false;
    const queueDir  = options.queue;
    const printer  = options.printer;

    if (verbose) {
        logger.setLevel("verbose)");
    }

    if (helpOnly) {
        program.help();
    }
    
    if (listOnly) {
        const printers: Printer[] = await getPrinters();
        for (const aPrinter of printers) {
            // There is also a printer.deviceId, but its not helpful for us
            console.log(`Printer: ${aPrinter.name}`);
        }
        process.exit(0);
    }

    if (typeof printer === "undefined") {
        logger.info("Printer is required");
        program.help({ error: true });
    }

    if (typeof queueDir === "undefined") {
        logger.info("Queue directory is required");
        program.help({ error: true });
    }

    if (fs.lstatSync(queueDir).isDirectory() === false) {
        logger.error("queue must be a readable directory");
        program.help({ error: true });
    }

    const logFile = path.resolve(queueDir, "printer.log");

    logger.setLogFile(logFile);

    const completeDir = path.resolve(queueDir, "complete");

    if (fs.lstatSync(`${completeDir}`, {throwIfNoEntry: false}) === undefined) {
        fs.mkdirSync(`${completeDir}`);
    }    

    if (testOnly) {
        logger.info(`Starting printer service (test mode) for printer ${printer} in ${queueDir}`);
    } else {
        logger.info(`Starting printer service for printer ${printer} in ${queueDir}`);
    }

    // eslint-disable-next-line no-constant-condition
    while(true) {
        logger.verbose(`Checking...`);
        
        try {        
            const files = fs.readdirSync(queueDir);

            // Wait a bit to make sure all new files have been written completely
            await sleep(5*1000);

            for (let i = 0; i < files.length; i++) {
                const suffix = path.parse(files[i]).ext;

                if (suffix !== ".pdf") {
                    continue;
                }

                const fullPath = path.resolve(queueDir, files[i]);

                if (testOnly) {
                    logger.info(`Test only ${files[i]} on printer: ${printer}`);
                } else {
                    await print(fullPath, {printer: printer});
                    logger.info(`Printing ${files[i]} on printer: ${printer}`);
                }

                const completePath = path.resolve(completeDir, files[i]);

                fs.renameSync(fullPath, completePath);

                logger.info(`Moving ${files[i]} to complete directory`);

            }
            
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch(error: any) {
            logger.error(`run: Exception raised: ${error.stack}`);
        }

        await sleep(30*1000);
    }
}

run();
