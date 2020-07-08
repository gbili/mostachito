import getNestedPath from "./getNestedPath";

function isKeyOfViewData(viewData: PeelingPossibleSubOnions, idx: any): idx is keyof ViewData | keyof string | keyof ViewData[] | keyof string[] {
  return viewData.hasOwnProperty(idx);
}

export default function peelOnion(data: PeelingPossibleSubOnions, pathArray: Peeler[], notFound: Symbol): PeelingPossibleSubOnions | typeof notFound {
  if (typeof data !== 'object') {
    throw new TypeError('You must pass an object to access its properties');
  }
  const [thisLevel, ...deeperPathArray] = pathArray;
  if (!isKeyOfViewData(data, thisLevel)) {
    return notFound;
  }
  const deeperData = data[thisLevel as number]; // this is a bug because typing is all messed up (we actually want to allow number | string, but ts doesn't)
  if (pathArray.length === 1) {
    return deeperData;
  }
  return peelOnion(deeperData, deeperPathArray, notFound);
}

export function peelOnionUsingDotRef(data: ViewData, dotsRef: string, missingRefCallback: MissingRefCallback = ref => {throw new Error(`Missing ref ${ref}`);}) {
  const notFound = Symbol();
  const value = peelOnion(data, getNestedPath(dotsRef), notFound);
  if (value === notFound) {
    return missingRefCallback(dotsRef);
  }
  return value;
}
