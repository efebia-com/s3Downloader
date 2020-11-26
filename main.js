'use strict';
require('dotenv').config();
const path = require("path");
const { writeFile } = require('fs/promises');
const { existsSync, mkdirSync } = require('fs');
const { bucketObjectList, getObjectFromBucket } = require('./s3');
const printer = require('./printer-colors');


const main = async () => {
    try {
        const directoryVideos = 'videos';
        const bucketName = process.env?.bucket;
        if(bucketName == '') {
            console.log("please specify bucket in file .env");
            process.exit();
        }

        printer.magenta("-- HIBE AUDITION: Downloading videos from AWS S3 Efebia -- \n");

        if (!existsSync(directoryVideos)) mkdirSync(directoryVideos);
        console.log(`Videos will be downloaded in this folder: ${path.resolve(directoryVideos)}`);
        const { Contents } = await bucketObjectList(bucketName);
        console.log(`Bucket => '${bucketName}': ${Contents.length} videos found\n`);
        for(const { Key } of Contents) {
            const fileName = Key.replace(`/`, `-`);
            const fullPath = `${directoryVideos}/${fileName}`;
            if(existsSync(fullPath)) {
                console.log(`file ${fileName} already downloaded, skipping!`);
                continue;
            }

            console.log(`Downlaoding Buffer file: ${Key}...`);
            const bufferFile = await getObjectFromBucket(bucketName, Key);
            console.log(`\tbuffer file is ready in memory...`);

            console.log(`\twriting Buffer in file...`);
            await writeFile(fullPath, bufferFile);
            console.log(`\tfile written!`);
        }
    } catch(error) {
        console.log(error);
    } finally {
        console.log("All completed.");
    }
};

main();