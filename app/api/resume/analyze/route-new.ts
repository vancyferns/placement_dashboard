import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const PDFParser = require('pdf2json');

const prisma = new PrismaClient();

async function parsePDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve) => {
    const pdfParser = new PDFParser();
    let fullText = '';
    
    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      if (pdfData.Pages) {
        pdfData.Pages.forEach((page: any) => {
          if (page.Texts) {
            page.Texts.forEach((text: any) => {
              if (text.R) {
                text.R.forEach((r: any) => {
                  if (r.T) fullText += decodeURIComponent(r.T) + ' ';
                });
              }
            });
            fullText += '\n';
          }
        });
      }
      console.log('PDF parsed, text length:', fullText.length);
      resolve(fullText.trim());
    });
    
    pdfParser.on('pdfParser_dataError', () => resolve(''));
    pdfParser.parseBuffer(buffer);
  });
}
