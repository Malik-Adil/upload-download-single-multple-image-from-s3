import { Controller, Post, Get, Param, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { S3Service } from './s3.service';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload')
  async uploadScreenshot(@Body() body) {
    const { date, session, fileName, fileBuffer } = body;
    return this.s3Service.uploadScreenshot(date, session, fileName, fileBuffer);
  }

  @Get('download-folder/:folderName')
  async downloadFolder(
    @Param('folderName') folderName: string,
    @Res() res: Response
  ) {
    try {
      const zipBuffer = await this.s3Service.downloadFolder(folderName);
      
      // Set headers for zip file download
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${folderName}.zip"`,
        'Content-Length': zipBuffer.length,
      });
      
      // Send the zip file
      res.send(zipBuffer);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error downloading folder', 
        error: error.message 
      });
    }
  }

  @Get('download/session/:date/:session')
  async downloadSessionImages(@Param('date') date: string, @Param('session') session: string) {
    return this.s3Service.downloadSessionImages(date, session);
  }

  @Get('download/image/:date/:session/:fileName')
  async downloadImage(@Param('date') date: string, @Param('session') session: string, @Param('fileName') fileName: string) {
    return this.s3Service.downloadImage(date, session, fileName);
  }
}