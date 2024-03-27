FROM jgraph/drawio:24.2.0

RUN sed -i '/<template url/d' $CATALINA_HOME/webapps/draw/templates/index.xml
RUN sed -i 's|</templates>|<template url="basic/attackgraph_RKL.xml" title="attackGraphs.attackGraph_RKL" libs="general;attackGraphs.attackGraphs" tags="attackGraphs.attackGraphs"/>\n<template url="basic/attackgraph_TS50701.xml" title="attackGraphs.attackGraph_TS50701" libs="general;attackGraphs.attackGraphs" tags="attackGraphs.attackGraphs"/>\n</templates>|g' $CATALINA_HOME/webapps/draw/templates/index.xml

# Lend an icon
RUN cp $CATALINA_HOME/webapps/draw/templates/other/decision_tree.png $CATALINA_HOME/webapps/draw/templates/basic/attackgraph_RKL.png
RUN cp $CATALINA_HOME/webapps/draw/templates/other/decision_tree.png $CATALINA_HOME/webapps/draw/templates/basic/attackgraph_TS50701.png

ENV DRAWIO_BASE_URL=https://incyde-gmbh.github.io/drawio-plugin-attackgraphs/app
ENV DRAWIO_SELF_CONTAINED=1

# Activate attack graphs plugin (DRAWIO_CONFIG cannot be used to specify activated plugins)
USER root
RUN sed -i '28a\echo "window.ALLOW_CUSTOM_PLUGINS = true;" >> \$CATALINA_HOME/webapps/draw/js/PreConfig.js' /docker-entrypoint.sh && \
    sed -i '114a\echo "var plugins = mxSettings.getPlugins();" >> \$CATALINA_HOME/webapps/draw/js/PostConfig.js' /docker-entrypoint.sh && \
    sed -i '115a\echo "if (!plugins.includes(\\"plugins/attackgraphs.js\\")) {" >> \$CATALINA_HOME/webapps/draw/js/PostConfig.js' /docker-entrypoint.sh && \
    sed -i '116a\echo "  plugins.push(\\"plugins/attackgraphs.js\\");" >> \$CATALINA_HOME/webapps/draw/js/PostConfig.js' /docker-entrypoint.sh && \
    sed -i '117a\echo "  mxSettings.setPlugins(plugins);" >> \$CATALINA_HOME/webapps/draw/js/PostConfig.js' /docker-entrypoint.sh && \
    sed -i '118a\echo "}" >> \$CATALINA_HOME/webapps/draw/js/PostConfig.js' /docker-entrypoint.sh
USER ${RUN_USER}

# Configure draw.io
RUN /docker-entrypoint.sh
