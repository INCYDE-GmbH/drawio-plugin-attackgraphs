import { expect, Locator, Page } from '@playwright/test';

export class DrawioPage {
  readonly page: Page;
  readonly getStartedLink: Locator;
  readonly coreConceptsLink: Locator;
  readonly tocList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.getStartedLink = page.locator('text=Get started');
    this.coreConceptsLink = page.locator('text=Core concepts');
    this.tocList = page.locator('article ul > li > a');
  }

  async addActivityNode() {
    await this.page.locator('.geSidebarContainer').locator('text=Attack Step').last().click();
  }

  async applyStringToAceEditor(text: string) {
    await this.page.press('textarea', 'Meta+a');
    await this.page.locator('textarea').fill(text);
    await this.applyDialog();
  }

  async focusCellInDiagramContainer() {
    await this.page.locator('.geDiagramContainer').locator('text=Attack Step').click();
  }

  async openAggregationFunctionDialogOnActivityNode() {
    await this.focusCellInDiagramContainer();
    await this.page.locator('img.ag_function_handle').last().click();
  }

  async selectDialogRadioButton(name: string) {
    await this.page.click(`span:has-text(\"${name}\")`);
  }

  async openComputedAttributesFunctionDialogOnActivityNode() {
    await this.focusCellInDiagramContainer();
    await this.page.locator('img.ag_computed_attributes_handle').last().click();
  }

  async openComputedAttributesFunctionDialogOnLocator(locator: Locator) {
    await locator.click();
    await this.page.locator('img.ag_computed_attributes_handle').last().click();
  }

  async openAggregationFunctionDialogOnLocator(locator: Locator) {
    await locator.click();
    await this.page.locator('img.ag_function_handle').last().click();
  }

  async openDataDialogOnActivityNode() {
    await this.focusCellInDiagramContainer();
    await this.page.press('body', 'Control+m');
  }

  async addEntryToDataDialog(name: string, value: string) {
    const dialog = this.page.locator('.geDialog').last();
    await dialog.locator('[placeholder="Enter Property Name"]').fill(name);
    await dialog.locator('[placeholder="Enter Property Name"]').press('Tab');
    await dialog.locator('text=Add Property').click();
    await dialog.locator(`text="${name}:" >> xpath=.. >> textarea`).fill(value);
    this.applyDialog();
  }

  async addAttributeToInGlobaAttributesDialog(attributeName: string, attributeValue: string, maxValue: string) {
    await this.page.locator('input[placeholder=\'Attribute Name\']').fill(attributeName);
    await this.page.locator('input[placeholder=Value]').fill(attributeValue);
    await this.page.click('text=Add Property');
    await this.page.locator('input[name=max]').last().type(maxValue);
  }

  async openGlobalDefaultAttributesDialog() {
    await this.page.click('text=Attack Graphs');
    await this.page.click('text=Default Attributes...');
  }

  async openGlobalAggregationFunctionDialog() {
    await this.page.click('text=Attack Graphs');
    await this.page.click('text=Aggregation Functions...');
  }

  async openGlobalComputedAttributesFunctionDialog() {
    await this.page.click('text=Attack Graphs');
    await this.page.click('text=Computed Attributes...');
  }

  async selectFirstFunctionAsDefaultForVertexType(vertexType: string) {
    await this.page.locator('input[name=' + vertexType + ']').first().click();
  }

  async applyDialog() {
    const dialog = this.page.locator('.geDialog').last();
    await dialog.locator('text=Apply').last().click();
  }

  async clickDialogButton(text: string) {
    const dialog = this.page.locator('.geDialog').last();
    await dialog.locator(`text=${text}`).last().click();
  }

  async fillEditFunctionDialog(functionName: string, content: string) {
    await this.enterFunctionName(functionName);
    await this.applyStringToAceEditor(content);
  }

  async enterFunctionName(name: string) {
    await this.page.locator('text=Name').locator('xpath=..').locator('input').fill(name);
  }

  async openDefaultAttributesDialog() {
    await this.page.locator('.geMenubar').locator('text=Attack Graphs').click();
    await this.page.locator('.mxPopupMenu').locator('text=Default Attributes...').click();
  }

  async addPropertyInDefaultDialog(prop1: string) {
    await this.page.locator('input[placeholder=\'Attribute Name\']').fill(prop1);
    await this.page.locator('input[placeholder=Value]').fill('10');
    await this.page.locator('text=Add Property').click();
    await this.page.locator('input[name="max"]').last().fill('100');
  }

  async removePropertyFromDefaultDialog(prop1: string) {
    await this.page.locator(`tr:has-text(\"${prop1}\")`).locator('a.geButton').click();
  }

  async openIconPickerDialogOnFirstAttribute() {
    await this.page.locator('table.properties').locator('tr').first().locator('td').locator('span').click();
  }

  async selectLastIconFromIconPickerDialog() {
    await this.page.locator('tbody').locator('tr').last().locator('td').last().click();
    await this.page.locator('.geDialog').last().locator('text=Apply').click();
  }

  async expectToFindCellAttribute(value: string) {
    await expect(this.page.locator('.geDiagramContainer').locator(`text=${value}`)).toBeVisible();
  }

  async expectToFindCellAttributeWithStrikethrough(value: string) {
    await expect(this.page.locator(`.geDiagramContainer g[text-decoration=line-through] >> text=${value}`)).toBeVisible()
  }

  async expectSensitivityAnalysisDisabled() {
    await this.page.locator('#ag_enableSensitivityAnalysis').waitFor({state: 'visible'});
  }

  async loadGraph(graph: string) {
    await this.page.click('text=Extras');
    await this.page.locator('.mxPopupMenu').locator('text=Edit Diagram...').click();
    await this.page.keyboard.press('Control+A');
    await this.page.locator('.geDialog').locator('textarea').fill(graph);

    await this.page.click('text=OK');
  }
}
