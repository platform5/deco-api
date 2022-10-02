"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.files = exports.filesDecorator = exports.file = exports.fileDecorator = void 0;
const type_decorator_1 = require("./type-decorator");
const settings_1 = require("../../helpers/settings");
const calipers_1 = __importDefault(require("calipers"));
let debug = require('debug')('deco-api:decorators:types:files');
let addFileToRemoveToElementInstance = (instance, file) => {
    if (!instance.filesToRemove)
        instance.filesToRemove = [];
    if (file.path) {
        instance.filesToRemove.push(file.path);
    }
    if (file.previews && Array.isArray(file.previews)) {
        for (let preview of file.previews) {
            if (preview.path) {
                instance.filesToRemove.push(preview.path);
            }
        }
    }
};
exports.fileDecorator = new type_decorator_1.TypeDecorator('file');
exports.fileDecorator.defaultOptions = {
    accepted: ['image/*', 'application/pdf'],
    destination: 'uploads/'
};
exports.fileDecorator.input = (key, value, options, element, target) => {
    if (value === 'null')
        value = null;
    if (value === 'undefined')
        value = undefined;
    // clear null values
    if (value === null || value === undefined) {
        value = undefined;
        if (element[key] && typeof element[key] === 'object' && element[key].path) {
            addFileToRemoveToElementInstance(element, element[key]);
        }
        return Promise.resolve(value);
    }
    // transform array value (files[]) into single file value (file) 
    if (Array.isArray(value) && value.length === 1 && typeof value[0] === 'object')
        value = value[0];
    if (value.filename && element[key] && value.filename !== element[key].filename) {
        addFileToRemoveToElementInstance(element, element[key]);
    }
    // init a set of promises for image measurement if previews are present in request
    let measurementPromises = [];
    // find previews
    for (let preview of element.request.body[key + settings_1.Settings.filePreviewSuffix] || []) {
        if (preview.originalname !== value.originalname)
            continue;
        // measure preview size
        measurementPromises.push(calipers_1.default('png', 'gif', 'jpeg').measure(preview.path));
    }
    // only "measure" image files
    let promise = Promise.resolve();
    if (value.mimetype.substr(0, 6) === 'image/' && !value.mimetype.includes('svg')) {
        promise = calipers_1.default('png', 'gif', 'jpeg').measure(value.path).then((measure) => {
            if (measure && measure.pages && measure.pages[0]) {
                value.width = measure.pages[0].width,
                    value.height = measure.pages[0].height,
                    value.ratio = measure.pages[0].width / measure.pages[0].height;
            }
        });
    }
    // add the previews to the value, including the preview measurement
    return promise.then(() => {
        return Promise.all(measurementPromises);
    }).then((measures) => {
        let index = 0;
        for (let preview of element.request.body[key + settings_1.Settings.filePreviewSuffix] || []) {
            if (preview.originalname !== value.originalname)
                continue;
            let measure = measures[index];
            let filePreview = {
                encoding: preview.encoding,
                mimetype: preview.mimetype,
                destination: preview.destination,
                filename: preview.filename,
                path: preview.path,
                size: preview.size
            };
            if (measure && measure.pages && measure.pages[0]) {
                filePreview.width = measure.pages[0].width;
                filePreview.height = measure.pages[0].height;
                filePreview.ratio = measure.pages[0].width / measure.pages[0].height;
            }
            value.previews = value.previews || [];
            value.previews.push(filePreview);
            index++;
        }
        return value;
    });
};
exports.fileDecorator.output = (key, value, options, element, target) => {
    if (value === null || value === undefined)
        return Promise.resolve(value);
    value = {
        filename: value.filename,
        height: value.height,
        width: value.width,
        size: value.size,
        name: value.originalname,
        type: value.mimetype
    };
    return Promise.resolve(value);
};
exports.fileDecorator.validate = (value, obj, options) => {
    if (value === undefined || value === null)
        return true;
    if (typeof value !== 'object')
        return false;
    if (!value.originalname || !value.encoding || !value.mimetype || !value.destination || !value.filename || !value.path || !value.size)
        return false;
    return true;
};
exports.file = exports.fileDecorator.decorator();
exports.filesDecorator = new type_decorator_1.TypeDecorator('files');
exports.filesDecorator.defaultOptions = {
    accepted: ['image/*', 'application/pdf'],
    destination: 'uploads-files/',
    maxCount: 12
};
exports.filesDecorator.input = (key, value, options, element, target) => {
    if (value === 'null' || value === 'undefined' || value === null || value === undefined)
        value = [];
    if (value === 'changed')
        value = [];
    if (!Array.isArray(value) && typeof value === 'object')
        value = [value];
    value.originalValue = element[key];
    // find out if we must clear the property
    if (element.request.body[key + settings_1.Settings.fileClearSuffix]) {
        value.clearFiles = true;
    }
    // find file id to remove
    if (element.request.body[key + settings_1.Settings.fileRemoveSuffix]) {
        if (Array.isArray(element.request.body[key + settings_1.Settings.fileRemoveSuffix])) {
            value.removeFiles = element.request.body[key + settings_1.Settings.fileRemoveSuffix];
        }
    }
    // find file id to sort
    if (element.request.body[key + settings_1.Settings.fileSortSuffix]) {
        if (Array.isArray(element.request.body[key + settings_1.Settings.fileSortSuffix])) {
            value.sortFiles = element.request.body[key + settings_1.Settings.fileSortSuffix];
        }
    }
    if (value.length === 0)
        return Promise.resolve(value);
    let originalNames = value.map((item) => item.originalname);
    // init a set of promises for file measurement
    let fileMeasurementPromises = [];
    // init a set of promises for image measurement if previews are present in request
    let previewMeasurementPromises = [];
    // measures files promises
    for (let valueItem of value) {
        if (valueItem.mimetype.substr(0, 6) !== 'image/' || valueItem.mimetype.includes('svg'))
            continue;
        fileMeasurementPromises.push(calipers_1.default('png', 'gif', 'jpeg').measure(valueItem.path).then((measure) => {
            if (measure && measure.pages && measure.pages[0]) {
                valueItem.width = measure.pages[0].width,
                    valueItem.height = measure.pages[0].height,
                    valueItem.ratio = measure.pages[0].width / measure.pages[0].height;
            }
        }));
    }
    // find previews
    for (let preview of element.request.body[key + settings_1.Settings.filePreviewSuffix] || []) {
        if (originalNames.indexOf(preview.originalname) === -1)
            continue;
        // measure preview size
        previewMeasurementPromises.push(calipers_1.default('png', 'gif', 'jpeg').measure(preview.path).then((measure) => {
            return {
                preview: preview,
                measure: measure
            };
        }));
    }
    // add the previews to the value, including the preview measurement
    return Promise.all(fileMeasurementPromises).then(() => {
        return Promise.all(previewMeasurementPromises);
    }).then((measures) => {
        for (let measureItem of measures) {
            let valueItem = null;
            let preview = measureItem.preview;
            let measure = measureItem.measure;
            // find the right "value" item
            for (let vi of value) {
                if (vi.originalname === preview.originalname) {
                    valueItem = vi;
                    let filePreview = {
                        encoding: preview.encoding,
                        mimetype: preview.mimetype,
                        destination: preview.destination,
                        filename: preview.filename,
                        path: preview.path,
                        size: preview.size
                    };
                    if (measure && measure.pages && measure.pages[0]) {
                        filePreview.width = measure.pages[0].width;
                        filePreview.height = measure.pages[0].height;
                        filePreview.ratio = measure.pages[0].width / measure.pages[0].height;
                    }
                    valueItem.previews = valueItem.previews || [];
                    valueItem.previews.push(filePreview);
                }
            }
        }
        return value;
    });
};
exports.filesDecorator.output = (key, value, options, element, target) => {
    if (Array.isArray(value)) {
        let newValue = [];
        for (let v of value) {
            let newV = {
                filename: v.filename,
                height: v.height,
                width: v.width,
                size: v.size,
                name: v.originalname,
                type: v.mimetype
            };
            newValue.push(newV);
        }
        value = newValue;
    }
    else {
        value = [];
    }
    return Promise.resolve(value);
};
exports.filesDecorator.toDocument = (updateQuery, key, value, operation, options, element, target) => {
    if (operation !== 'update') {
        if (operation === 'insert' && value === undefined)
            return Promise.resolve();
        if (operation === 'insert' && value === null)
            return Promise.resolve();
        updateQuery.set(key, value);
        return Promise.resolve();
    }
    // for update operation, we must check if we have a remove or clear property
    if (!Array.isArray(value)) {
        // if not array, do nothing
        return Promise.resolve();
    }
    let finalValue = element[key].originalValue || [];
    let clearOrRemove = false; // if this become true, it means that the property cannot be altered with a $push and must be completely rewritten ($set)
    if (value.clearFiles) {
        finalValue = [];
        clearOrRemove = true;
    }
    if (value.removeFiles && Array.isArray(value.removeFiles)) {
        let finalValue2 = [];
        for (let file of finalValue) {
            if (value.removeFiles.indexOf(file.filename) !== -1) {
                clearOrRemove = true;
                addFileToRemoveToElementInstance(element, file);
            }
            else {
                finalValue2.push(file);
            }
        }
        finalValue = finalValue2;
    }
    if (clearOrRemove) {
        for (let newFile of value) {
            finalValue.push(newFile);
        }
        updateQuery.set(key, finalValue);
    }
    else if (value.sortFiles && Array.isArray(value.sortFiles)) {
        let finalValue2 = [];
        for (let filename of (value.sortFiles)) {
            for (let file of finalValue) {
                if (file.filename == filename)
                    finalValue2.push(file);
            }
        }
        finalValue = finalValue2;
        updateQuery.set(key, finalValue);
    }
    else {
        let newFiles = [];
        for (let newFile of value) {
            newFiles.push(newFile);
        }
        updateQuery.addToSet(key, { $each: newFiles });
    }
    return Promise.resolve();
};
exports.filesDecorator.validate = (value, obj, options) => {
    if (value === null)
        return false;
    if (value === undefined || value === [])
        return true;
    for (let file of value) {
        if (!file.originalname || !file.encoding || !file.mimetype || !file.destination || !file.filename || !file.path || !file.size)
            return false;
    }
    return true;
};
exports.files = exports.filesDecorator.decorator();
//# sourceMappingURL=files.js.map