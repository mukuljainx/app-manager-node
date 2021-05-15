import IBM from 'ibm-cos-sdk';

const config = {
  endpoint: process.env.DEFAULT_IBM_AUTH_ENDPOINT,
  apiKeyId: process.env.DEFAULT_IBM_API_KEY,
  serviceInstanceId: process.env.DEFAULT_IBM_SERVICE_INSTANCE_ID,
  signatureVersion: 'iam',
};

const cos = new IBM.S3(config);

function getBucketContents(bucketName: string) {
  console.log(`Retrieving bucket contents from: ${bucketName}`);
  return cos
    .listObjects({ Bucket: bucketName })
    .promise()
    .then((data) => {
      if (data != null && data.Contents != null) {
        for (var i = 0; i < data.Contents.length; i++) {
          var itemKey = data.Contents[i].Key;
          var itemSize = data.Contents[i].Size;
          console.log(`Item: ${itemKey} (${itemSize} bytes).`);
        }
      }
    })
    .catch((e) => {
      console.error(`ERROR: ${e.code} - ${e.message}\n`);
    });
}

// getBucketContents('app-statics');

function createTextFile(
  bucketName: string,
  itemName: string,
  fileText: string,
) {
  console.log(`Creating new item: ${itemName}`);
  return cos
    .putObject({
      Bucket: bucketName,
      Key: itemName,
      Body: fileText,
    })
    .promise()
    .then((d) => {
      debugger;
      console.log(`Item: ${itemName} created!`);
    })
    .catch((e) => {
      console.error(`ERROR: ${e.code} - ${e.message}\n`);
    });
}
