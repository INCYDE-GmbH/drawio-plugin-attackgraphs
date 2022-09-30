## Attack Graphs Plugin for Draw.io

[Launch draw.io](app)

(You must enable the plugin on first start-up via "Extras > Plugins... > Add... > Custom... > plugins/attackgraphs.js > Add > Ok > Apply". Reload the website afterwards.)

### Draw.io Desktop

You can obtain the latest version of the plugin from here:

<a href="https://incyde-gmbh.github.io/drawio-plugin-attackgraphs/app/plugins/attackgraphs.js" download>Download attackgraphs.js</a>

Open draw.io Desktop and load the plugin file using the `Extras > Plugins...` dialog.

**Attention!**
Starting from v19.0.3, plugins in drawio-desktop are disabled (see <a href="https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/issues/72">#72</a> and <a href="https://github.com/jgraph/drawio-desktop/releases/tag/v19.0.3">drawio-desktop Release Notes</a>).

You can either use a version of drawio-desktop before v19.0.3 or start drawio-desktop from the command line including the parameter `--enable-plugins`.


### AttackGraph Diagram Template

If you want to use the default functions that come shipped with this plugin, you can use the **Attack Graph Template** to create new files already containing the default functions. To do so, you will need to navigate to `File > New > From Template URL` and use one of the following URLs:

```
https://incyde-gmbh.github.io/drawio-plugin-attackgraphs/app/templates/basic/attackgraph_RKL.xml
https://incyde-gmbh.github.io/drawio-plugin-attackgraphs/app/templates/basic/attackgraph_TS50701.xml
```

### User Guide

- [Default Attributes](default_attributes.md)
- [Aggregation Functions](aggregation_functions.md)
- [Computed Attributes](computed_attributes_functions.md)
- [Function Templates](templates.md)

### Acknowledgements

This software is provided by [INCYDE GmbH](https://incyde.com/) in collaboration with Systems Lab 21 GmbH as part of the project *[Prognose Securitybedarf und Bewertung möglicher Sicherheitskonzepte für das System Bahn](https://www.dzsf.bund.de/SharedDocs/Standardartikel/DZSF/Projekte/Projekt_49_Securitybedarf.html)*, funded by the German Centre for Rail Traffic Research at the Federal Railway Authority.
