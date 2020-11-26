const isDefined = variable => variable != null && variable != undefined;

const areDefined = (obj, listKeys) => new Promise((resolve, reject) => {
    if(!isDefined(obj)) return reject(new Error(`Object ${obj} is not defined`));
    for(const key of listKeys) {
        if(!isDefined(obj[key])) return reject(new Error(`${key} is not defined`));
    }
    return resolve(true);
});

module.exports = {
    areDefined
}