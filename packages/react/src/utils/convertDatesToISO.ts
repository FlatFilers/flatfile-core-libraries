export function convertDatesToISO(obj: any): any {
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  if (Array.isArray(obj)) {
    return obj.map(convertDatesToISO);
  }
  if (typeof obj === 'object' && obj !== null) {
    const newObj: { [key: string]: any } = {};
    for (const key of Object.keys(obj)) {
      newObj[key] = convertDatesToISO(obj[key]);
    }
    return newObj;
  }
  return obj;
}
