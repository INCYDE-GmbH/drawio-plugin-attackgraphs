FROM jgraph/drawio:17.4.2

# Install plugin
COPY dist/attackgraphs.js $CATALINA_HOME/webapps/draw/plugins/attackgraphs.js

# Install diagram template
COPY dist/templates/AttackGraphTemplate.drawio $CATALINA_HOME/webapps/draw/templates/basic/attackgraph.xml
RUN sed -i 's|<templates>|<templates><template url="basic/attackgraph.xml" title="attackGraphs.attackGraph" libs="general;attackGraphs.attackGraphs" tags="attackGraphs.attackGraphs"/>|g' $CATALINA_HOME/webapps/draw/templates/index.xml
# Lend an icon
RUN cp $CATALINA_HOME/webapps/draw/templates/other/decision_tree.png $CATALINA_HOME/webapps/draw/templates/basic/attackgraph.png

ENV DRAWIO_BASE_URL=https://incyde-gmbh.github.io/drawio-plugin-attackgraphs/app
ENV DRAWIO_CONFIG="{\"plugins\": [\"${DRAWIO_BASE_URL}/plugins/attackgraphs.js\"]}"

# Configure draw.io
RUN /docker-entrypoint.sh
