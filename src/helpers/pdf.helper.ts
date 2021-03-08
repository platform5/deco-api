import { PDFDocument, PDFPage, PDFFont, CreateOptions, StandardFonts, rgb } from 'pdf-lib';
import { RGB, Grayscale, CMYK } from 'pdf-lib';
import { Request, Response, NextFunction } from 'express';
import marked from 'marked';


export class PDF {

  public document: PDFDocument;
  public currentPage: PDFPage;
  public pageWidth: number;
  public pageHeight: number;
  public currentFont: PDFFont;
  public currentFontBold: PDFFont;
  public currentFontOblique: PDFFont;
  public currentFontBoldOblique: PDFFont;
  public currentTextColor: RGB | Grayscale | CMYK = rgb(0, 0, 0);
  public marginLeft: number = 15;
  public marginRight: number = 15;
  public marginTop: number = 15;
  public marginBottom: number = 15;

  constructor() {
  
  }

  public async create(options?: CreateOptions) {
    this.document = await PDFDocument.create(options);
    await this.addPage();
    this.currentFont = await this.document.embedFont(StandardFonts.Helvetica);
    this.currentFontBold = await this.document.embedFont(StandardFonts.HelveticaBold);
    this.currentFontOblique = await this.document.embedFont(StandardFonts.HelveticaOblique);
    this.currentFontBoldOblique = await this.document.embedFont(StandardFonts.HelveticaBoldOblique);
  }

  public async addPage() {
    this.currentPage = this.document.addPage();
    const {width, height} = this.currentPage.getSize();
    this.pageWidth = width;
    this.pageHeight = height;
    this.currentPage.moveTo(this.marginLeft, this.pageHeight - this.marginTop);
  }

  public static testRoute() {
    return (req: Request, res: Response, next: NextFunction) => {
      new Promise(async (resolve, reject) => {
        try {
          const pdf = new PDF();
          await pdf.create();
          const text = `# Test d'un document PDF

Ce document est généré avec le PDF Helper de Swissdata. Il utilise un format Markdown qui permet de mettre **du texte en gras** ou de le mettre en *évidence avec de l'italique*.

## Element supportés

Comme dit plus haut, le gras et l'italique sont supporté, ainsi que les titres de sections en utilisant le # en début de ligne.

Les paragraphes sont pris en compte.

### Couleurs

Les couleurs sont aussi permises (color:1,0,0) grâce à une syntaxe custom. (color:0)

### A venir

Il est prévu d'ajouter le support pour le texte aligné à droite, ainsi que les listes à puce, les images et les liens.

### Conclusion

Il ne reste plus qu'à créer des beaux PDF.`;
          const textBlock = new PDFTextBlock(pdf);
          textBlock.text = text;
          textBlock.apply();
          const file = await pdf.document.save();
          const fileName = 'test.pdf';

          res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=' + fileName,
            'Content-Length': file.length
          });
          res.end(Buffer.from(file));
          return resolve(null);
        } catch (error) {
          return reject(error);
        }
      });

    }
  }

}

export abstract class PDFBlock {

  public x?: number;
  public y?: number;

  public pdf: PDF;

  constructor(pdf: PDF) {
    this.pdf = pdf;
  }

  public abstract apply(pdf: PDF): void;

  public moveDownAndAddPageIfNecessary(value: number, options?: {newPageOffsetX?: number, newPageOffsetY?: number, marginBottom?: number}) {
    this.pdf.currentPage.moveDown(value);
    const top = this.pdf.currentPage.getY();
    const left = this.pdf.currentPage.getX();
    const marginBottom = options?.marginBottom || 0;
    if (top < marginBottom) {
      this.pdf.addPage();
      const offsetX = options?.newPageOffsetX || 0;
      const offsetY = options?.newPageOffsetY || 0;
      this.pdf.currentPage.moveTo(left + offsetX, this.pdf.currentPage.getY() - offsetY);
    }
  }
}

export class PDFTextBlock extends PDFBlock {
  public text: string | any;
  public font: PDFFont;
  public fontBold: PDFFont;
  public fontOblique: PDFFont;
  public fontBoldOblique: PDFFont;
  public fontSize: number = 14;
  public fontSizeHeader: {[key: number]: number} = {
    1: 32,
    2: 26,
    3: 18,
    4: 16,
    5: 14,
    6: 14
  };
  public fontBoldHeader: {[key: number]: boolean} = {
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true
  };
  public lineHeight: number = 1.2;
  public paragraphSpacing: number = 16;
  public color: RGB | Grayscale | CMYK;
  public maxWidth: 'auto' | number = 'auto';
  public align: 'left' | 'center' | 'right' = 'left';

  private currentColor: RGB | Grayscale | CMYK;

  private paragraphs: Array<PDFTextBlockParagraph> = [];

  constructor(pdf: PDF) {
    super(pdf);
    this.font = this.pdf.currentFont;
    this.fontBold = this.pdf.currentFontBold;
    this.fontOblique = this.pdf.currentFontOblique;
    this.fontBoldOblique = this.pdf.currentFontBoldOblique;
    this.color = this.pdf.currentTextColor;
  }

  /* TODO: underline */
  /* TODO: text-align */

  public apply() {
    if (this.text && typeof this.text !== 'string' && this.text.toString) {
      this.text = this.text.toString();
    }
    if (!this.text) {
      return;
    }

    this.currentColor = this.color;

    const x = this.x || this.pdf.currentPage.getX();
    const y = this.y || this.pdf.currentPage.getY();
    
    this.pdf.currentPage.moveTo(x, y);
    const autoMaxWidth = this.pdf.pageWidth - x - this.pdf.marginRight;
    const maxWidth = this.maxWidth === 'auto'
      ? autoMaxWidth
      : Math.min(this.maxWidth, autoMaxWidth);

    const lex: any = marked.lexer(this.text, {smartypants: false});

    for (let block of lex) {
      if (block.type === 'paragraph' || block.type === 'heading') {
        const fontSize = block.type === 'heading' ? this.fontSizeHeader[block.depth] : this.fontSize;
        let paragraph: PDFTextBlockParagraph = [];
        for (let token of block.tokens) {
          const tokenText = token.text.replace(/[\n\r]/gm, " (new-line) ");
          const words = tokenText.split(' ');
          const isBold = block.type === 'heading' ? this.fontBoldHeader[block.depth] : token.type === 'strong';
          const isOblique = token.type === 'em';

          let font = this.font;
          if (isBold && isOblique) {
            font = this.fontBoldOblique;
          } else if (isBold) {
            font = this.fontBold;
          } else if (isOblique) {
            font = this.fontOblique;
          }

          for (let word of words) {
            const index = word.indexOf("\n");
            if (index === 0 || word === '(new-line)') {
              const newLineWord: PDFTextBlockWord = {
                type: 'new-line',
                text: '',
                width: 0,
                height: 0,
                font: font,
                fontSize: fontSize,
                color: this.currentColor
              }
              paragraph.push(newLineWord);
              continue;
            }
            if (word === '') {
              continue;
            }
            
            word = word.replace(/&#39;/g, `'`).replace(/&quot;/g, '"');
            const colorMatches = (word as string).match(/\(color:([0-9,.]+)\)/)
            if (colorMatches) {
              if (colorMatches[1] === '0') {
                this.currentColor = this.color;
              } else {
                const newColor = colorMatches[1].split(',');
                this.currentColor = rgb(parseFloat(newColor[0]), parseFloat(newColor[1]), parseFloat(newColor[2]));
              }
              continue;
            }
            const text = this.align === 'right' ? ` ${word}` : `${word} `
            const pdfWord: PDFTextBlockWord = {
              type: 'word',
              text: text,
              width: 0,
              height: 0, 
              font: font,
              fontSize: fontSize,
              color: this.currentColor
            };
            pdfWord.width = font.widthOfTextAtSize(pdfWord.text, pdfWord.fontSize);
            pdfWord.height = font.heightAtSize(pdfWord.fontSize);
            paragraph.push(pdfWord);
          }
        }
        this.paragraphs.push(paragraph);
      }
    }

    let currentWidth = 0;
    let currentWords: Array<PDFTextBlockWord> = [];
    let addSpacing = false;
    for (let paragraph of this.paragraphs) {
      currentWords = [];
      currentWidth = 0;
      for (let word of paragraph) {
        if (word.text === ' ') {
          continue;
        }
        if (word.type === 'new-line') {
          this.writeWords(x, currentWords);
          currentWords = [];
          currentWidth = 0;
          continue;
        }
        if (currentWords.length === 0) {
          currentWords.push(word);
          currentWidth = word.width;
          continue;
        }
        // check if we can add one more word
        if (currentWidth + word.width < maxWidth) {
          currentWords.push(word);
          currentWidth += word.width;
        } else {
          // write the current word set and start again
          if (addSpacing) {
            this.moveDown(this.paragraphSpacing);
            addSpacing = false;
          }
          this.writeWords(x, currentWords);
          currentWords = [word];
          currentWidth = word.width;
        }
      }
      if (addSpacing) {
        this.moveDown(this.paragraphSpacing);
      }
      this.writeWords(x, currentWords);
      addSpacing = true;
    }

    this.moveDown(this.paragraphSpacing);
  }

  private writeWords(x: number, words: Array<PDFTextBlockWord>) {
    if (words.length === 0) {
      return;
    }
    const maxHeight = Math.max(...words.map(w => w.height));
    this.moveDown(maxHeight * this.lineHeight);
    let left = x;
    // TODO: here we can adjust to align right
    for (let word of words) {
      this.pdf.currentPage.drawText(word.text, {
        font: word.font,
        size: word.fontSize,
        color: word.color,
        x: left
      });
      left += word.width;
    }
  }

  private moveDown(height: number) {
    this.moveDownAndAddPageIfNecessary(height, {newPageOffsetY: height, marginBottom: this.pdf.marginBottom});
  }
}

export type PDFTextBlockParagraph = Array<PDFTextBlockWord>;

export interface PDFTextBlockWord {
  type: 'word' | 'new-line';
  text: string;
  width: number; 
  height: number; 
  font: PDFFont;
  fontSize: number;
  color: RGB | Grayscale | CMYK; 
}