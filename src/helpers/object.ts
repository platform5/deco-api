export class ObjectHelper {
  public static filter(original: object, allowed: string[]): object {
    return Object.keys(original)
      .filter(key => allowed.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = (original as any)[key];
        return obj;
      }, {}
    );
  }

  public static includeKeys(original: object, allowed: string[]): object {
    return ObjectHelper.filter(original, allowed);
  }

  public static excludeKeys(original: object, rejected: string[]): object {
    return Object.keys(original)
      .filter(key => !rejected.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = (original as any)[key];
        return obj;
      }, {}
    );
  }
}