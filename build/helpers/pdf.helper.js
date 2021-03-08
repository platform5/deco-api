"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pdf_lib_1 = require("pdf-lib");
const marked_1 = __importDefault(require("marked"));
class PDF {
    constructor() {
        this.currentTextColor = pdf_lib_1.rgb(0, 0, 0);
        this.marginLeft = 15;
        this.marginRight = 15;
        this.marginTop = 15;
        this.marginBottom = 15;
    }
    create(options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.document = yield pdf_lib_1.PDFDocument.create(options);
            yield this.addPage();
            this.currentFont = yield this.document.embedFont(pdf_lib_1.StandardFonts.Helvetica);
            this.currentFontBold = yield this.document.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
            this.currentFontOblique = yield this.document.embedFont(pdf_lib_1.StandardFonts.HelveticaOblique);
            this.currentFontBoldOblique = yield this.document.embedFont(pdf_lib_1.StandardFonts.HelveticaBoldOblique);
        });
    }
    addPage() {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentPage = this.document.addPage();
            const { width, height } = this.currentPage.getSize();
            this.pageWidth = width;
            this.pageHeight = height;
            this.currentPage.moveTo(this.marginLeft, this.pageHeight - this.marginTop);
        });
    }
    static testRoute() {
        return (req, res, next) => {
            new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const pdf = new PDF();
                    yield pdf.create();
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
                    const file = yield pdf.document.save();
                    const fileName = 'test.pdf';
                    res.writeHead(200, {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': 'attachment; filename=' + fileName,
                        'Content-Length': file.length
                    });
                    res.end(Buffer.from(file));
                    return resolve(null);
                }
                catch (error) {
                    return reject(error);
                }
            }));
        };
    }
}
exports.PDF = PDF;
class PDFBlock {
    constructor(pdf) {
        this.pdf = pdf;
    }
    moveDownAndAddPageIfNecessary(value, options) {
        var _a, _b, _c;
        this.pdf.currentPage.moveDown(value);
        const top = this.pdf.currentPage.getY();
        const left = this.pdf.currentPage.getX();
        const marginBottom = ((_a = options) === null || _a === void 0 ? void 0 : _a.marginBottom) || 0;
        if (top < marginBottom) {
            this.pdf.addPage();
            const offsetX = ((_b = options) === null || _b === void 0 ? void 0 : _b.newPageOffsetX) || 0;
            const offsetY = ((_c = options) === null || _c === void 0 ? void 0 : _c.newPageOffsetY) || 0;
            this.pdf.currentPage.moveTo(left + offsetX, this.pdf.currentPage.getY() - offsetY);
        }
    }
}
exports.PDFBlock = PDFBlock;
class PDFTextBlock extends PDFBlock {
    constructor(pdf) {
        super(pdf);
        this.fontSize = 14;
        this.fontSizeHeader = {
            1: 32,
            2: 26,
            3: 18,
            4: 16,
            5: 14,
            6: 14
        };
        this.fontBoldHeader = {
            1: true,
            2: true,
            3: true,
            4: true,
            5: true,
            6: true
        };
        this.lineHeight = 1.2;
        this.paragraphSpacing = 16;
        this.maxWidth = 'auto';
        this.align = 'left';
        this.paragraphs = [];
        this.font = this.pdf.currentFont;
        this.fontBold = this.pdf.currentFontBold;
        this.fontOblique = this.pdf.currentFontOblique;
        this.fontBoldOblique = this.pdf.currentFontBoldOblique;
        this.color = this.pdf.currentTextColor;
    }
    /* TODO: underline */
    /* TODO: text-align */
    apply() {
        if (this.text && typeof this.text !== 'string' && this.text.toString) {
            this.text = this.text.toString();
        }
        if (!this.text) {
            return;
        }
        this.currentColor = this.color;
        const x = this.x || this.pdf.currentPage.getX();
        const y = this.y || this.pdf.currentPage.getY();
        this.pdf.currentPage.moveTo(x, y);
        const autoMaxWidth = this.pdf.pageWidth - x - this.pdf.marginRight;
        const maxWidth = this.maxWidth === 'auto'
            ? autoMaxWidth
            : Math.min(this.maxWidth, autoMaxWidth);
        const lex = marked_1.default.lexer(this.text, { smartypants: false });
        for (let block of lex) {
            if (block.type === 'paragraph' || block.type === 'heading') {
                const fontSize = block.type === 'heading' ? this.fontSizeHeader[block.depth] : this.fontSize;
                let paragraph = [];
                for (let token of block.tokens) {
                    const tokenText = token.text.replace(/[\n\r]/gm, " (new-line) ");
                    const words = tokenText.split(' ');
                    const isBold = block.type === 'heading' ? this.fontBoldHeader[block.depth] : token.type === 'strong';
                    const isOblique = token.type === 'em';
                    let font = this.font;
                    if (isBold && isOblique) {
                        font = this.fontBoldOblique;
                    }
                    else if (isBold) {
                        font = this.fontBold;
                    }
                    else if (isOblique) {
                        font = this.fontOblique;
                    }
                    for (let word of words) {
                        const index = word.indexOf("\n");
                        if (index === 0 || word === '(new-line)') {
                            const newLineWord = {
                                type: 'new-line',
                                text: '',
                                width: 0,
                                height: 0,
                                font: font,
                                fontSize: fontSize,
                                color: this.currentColor
                            };
                            paragraph.push(newLineWord);
                            continue;
                        }
                        if (word === '') {
                            continue;
                        }
                        word = word.replace(/&#39;/g, `'`).replace(/&quot;/g, '"');
                        const colorMatches = word.match(/\(color:([0-9,.]+)\)/);
                        if (colorMatches) {
                            if (colorMatches[1] === '0') {
                                this.currentColor = this.color;
                            }
                            else {
                                const newColor = colorMatches[1].split(',');
                                this.currentColor = pdf_lib_1.rgb(parseFloat(newColor[0]), parseFloat(newColor[1]), parseFloat(newColor[2]));
                            }
                            continue;
                        }
                        const text = this.align === 'right' ? ` ${word}` : `${word} `;
                        const pdfWord = {
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
        let currentWords = [];
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
                }
                else {
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
    writeWords(x, words) {
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
    moveDown(height) {
        this.moveDownAndAddPageIfNecessary(height, { newPageOffsetY: height, marginBottom: this.pdf.marginBottom });
    }
}
exports.PDFTextBlock = PDFTextBlock;
//# sourceMappingURL=pdf.helper.js.map