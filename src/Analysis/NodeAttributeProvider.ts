import { STORAGE_NAME_AGGREGATION_FUNCTION_REFERENCE, STORAGE_NAME_CUSTOM_AGGREGATION_FUNCTION, STORAGE_NAME_COMPUTED_ATTRIBUTES_FUNCTION_REFERENCE, STORAGE_NAME_CUSTOM_COMPUTED_ATTRIBUTES, STORAGE_NAME_ATTRIBUTES, STORAGE_NAME_COMPUTED_ATTRIBUTES, STORAGE_NAME_CUSTOM_FUNCTION } from '../CellUtils';
import { AttackgraphFunctionFormat, CellFunctionFormat, KeyValuePairs, AttackgraphFunction, CellFunctionType, NodeValues } from '../Model';
import { AttributeProvider } from './AttributeProvider';
import { RootAttributeProvider } from './RootAttributeProvider';

export class NodeAttributeProvider extends AttributeProvider {
  resolveComputedAttributesFunction(graph: RootAttributeProvider): AttackgraphFunction | null {
    const fn = this.getComputedAttributeFunctionOfCell();
    if (fn !== null) {
      return graph.resolveGlobalFunction(fn, CellFunctionType.COMPUTED_ATTRIBUTE);
    }
    return null;
  }

  resolveAggregationFunction(graph: RootAttributeProvider): AttackgraphFunction | null {
    const fn = this.getAggregationFunctionOfCell();
    if (fn !== null) {
      return graph.resolveGlobalFunction(fn, CellFunctionType.AGGREGATION);
    }
    return null;
  }

  resolveComputedAttributesFunctionIDOfCell(): string | null {
    const fn = this.getComputedAttributeFunctionOfCell();
    if (fn === null) {
      return null;
    }
    return this.resolveFunctionIDOfCell(fn);
  }

  resolveAggregationFunctionIDOfCell(): string | null {
    const fn = this.getAggregationFunctionOfCell();
    if (fn === null) {
      return null;
    }
    return this.resolveFunctionIDOfCell(fn);
  }

  resolveFunctionIDOfCell(fn: AttackgraphFunctionFormat): string | null {
    if (fn.format === CellFunctionFormat.CUSTOM) {
      return STORAGE_NAME_CUSTOM_FUNCTION;
    } else {
      return fn.inlineFunctionOrReference;
    }
  }

  getFunctionOfCell(reference_name: string, custom_name: string): AttackgraphFunctionFormat | null {
    const custom = this.getStringStoredInCell(custom_name);
    const reference = this.getStringStoredInCell(reference_name);
    if (custom !== null) {
      return { format: CellFunctionFormat.CUSTOM, inlineFunctionOrReference: custom };
    } else if (reference !== null) {
      return { format: CellFunctionFormat.REFERENCE, inlineFunctionOrReference: reference };
    } else {
      return null;
    }
  }

  getAggregationFunctionOfCell(): AttackgraphFunctionFormat | null {
    return this.getFunctionOfCell(STORAGE_NAME_AGGREGATION_FUNCTION_REFERENCE, STORAGE_NAME_CUSTOM_AGGREGATION_FUNCTION);
  }

  getComputedAttributeFunctionOfCell(): AttackgraphFunctionFormat | null {
    return this.getFunctionOfCell(STORAGE_NAME_COMPUTED_ATTRIBUTES_FUNCTION_REFERENCE, STORAGE_NAME_CUSTOM_COMPUTED_ATTRIBUTES);
  }

  getAggregatedCellValues(): KeyValuePairs {
    return this.getValuesStoredInCell(STORAGE_NAME_ATTRIBUTES) || {};
  }

  setAggregatedCellValues(values: KeyValuePairs): void {
    this.storeValuesInCell(STORAGE_NAME_ATTRIBUTES, values);
  }

  setComputedAttributesForCell(computedAttributes: KeyValuePairs | null): void {
    if (computedAttributes) {
      this.storeValuesInCell(STORAGE_NAME_COMPUTED_ATTRIBUTES, computedAttributes);
    } else {
      this.storeValuesInCell(STORAGE_NAME_COMPUTED_ATTRIBUTES, {});
    }
  }

  getComputedAttributesForCell(): KeyValuePairs | null {
    return this.getValuesStoredInCell(STORAGE_NAME_COMPUTED_ATTRIBUTES);
  }

  setCellComputedAttributesFunction(aggregationFunction: string, format: CellFunctionFormat): void {
    this.setCellFunction(aggregationFunction, format, STORAGE_NAME_COMPUTED_ATTRIBUTES_FUNCTION_REFERENCE, STORAGE_NAME_CUSTOM_COMPUTED_ATTRIBUTES);
  }

  setCellAggregationFunction(aggregationFunction: string, format: CellFunctionFormat): void {
    this.setCellFunction(aggregationFunction, format, STORAGE_NAME_AGGREGATION_FUNCTION_REFERENCE, STORAGE_NAME_CUSTOM_AGGREGATION_FUNCTION);
  }

  setCellFunction(functionNameOrContent: string, format: CellFunctionFormat, reference_name: string, custom_name: string): void {
    if (format === CellFunctionFormat.CUSTOM) {
      this.storeStringInCell(custom_name, functionNameOrContent);
      this.removeStringFromCell(reference_name);
    } else {
      this.storeStringInCell(reference_name, functionNameOrContent);
      this.removeStringFromCell(custom_name);
    }
  }

  getAllValues(): NodeValues {
    return {
      current: { ...this.getCellValues(), ...this.getAggregatedCellValues() } as KeyValuePairs,
      old: this.getCellValues()
    }
  }

  setCellAttributes(attributes: {name: string, value: string}[]): void {
    const result = this.getCellValues();
    for (const attr of attributes) {
      if (attr.value === null) {
        continue;
      }
      result[attr.name] = attr.value;
    }
    this.replaceCellValue(result);
  }

  getCurrentCellValuesNotLabel(): KeyValuePairs {
    return Object.fromEntries(Object.entries(this.getAllValues().current).filter(([k,]) => k !== 'label'));
  }

  getTooltip(): string {
    return super.keyValuePairsToString(this.getCurrentCellValuesNotLabel());
  }
}
