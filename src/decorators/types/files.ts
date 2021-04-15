import { UpdateQuery } from './../../helpers/update-query';
import { TypeDecorator } from './type-decorator';
import { Settings } from '../../helpers/settings';
import { Model } from '../model';
import Calipers from 'calipers';
let debug = require('debug')('deco-api:decorators:types:files');

let addFileToRemoveToElementInstance = (instance: Model, file: any) => {
  if (!instance.filesToRemove) instance.filesToRemove = [];
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
}

export let fileDecorator = new TypeDecorator('file');
fileDecorator.defaultOptions = {
  accepted: ['image/*', 'application/pdf'],
  destination: 'uploads/'
}
fileDecorator.input = (key: string, value: any, options: any, element: any, target: any) => {
  if (value === 'null') value = null;
  if (value === 'undefined') value = undefined;
  // clear null values
  if (value === null || value === undefined) {
    value = undefined;
    if (element[key] && typeof element[key] === 'object' && element[key].path) {
      addFileToRemoveToElementInstance(element, element[key]);
    }
    return Promise.resolve(value);
  }

  // transform array value (files[]) into single file value (file) 
  if (Array.isArray(value) && value.length === 1 && typeof value[0] === 'object') value = value[0];

  if (value.filename && element[key] && value.filename !== element[key].filename) {
    addFileToRemoveToElementInstance(element, element[key]);
  }
  
  // init a set of promises for image measurement if previews are present in request
  let measurementPromises: Array<Promise<any>> = [];

  // find previews
  for (let preview of element.request.body[key + Settings.filePreviewSuffix] || []) {
    if (preview.originalname !== value.originalname) continue;
    // measure preview size
    measurementPromises.push(Calipers('png', 'gif', 'jpeg').measure(preview.path));
  }

  // only "measure" image files
  let promise = Promise.resolve();
  if (value.mimetype.substr(0, 6) === 'image/' && !value.mimetype.includes('svg')) {
    promise = Calipers('png', 'gif', 'jpeg').measure(value.path).then((measure: any) => {
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
  }).then((measures: Array<any>) => {
    let index = 0;
    for (let preview of element.request.body[key + Settings.filePreviewSuffix] || []) {
      if (preview.originalname !== value.originalname) continue;
      let measure = measures[index];
      
      let filePreview: any = {
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
fileDecorator.output = (key: string, value: any, options: any, element: any, target: any) => {
  if (value === null || value === undefined) return Promise.resolve(value);
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
fileDecorator.validate = (value: any, obj: any, options: any) => {
  if (value === undefined || value === null) return true;
  if (typeof value !== 'object') return false;
  if (!value.originalname || !value.encoding || !value.mimetype || !value.destination || !value.filename || !value.path || !value.size) return false;
  return true;
};

export const file = fileDecorator.decorator();

export let filesDecorator = new TypeDecorator('files');
filesDecorator.defaultOptions = {
  accepted: ['image/*', 'application/pdf'],
  destination: 'uploads-files/',
  maxCount: 12
}
filesDecorator.input = (key: string, value: any, options: any, element: any, target: any) => {
  if (value === 'null' || value === 'undefined' || value === null || value === undefined) value = [];
  if (value === 'changed') value = [];
  if (!Array.isArray(value) && typeof value === 'object') value = [value];

  value.originalValue = element[key];

  // find out if we must clear the property
  if (element.request.body[key + Settings.fileClearSuffix]) {
    value.clearFiles = true;
  }

  // find file id to remove
  if (element.request.body[key + Settings.fileRemoveSuffix]) {
    if (Array.isArray(element.request.body[key + Settings.fileRemoveSuffix])) {
      value.removeFiles = element.request.body[key + Settings.fileRemoveSuffix];
    }
  }

  if (value.length === 0) return Promise.resolve(value);
  let originalNames: Array<string> = value.map((item: any) => item.originalname);

  // init a set of promises for file measurement
  let fileMeasurementPromises: Array<Promise<any>> = [];
  // init a set of promises for image measurement if previews are present in request
  let previewMeasurementPromises: Array<Promise<any>> = [];

  // measures files promises
  for (let valueItem of value) {
    if (valueItem.mimetype.substr(0, 6) !== 'image/' || valueItem.mimetype.includes('svg')) continue;
    fileMeasurementPromises.push(Calipers('png', 'gif', 'jpeg').measure(valueItem.path).then((measure: any) => {
      if (measure && measure.pages && measure.pages[0]) {
        valueItem.width = measure.pages[0].width,
        valueItem.height = measure.pages[0].height,
        valueItem.ratio = measure.pages[0].width / measure.pages[0].height;
      }
    }));
  } 

  // find previews
  for (let preview of element.request.body[key + Settings.filePreviewSuffix] || []) {
    if (originalNames.indexOf(preview.originalname) === -1) continue;
    // measure preview size
    previewMeasurementPromises.push(Calipers('png', 'gif', 'jpeg').measure(preview.path).then((measure: any) => {
      return {
        preview: preview,
        measure: measure
      };
    }));
  }

  // add the previews to the value, including the preview measurement
  return Promise.all(fileMeasurementPromises).then(() => {
    return Promise.all(previewMeasurementPromises);
  }).then((measures: Array<any>) => {
    for (let measureItem of measures) {
      let valueItem: any = null;
      let preview = measureItem.preview;
      let measure = measureItem.measure;
      // find the right "value" item
      for (let vi of value) {
        if (vi.originalname === preview.originalname) {
          valueItem = vi;

          let filePreview: any = {
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
filesDecorator.output = (key: string, value: any, options: any, element: any, target: any) => {
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
  } else {
    value = [];
  }
  
  return Promise.resolve(value);
};
filesDecorator.toDocument = (updateQuery: UpdateQuery, key: string, value: any, operation: 'insert' | 'update' | 'upsert', options: any, element: any, target: any) => {
  if (operation !== 'update') {
    if (operation === 'insert' && value === undefined) return Promise.resolve();
    if (operation === 'insert' && value === null) return Promise.resolve();
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
  if ((value as any).clearFiles) {
    finalValue = [];
    clearOrRemove = true;
  }

  if ((value as any).removeFiles && Array.isArray((value as any).removeFiles)) {
    let finalValue2 = [];
    for (let file of finalValue) {
      if ((value as any).removeFiles.indexOf(file.filename) !== -1) {
        clearOrRemove = true;
        addFileToRemoveToElementInstance(element, file);
      } else {
        finalValue2.push(file);
      }
    }
    finalValue = finalValue2;
  }

  if (clearOrRemove) {
    for (let newFile of value) {
      finalValue.push(newFile)
    }
    updateQuery.set(key, finalValue);
  } else {
    let newFiles = [];
    for (let newFile of value) {
      newFiles.push(newFile);
    }
    updateQuery.addToSet(key, {$each: newFiles});
  }
  return Promise.resolve();
};
filesDecorator.validate = (value: any, obj: any, options: any) => {
  if (value === null) return false;
  if (value === undefined || value === []) return true;
  for (let file of value) {
    if (!file.originalname || !file.encoding || !file.mimetype || !file.destination || !file.filename || !file.path || !file.size) return false;
  }
  return true;
};

export const files = filesDecorator.decorator();