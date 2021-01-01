const { access, constants } = require(`fs`);
const {  } = require(`fs/promises`);
const { resolve } = require("path");

const isDefined = variable => variable != null && variable != undefined;

const areDefined = (obj, listKeys) => new Promise((resolve, reject) => {
    if(!isDefined(obj)) return reject(new Error(`Object ${obj} is not defined`));
    for(const key of listKeys) {
        if(!isDefined(obj[key])) return reject(new Error(`${key} is not defined`));
    }
    return resolve(true);
});

const sleep = ms => new Promise( resolve => setTimeout(resolve, ms));

const fileExists = fileName => new Promise((resolve, reject) => {
    try {
        const onAccessed = error => {
            if(isDefined(error)) {
                return resolve(false);
            } else {
                return resolve(true);
            }
        };

        access(fileName, constants.F_OK, onAccessed);
    } catch(error) {
        reject(error);
    }
    
});


module.exports = {
    areDefined,
    sleep,
    fileExists
}