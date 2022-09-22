FROM jgraph/drawio:20.3.5

# Install plugin
COPY dist/attackgraphs.js $CATALINA_HOME/webapps/draw/plugins/attackgraphs.js

# Install diagram template
COPY dist/templates/AttackGraphTemplate_RKL.drawio $CATALINA_HOME/webapps/draw/templates/basic/attackgraph_RKL.xml
COPY dist/templates/AttackGraphTemplate_TS50701.drawio $CATALINA_HOME/webapps/draw/templates/basic/attackgraph_TS50701.xml

RUN sed -i '/<template url/d' $CATALINA_HOME/webapps/draw/templates/index.xml

RUN sed -i 's|</templates>|<template url="basic/attackgraph_RKL.xml" title="attackGraphs.attackGraph_RKL" libs="general;attackGraphs.attackGraphs" tags="attackGraphs.attackGraphs"/>\n<template url="basic/attackgraph_TS50701.xml" title="attackGraphs.attackGraph_TS50701" libs="general;attackGraphs.attackGraphs" tags="attackGraphs.attackGraphs"/>\n</templates>|g' $CATALINA_HOME/webapps/draw/templates/index.xml
# Lend an icon
RUN cp $CATALINA_HOME/webapps/draw/templates/other/decision_tree.png $CATALINA_HOME/webapps/draw/templates/basic/attackgraph_RKL.png
RUN cp $CATALINA_HOME/webapps/draw/templates/other/decision_tree.png $CATALINA_HOME/webapps/draw/templates/basic/attackgraph_TS50701.png

ENV DRAWIO_BASE_URL=https://incyde-gmbh.github.io/drawio-plugin-attackgraphs/app
ENV DRAWIO_CONFIG="{\"plugins\": [\"${DRAWIO_BASE_URL}/plugins/attackgraphs.js\"]}"

# Activate custom plugins (TODO: Replace if base image has an option to activate custom plugins)
RUN sed -i '38a\echo "window.ALLOW_CUSTOM_PLUGINS = true;" >> \$CATALINA_HOME/webapps/draw/js/PreConfig.js' /docker-entrypoint.sh

# Configure draw.io
RUN /docker-entrypoint.sh
