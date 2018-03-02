import { S3 } from 'aws-sdk';

const s3Client = new S3();
const Bucket = process.env.BUCKET;

export interface Redirect {
  from: string;
  to: string;
}

export const listRedirects = (nextToken?: string) =>
  new Promise<S3.ListObjectsV2Output>((resolve, reject) =>
    s3Client.listObjectsV2(
      { Bucket, ContinuationToken: nextToken },
      (err, data) => {
        if (err) {
          return reject(err);
        }

        return resolve(data);
      }
    )
  );

export const getRedirect = (obj: S3.Object) =>
  new Promise<Redirect>((resolve, reject) =>
    s3Client.headObject({ Bucket, Key: obj.Key }, (err, data) => {
      if (err) {
        return reject(err);
      }

      resolve({
        from: obj.Key,
        to: data.WebsiteRedirectLocation
      });
    })
  );

export const checkAvailability = (Key: string) =>
  new Promise<void>((resolve, reject) =>
    s3Client.headObject({ Bucket, Key }, (err, data) => {
      if (err) {
        return resolve();
      }

      reject(new Error('already exists'));
    })
  );

export const createRedirect = (from: string, to: string) =>
  new Promise<Redirect>((resolve, reject) => {
    s3Client.putObject(
      {
        Bucket,
        Key: from,
        ACL: 'public-read',
        WebsiteRedirectLocation: to
      },
      (err, data) => {
        if (err) {
          return reject(err);
        }

        resolve({
          from,
          to
        });
      }
    );
  });
