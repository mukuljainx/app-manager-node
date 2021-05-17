import fs from 'fs';
import IBM from 'ibm-cos-sdk';
import mime from 'mime-types';
import util from 'util';

const readFile = util.promisify(fs.readFile);

import './helper';

const config = {
  endpoint: process.env.IBM_AUTH_ENDPOINT,
  apiKeyId: process.env.IBM_API_KEY,
  serviceInstanceId: process.env.IBM_SERVICE_INSTANCE_ID,
  signatureVersion: 'iam',
};

const cos = new IBM.S3(config);

export const bucketName = process.env.IBM_BUCKET_NAME!;
export const publicURL = process.env.IBM_PUBLIC_END_POINT;

const getBucketContents = () => {
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
};

export const putFile = async (itemName: string, filePath: string) => {
  try {
    let file = await readFile(filePath);
    console.log(`Creating new item: ${itemName}`);
    return cos
      .putObject({
        ContentType: mime.lookup(filePath) as string,
        Bucket: bucketName,
        Key: itemName,
        Body: file,
      })
      .promise();
  } catch (e) {
    console.log(e);
  }
};

export function getItem(itemName: string, res: any) {
  console.log(`Retrieving item from bucket: ${bucketName}, key: ${itemName}`);
  return cos
    .getObject({
      Bucket: bucketName,
      Key: itemName,
    })
    .on('httpHeaders', function (statusCode, headers) {
      if (statusCode !== 200) {
        return res.sendStatus(statusCode);
      }
      res.set('Content-Length', headers['content-length']);
      res.set('Content-Type', headers['content-type']);
      //@ts-ignore
      this.response.httpResponse.createUnbufferedStream().pipe(res);
    })
    .send();
}
