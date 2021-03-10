/// <reference types="qs" />
import { PDFDocument, PDFPage, PDFFont, CreateOptions } from 'pdf-lib';
import { RGB, Grayscale, CMYK } from 'pdf-lib';
import { Request, Response, NextFunction } from 'express';
export declare class PDF {
    document: PDFDocument;
    currentPage: PDFPage;
    pageWidth: number;
    pageHeight: number;
    currentFont: PDFFont;
    currentFontBold: PDFFont;
    currentFontOblique: PDFFont;
    currentFontBoldOblique: PDFFont;
    currentTextColor: RGB | Grayscale | CMYK;
    marginLeft: number;
    marginRight: number;
    marginTop: number;
    marginBottom: number;
    constructor();
    create(options?: CreateOptions): Promise<void>;
    addPage(): Promise<void>;
    static testRoute(): (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void;
}
export declare abstract class PDFBlock {
    x?: number;
    y?: number;
    pdf: PDF;
    constructor(pdf: PDF);
    abstract apply(pdf: PDF): void;
    moveDownAndAddPageIfNecessary(value: number, options?: {
        newPageOffsetX?: number;
        newPageOffsetY?: number;
        marginBottom?: number;
    }): void;
}
export declare class PDFTextBlock extends PDFBlock {
    text: string | any;
    font: PDFFont;
    fontBold: PDFFont;
    fontOblique: PDFFont;
    fontBoldOblique: PDFFont;
    fontSize: number;
    fontSizeHeader: {
        [key: number]: number;
    };
    fontBoldHeader: {
        [key: number]: boolean;
    };
    lineHeight: number;
    paragraphSpacing: number;
    color: RGB | Grayscale | CMYK;
    maxWidth: 'auto' | number;
    align: 'left' | 'center' | 'right';
    private currentColor;
    private paragraphs;
    constructor(pdf: PDF);
    apply(): void;
    private writeWords;
    private moveDown;
}
export declare type PDFTextBlockParagraph = Array<PDFTextBlockWord>;
export interface PDFTextBlockWord {
    type: 'word' | 'new-line';
    text: string;
    width: number;
    height: number;
    font: PDFFont;
    fontSize: number;
    color: RGB | Grayscale | CMYK;
}
//# sourceMappingURL=pdf.helper.d.ts.map