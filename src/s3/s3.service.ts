import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import * as JSZip from 'jszip';

@Injectable()
export class S3Service {
  private s3: AWS.S3;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
    });
  }

  async uploadScreenshot(date: string, session: string, fileName: string, fileBuffer: Buffer) {
    console.log("===== buckert ======",this.configService.get<string>('AWS_BUCKET_NAME'));
    const params = {
      Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
      Key: `${date}/${session}/${fileName}`,
      Body: fileBuffer,
      ContentType: 'image/png',
    };

    return this.s3.upload(params).promise();
  }

  async downloadFolder(folderName: string): Promise<Buffer> {
    const params = {
      Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
      Prefix: folderName,
    };

    // Get list of all objects in the folder
    const objects = await this.s3.listObjectsV2(params).promise();
    
    if (!objects.Contents || objects.Contents.length === 0) {
      throw new Error('Folder is empty or does not exist');
    }

    // Create a new zip file
    const zip = new JSZip();
    
    // Download each file and add to zip
    const downloadPromises = objects.Contents.map(async (object) => {
      const fileParams = {
        Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
        Key: object.Key,
      };
      
      const data = await this.s3.getObject(fileParams).promise();
      
      // Remove the prefix from the filename to maintain folder structure
      const filename = object.Key.replace(folderName + '/', '');
      
      // Convert data.Body to Buffer if it isn't already
      let content: Buffer;
      if (Buffer.isBuffer(data.Body)) {
        content = data.Body;
      } else if (data.Body instanceof Uint8Array) {
        content = Buffer.from(data.Body);
      } else if (typeof data.Body === 'string') {
        content = Buffer.from(data.Body);
      } else {
        throw new Error(`Unsupported data type for file: ${filename}`);
      }
      
      // Add file to zip
      zip.file(filename, content);
    });

    // Wait for all downloads to complete
    await Promise.all(downloadPromises);
    
    // Generate zip file
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    });

    return zipBuffer;
  }

  async downloadSessionImages(date: string, session: string) {
    const params = {
      Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
      Prefix: `${date}/${session}/`,
    };

    return this.s3.listObjectsV2(params).promise();
  }

  async downloadImage(date: string, session: string, fileName: string) {
    const params = {
      Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
      Key: `${date}/${session}/${fileName}`,
    };

    return this.s3.getObject(params).promise();
  }
}