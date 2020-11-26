const fs = require('fs');
const AWS = require('aws-sdk');


const { region, accessKeyId, secretAccessKey } = process.env;
if(accessKeyId == undefined || secretAccessKey == undefined) {
    console.log("please fill .env with aws keys");
    process.exit();
}
AWS.config.update({ region, accessKeyId, secretAccessKey });
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const createPresignedPost = (Bucket, key, mime) => new Promise(async (resolve, reject) => {
    const params = {
        Expires: 600,
        Bucket,
        Conditions: [["content-length-range", 100, 200000000]], // 100Byte - 200MB
        Fields: {
            "Content-Type": mime,
            key
        }
    };

    s3.createPresignedPost(params, (err, data) => {
        if (err) return reject(err);
        return resolve(data);
    });
});


const createNewBucket = async (Bucket) => {
    try {
        const result = await s3.createBucket({ Bucket }).promise();
        console.log(result);
        return result;
    } catch (error) {
        throw error;
    }
};

const uploadObjectInBucket = async (uploadParams) => {
    try {
        const uploaded = await s3.upload(uploadParams, [{ "Content-Type": "image/jpeg" }]).promise();
        return uploaded;
    } catch (error) {
        throw error;
    }
};


const uploadObject = async (params) => new Promise( async (resolve, reject) => {
    try {
        const { Key, Body, Bucket } = params;
        const uploadParams = { Key, Body, Bucket, ACL: 'public-read' };
        const res = await uploadObjectInBucket(uploadParams);
        return resolve(res);
    } catch (error) {
        return reject(error);
    }
});


const getObjectFromBucket = async (Bucket, Key) => {
    try {
        const params = { Bucket, Key };
        const data = await s3.getObject(params).promise();
        const resData = data.Body; //TODO occhio all'encoding, se è binary si scassa tutto
        return resData;
    } catch (error) {
        throw error
    }
};

const listTheBuckets = async () => {
    try {
        const list = await s3.listBuckets().promise();
        return list;
    } catch (error) {
        throw error;
    }
};

const bucketObjectList = async (Bucket) => {
    try {
        const bucketParams = { Bucket };
        const objectList = await s3.listObjects(bucketParams).promise();
        return objectList;
    } catch (error) {
        throw error;
    }
};

const deleteObjectFromBucket = async (Bucket, Key) => {
    try {
        const params = { Bucket, Key };
        const deletedObject = await s3.deleteObject(params).promise();
        return deletedObject;
    } catch (error) {
        throw error;
    }
}


module.exports = {
    getObjectFromBucket,
    createNewBucket,
    listTheBuckets,
    uploadObject,
    deleteObjectFromBucket,
    bucketObjectList,
    createPresignedPost
};
