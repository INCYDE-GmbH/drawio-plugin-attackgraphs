declare const __COMMIT_HASH__: string;

export class Resources {
  static register(lang: string): void {
    switch (lang) {
      case 'de':
        this.registerDe();
        break;
      case 'en':
      default:
        this.registerEn();
        break;
    }
  }

  private static registerEn() {
    mxResources.parse(`
attackGraphs.activity=Attack Step
attackGraphs.control=Security Control
attackGraphs.orNode=OR
attackGraphs.andNode=AND
attackGraphs.addFurther=Add further
attackGraphs.addIconLegend=Add icon legend
attackGraphs.aggregationFunction=Aggregation Function
attackGraphs.aggregationFunctions=Aggregation Functions
attackGraphs.attackGraph=Attack Graph
attackGraphs.attackGraphs=Attack Graphs
attackGraphs.attackGraph_RKL=Attack Graph RKL
attackGraphs.attackGraph_TS50701=Attack Graph TS 50701
attackGraphs.attributeName=Attribute Name
attackGraphs.attributeValue=Value
attackGraphs.computedAttributeFunction=Computed Attribute
attackGraphs.computedAttributes=Computed Attributes
attackGraphs.consequence=Consequence
attackGraphs.defaultAttributes=Default Attributes
attackGraphs.defineAggregationFunction=Define Aggregation Function
attackGraphs.defineComputedAttributesFunction=Define Computed Attributes Function
attackGraphs.defaultFunction=Default Function
attackGraphs.invalidAttributeName=Invalid attribute name
attackGraphs.labelFunction=Label Function
attackGraphs.noItems=No items
attackGraphs.openAggregationFunctionsDialog=Aggregation Functions...
attackGraphs.openComputedAttributesDialog=Computed Attributes...
attackGraphs.openDefaultAttributesDialog=Default Attributes...
attackGraphs.pickIconForAttribute=Pick an Icon for
attackGraphs.propertyDefinedTwice=Property defined twice!
attackGraphs.none=None
attackGraphs.custom=Custom
attackGraphs.mustAssignMaxValue=You have to set the max value for
attackGraphs.setDefaultAttributes=Set default attributes for selection
attackGraphs.setAttackGraphShape=Set selection as attackgraph nodes
attackGraphs.showVersion=Version ${__COMMIT_HASH__}
attackGraphs.enableSensitivityAnalysis=Enable Sensitivity Analysis
attackGraphs.applySensitivityAnalysis=Apply Sensitivity Analysis
attackGraphs.value=Value
attackGraphs.ok=OK
attackGraphs.cancel=Cancel
attackGraphs.yes=Yes
attackGraphs.no=No
attackGraphs.startAnalysisTitle=Start sensitivity analysis
attackGraphs.acceptAnalysisTitle=Accept analysis
attackGraphs.abortAnalysisTitle=Abort analysis
attackGraphs.acceptAnalysisDialog=Do you want to apply the current analysis to the graph?
attackGraphs.documentation=Documentation...
`);
  }

  private static registerDe() {
    mxResources.parse(`
attackGraphs.activity=Angriffsschritt
attackGraphs.control=Kontrollma??nahme
attackGraphs.orNode=ODER
attackGraphs.andNode=UND
attackGraphs.addFurther=Weiteres hinzuf??gen
attackGraphs.addIconLegend=Icon-Legende hinzuf??gen
attackGraphs.aggregationFunction=Aggregierungsfunktion
attackGraphs.aggregationFunctions=Aggregierungsfunktionen
attackGraphs.attackGraph=Attack Graph
attackGraphs.attackGraphs=Attack Graphs
attackGraphs.attributeName=Attributname
attackGraphs.attributeValue=Wert
attackGraphs.computedAttributeFunction=Berechnetes Attribut
attackGraphs.computedAttributes=Berechnete Attribute
attackGraphs.consequence=Auswirkung
attackGraphs.defaultAttributes=Standardattribute
attackGraphs.defineAggregationFunction=Aggregationsfunktion definieren
attackGraphs.defineComputedAttributesFunction=Berechnetes Attribut definieren
attackGraphs.defaultFunction=Standard Funktion
attackGraphs.invalidAttributeName=Ung??ltiger Attributname
attackGraphs.labelFunction=Berechnetes Attribut
attackGraphs.noItems=Keine Eintr??ge
attackGraphs.openAggregationFunctionsDialog=Aggregierungsfunktionen...
attackGraphs.openComputedAttributesDialog=Berechnete Attribute...
attackGraphs.openDefaultAttributesDialog=Standardattribute...
attackGraphs.pickIconForAttribute=W??hle ein Bild f??r
attackGraphs.propertyDefinedTwice=Doppeltes Attribut!
attackGraphs.none=Keine
attackGraphs.custom=Benutzerdefiniert
attackGraphs.mustAssignMaxValue=Sie m??ssen einen Maximalwert setzen f??r
attackGraphs.setDefaultAttributes=Setze Standardattribute f??r Auswahl
attackGraphs.setAttackGraphShape=Markiere Auswahl als Attack Graph Knoten
attackGraphs.showVersion=Version ${__COMMIT_HASH__}
attackGraphs.enableSensitivityAnalysis=Sensitivit??tsanalyse aktivieren
attackGraphs.applySensitivityAnalysis=Sensitivit??tsanalyse anwenden
attackGraphs.value=Wert
attackGraphs.ok=OK
attackGraphs.cancel=Abbrechen
attackGraphs.yes=Ja
attackGraphs.no=Nein
attackGraphs.startAnalysisTitle=Sensitivit??tsanalysis starten
attackGraphs.acceptAnalysisTitle=Analyse anwenden
attackGraphs.abortAnalysisTitle=Analyse verwerfen
attackGraphs.acceptAnalysisDialog=Wollen sie die aktuelle Sensitivit??tsanalyse auf den Graphen anwenden?
attackGraphs.documentation=Dokumentation...
  `);
  }
}
