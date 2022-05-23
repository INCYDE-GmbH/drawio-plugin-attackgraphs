import { STORAGE_NAME_GLOBAL_COMPUTED_FUNCTION, STORAGE_NAME_GLOBAL_COMPUTED_FUNCTIONS, STORAGE_NAME_GLOBAL_AGGREGATION_FUNCTION, STORAGE_NAME_GLOBAL_AGGREGATION_FUNCTIONS, STORAGE_NAME_GLOBAL_ATTRIBUTE, STORAGE_NAME_GLOBAL_ATTRIBUTES, STORAGE_NAME_CUSTOM_FUNCTION, STORAGE_ID_NONE_FUNCTION } from '../CellUtils';
import { AttackgraphFunction, AttackgraphFunctionFormat, CellFunctionFormat, CellFunctionType, GlobalAttribute } from '../Model';
import { AttributeProvider } from './AttributeProvider';

export const USABLE_NAME_OF_COMPUTED_ATTRIBUTE_OF_CELL = 'label';

export class RootAttributeProvider extends AttributeProvider {
  constructor(graph: Draw.EditorGraph) {
    super(graph.getModel().root);
  }


  static getRenderableAttributes(attributes: GlobalAttribute[]): GlobalAttribute[] {
    return attributes.filter(attribute => attribute.iconName !== '' && AttributeProvider.shouldRenderAttribute(attribute.name))
  }

  getTooltip(): string {
    return '';
  }

  getGlobalComputedAttributesFunctionByID(id: string): AttackgraphFunction | null {
    const globalFunctions = this.getGlobalComputedAttributesFunctions().filter(fn => fn.id === id);
    return this.getGlobalFunctionByID(globalFunctions);
  }

  getGlobalAggregationFunctionByID(id: string): AttackgraphFunction | null {
    const globalFunctions = this.getGlobalAggregationFunctions().filter(fn => fn.id === id);
    return this.getGlobalFunctionByID(globalFunctions);
  }

  private getGlobalFunctionByID(functions: AttackgraphFunction[]): AttackgraphFunction | null {
    if (functions.length > 0) {
      return { name: functions[0].name, fn: functions[0].fn, id: functions[0].id, default: functions[0].default };
    } else {
      return null;
    }
  }

  resolveGlobalFunction(fn: AttackgraphFunctionFormat, type: CellFunctionType): AttackgraphFunction | null {
    if (fn.format === CellFunctionFormat.CUSTOM) {
      return { name: STORAGE_NAME_CUSTOM_FUNCTION, fn: fn.inlineFunctionOrReference, id: '', default: [] };
    } else {
      if (fn.inlineFunctionOrReference === STORAGE_ID_NONE_FUNCTION) {
        return { name: '', id: STORAGE_ID_NONE_FUNCTION, fn: '', default: []}; // TODO: empty default array might cause problems...
      } else {
        if (type === CellFunctionType.AGGREGATION) {
          return this.getGlobalAggregationFunctionByID(fn.inlineFunctionOrReference);
        }
        if (type === CellFunctionType.COMPUTED_ATTRIBUTE) {
          return this.getGlobalComputedAttributesFunctionByID(fn.inlineFunctionOrReference);
        }
        return null;
      }
    }
  }

  getGlobalAttributes(): GlobalAttribute[] | null {
    return this.getGlobalAttributesFromCell();
  }

  getGlobalAttributesFromCell(): GlobalAttribute[] | null {
    return this.getGroupedValuesFromCell<GlobalAttribute>(STORAGE_NAME_GLOBAL_ATTRIBUTES);
  }

  getGlobalAttributeFromCell(name: string): GlobalAttribute | null {
    return this.getValueFromGroupInCell<GlobalAttribute>(STORAGE_NAME_GLOBAL_ATTRIBUTES, name);
  }

  getGlobalAttribute(name: string): GlobalAttribute | null {
    return this.getGlobalAttributeFromCell(name);
  }

  storeGlobalAttributesInCell(attributes: GlobalAttribute[]): void {
    this.storeGroupedValuesInCell<GlobalAttribute>(STORAGE_NAME_GLOBAL_ATTRIBUTES, STORAGE_NAME_GLOBAL_ATTRIBUTE, attributes);
  }

  static storeGlobalAttributesInElement(element: Element, attributes: GlobalAttribute[]): void {
    AttributeProvider.storeGroupedValuesInElement<GlobalAttribute>(STORAGE_NAME_GLOBAL_ATTRIBUTES, STORAGE_NAME_GLOBAL_ATTRIBUTE, attributes, element);
  }

  setGlobalAttributes(attributes: GlobalAttribute[]): void {
    this.storeGlobalAttributesInCell(attributes);
  }

  setGlobalComputedAttributesFunctions(aggregationFunctions: AttackgraphFunction[]): void {
    this.setGlobalFunctions(aggregationFunctions, STORAGE_NAME_GLOBAL_COMPUTED_FUNCTION, STORAGE_NAME_GLOBAL_COMPUTED_FUNCTIONS);
  }

  setGlobalAggregatonFunctions(aggregationFunctions: AttackgraphFunction[]): void {
    this.setGlobalFunctions(aggregationFunctions, STORAGE_NAME_GLOBAL_AGGREGATION_FUNCTION, STORAGE_NAME_GLOBAL_AGGREGATION_FUNCTIONS);
  }

  setGlobalFunctions(functions: AttackgraphFunction[], global_function_name: string, global_function_group_name: string): void {
    const xml = mxUtils.createXmlDocument();
    const value = this.parseCellValue();

    const xmlFns = functions.map(fn => {
      const fnObject = xml.createElement(global_function_name);
      fnObject.setAttribute('name', fn.name);
      fnObject.setAttribute('id', fn.id);
      fnObject.setAttribute('default', fn.default.join(';'));
      fnObject.setAttribute('fn', fn.fn);
      return fnObject;
    });

    const functionsObj = xml.createElement(global_function_group_name);
    for (const functionObj of xmlFns) {
      functionsObj.appendChild(functionObj);
    }

    const rootChildren = Array.from(value.children || []);
    const global_functions = rootChildren.filter(child => child.tagName === global_function_group_name);
    if (global_functions.length > 0) {
      value.replaceChild(functionsObj, global_functions[0]);
    } else {
      value.appendChild(functionsObj);
    }

    this.cell.setValue(value);
  }

  getGlobalComputedAttributesFunctions(): AttackgraphFunction[] {
    return this.getGlobalFunctions(STORAGE_NAME_GLOBAL_COMPUTED_FUNCTION, STORAGE_NAME_GLOBAL_COMPUTED_FUNCTIONS);
  }

  getGlobalAggregationFunctions(): AttackgraphFunction[] {
    return this.getGlobalFunctions(STORAGE_NAME_GLOBAL_AGGREGATION_FUNCTION, STORAGE_NAME_GLOBAL_AGGREGATION_FUNCTIONS);
  }

  getGlobalFunctions(global_function_name: string, global_function_group_name: string): AttackgraphFunction[] {
    const value = this.parseCellValue();

    const rootChildren = Array.from(value.children || []);
    const functions = rootChildren.filter(child => child.tagName === global_function_group_name)[0] || null;
    if (!functions) {
      return [];
    }

    const functionChildren = Array.from(functions.children || []);
    return functionChildren.filter(child => child.tagName === global_function_name)
      .map(fn => {
        const attributes = Object.fromEntries(Object.values(fn.attributes).map(attr => [attr.name, attr.value]));
        return { name: attributes.name, fn: attributes.fn, id: attributes.id, default: attributes.default.split(';')};
      });
  }
}
