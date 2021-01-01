'use strict';
require('dotenv').config();
const path = require("path");
const { writeFile } = require('fs/promises');
const { existsSync, mkdirSync } = require('fs');
const { bucketObjectList, getObjectFromBucket } = require('./s3');
const printer = require('./printer-colors');
const { sleep, fileExists } = require('./utils');

const readline = require('readline');


const main = async () => {
    try {
        const directoryVideos = 'videos';
        const bucketName = process.env?.bucket;
        if(bucketName == '') {
            console.log("please specify bucket in file .env");
            process.exit();
        }

        printer.magenta("-- HIBE AUDITION: Downloading videos from AWS S3 Efebia -- \n");

        if(!await fileExists(directoryVideos)) mkdirSync(directoryVideos);
        console.log(`Videos will be downloaded in this folder: ${path.resolve(directoryVideos)}`);
        const { Contents } = await bucketObjectList(bucketName);
        const sizeContents = Contents.length;
        let sizeDown = 0;
        console.log(`Bucket => '${bucketName}': ${sizeContents} videos found\n`);
        for(const index of Object.keys(Contents)) {
            process.stdout.write(`Downloading video ${Number(index) + 1} of ${sizeContents}... `);
            const { Key } = Contents[index];
            const fileName = Key.replace(`/`, `-`);
            const fullPath = `${directoryVideos}/${fileName}`;
            if(await fileExists(fullPath)) {
                if((Number(index) + 1) == sizeContents) {
                    printer.yellow(`\nFinished! ${sizeDown} videos downloaded`);
                    return;
                } else {
                    readline.cursorTo(process.stdout, 0);
                    continue;
                }
            }

            console.log(`\nDownlaoding Buffer file: ${Key}...`);
            const bufferFile = await getObjectFromBucket(bucketName, Key);
            console.log(`\tbuffer file is ready in memory...`);

            console.log(`\twriting Buffer in file...`);
            await writeFile(fullPath, bufferFile);
            console.log(`\tfile written!`);
            sizeDown++;
        }
    } catch(error) {
        console.log(error);
    } finally {
    }
};

main();