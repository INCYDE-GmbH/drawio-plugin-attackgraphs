## Attack Graphs Plugin for Draw.io

### Browser Version

[Launch draw.io](app) in your browser. No need for an installation.

### Draw.io Desktop

For draw.io Desktop, you can obtain the latest version of the plugin from here:

<a href="https://incyde-gmbh.github.io/drawio-plugin-attackgraphs/app/plugins/attackgraphs.js" download>Download attackgraphs.js</a>

Open draw.io Desktop and load the plugin file using the `Extras > Plugins...` dialog.

**Attention!**
Starting from v19.0.3, plugins in drawio-desktop are disabled (see <a href="https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/issues/72">#72</a> and <a href="https://github.com/jgraph/drawio-desktop/releases/tag/v19.0.3">drawio-desktop Release Notes</a>).

You can either use a version of drawio-desktop before v19.0.3 or start drawio-desktop from the command line including the parameter `--enable-plugins`.


### Templates

#### Attack Graph Templates

The browser version already provides graph templates for the analysis methods "RKL" and "TS 50701".
If you want to use the templates in the desktop version, you can download them, open them in draw.io and edit them as you like.

- <a href="https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/releases/latest/download/AttackGraphTemplate_RKL.drawio" download>RKL Attack Graph template</a>
- <a href="https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/releases/latest/download/AttackGraphTemplate_TS50701.drawio" download>TS 50701 Attack Graph template</a>

#### Attributes and Functions Templates

If you want to use the attributes and functions of the analysis methods "RKL" and "TS 50701" in your graph, you can import them via `Attack Graphs > Import Attributes and Functions...`.
Download the templates here:

- <a href="https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/releases/latest/download/Attributes_Functions_RKL.json" download>RKL attributes and functions template</a>
- <a href="https://github.com/INCYDE-GmbH/drawio-plugin-attackgraphs/releases/latest/download/Attributes_Functions_TS50701.json" download>TS 50701 attributes and functions template</a>

If you started from an Attack Graph template of the analysis method, there is no need to import attributes and functions as they were already contained in the graph template.

### User Guide

- [Default Attributes](default_attributes.md)
- [Aggregation Functions](aggregation_functions.md)
- [Computed Attributes](computed_attributes_functions.md)
- [Linking Attack Graphs](link_graphs.md)
- [Function Templates](templates.md)

### Acknowledgements

This software is provided by [INCYDE GmbH](https://incyde.com/) in collaboration with Systems Lab 21 GmbH as part of the project *[Prognose Securitybedarf und Bewertung möglicher Sicherheitskonzepte für das System Bahn](https://www.dzsf.bund.de/SharedDocs/Standardartikel/DZSF/Projekte/Projekt_49_Securitybedarf.html)*, funded by the German Centre for Rail Traffic Research at the Federal Railway Authority.
