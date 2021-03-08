import { TypeDecorator } from './type-decorator';
import gjv from 'geojson-validation';

export let geojsonFeatureDecorator = new TypeDecorator('geojsonFeature');
export const geojsonFeature = geojsonFeatureDecorator.decorator();

geojsonFeatureDecorator.input = (key: string, value: any, options: any, element: any, target: any) => {
  return Promise.resolve(value);
}

geojsonFeatureDecorator.output = (key: string, value: any, options: any, element: any, target: any) => {
  return Promise.resolve(value);
}

geojsonFeatureDecorator.validate = (value: any, obj: any, options: any) => {
  return validateGeojson(value, options);
};

export function validateGeojson(value: any, options: any) {
  return Promise.resolve(gjv.isFeature(value, false))
}