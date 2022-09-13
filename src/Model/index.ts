export type KeyValuePairs = { [k: string]: string };
export type CellChildAttributes = KeyValuePairs;
export type CellDataCollection = {
  globalAttributes: GlobalAttributeDict,
  cellAttributes: KeyValuePairs,
}
export type ChildCellDataCollection = {
  globalAttributes: GlobalAttributeDict,
  childAttributes: ChildCellData[],
  localAttributes: KeyValuePairs,
  id: string
};

export type GlobalAttributeDict = { [name: string]: {name: string, value: string, min: string, max: string} }
export type ChildCellData = {
  edgeWeight: string | null,
  attributes: KeyValuePairs,
  computedAttribute: string,
  id: string
};

export type GlobalAttribute = {
  name: string,
  value: string,
  min: string,
  max: string,
  iconName: string
};

export enum CellFunctionFormat { CUSTOM, REFERENCE }
export enum CellFunctionType { AGGREGATION, COMPUTED_ATTRIBUTE }
export type AttackgraphFunction = {
  name: string,
  id: string,
  default: string[],
  fn: string
}
export type AttackgraphFunctionFormat = { format: CellFunctionFormat, inlineFunctionOrReference: string }
export type NodeValues = {
  current: KeyValuePairs,
  old: KeyValuePairs,
}

export const getRandomString = (length: number) => {
  return Math.random().toString(20).substring(2, length);
}

export const getUUID = () => {
  return getRandomString(24);
}
