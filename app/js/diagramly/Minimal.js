/**
 * Testing dockable windows.
 */
EditorUi.windowed = urlParams['windows'] != '0';

/**
 * Code for the minimal UI theme.
 */
EditorUi.initMinimalTheme = function()
{
	// Disabled in lightbox and chromeless mode
	if (urlParams['lightbox'] == '1' || urlParams['chrome'] == '0' || typeof window.Format === 'undefined' || typeof window.Menus === 'undefined')
	{
		window.uiTheme = null;
		
		return;
	}
	
	var iw = 0;

	try
	{
		iw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	}
	catch (e)
	{
		// ignore
	}

	function toggleFormat(ui, visible)
	{
		if (EditorUi.windowed)
		{
			var graph = ui.editor.graph;
			graph.popupMenuHandler.hideMenu();
			
			if (ui.formatWindow == null)
			{
				var x = (urlParams['sketch'] == '1') ?
					Math.max(10, ui.diagramContainer.clientWidth - 241) :
					Math.max(10, ui.diagramContainer.clientWidth - 248);
				var y = urlParams['winCtrls'] == '1' && urlParams['sketch'] == '1'? 80 : 60;
				var h = (urlParams['embedInline'] == '1') ? 580 :
					((urlParams['sketch'] == '1') ? 580 : Math.min(566,
						graph.container.clientHeight - 10));
				
				ui.formatWindow = new WrapperWindow(ui, mxResources.get('format'), x, y, 240, h,
					function(container)
				{
					var format = ui.createFormat(container);
					format.init();

					return format;
				});

				ui.formatWindow.window.addListener(mxEvent.SHOW, mxUtils.bind(this, function()
				{
					ui.formatWindow.window.fit();
				}));
				
				ui.formatWindow.window.minimumSize = new mxRectangle(0, 0, 240, 80);
			}
			else
			{
				ui.formatWindow.window.setVisible((visible != null) ?
					visible : !ui.formatWindow.window.isVisible());
			}
		}
		else
		{
			if (ui.formatElt == null)
			{
				ui.formatElt = ui.createSidebarContainer();
				var format = ui.createFormat(ui.formatElt);
				format.init();
				ui.formatElt.style.border = 'none';
				ui.formatElt.style.width = '240px';
				ui.formatElt.style.borderLeft = '1px solid gray';
				ui.formatElt.style.right = '0px';
			}

			var wrapper = ui.diagramContainer.parentNode;

			if (ui.formatElt.parentNode != null)
			{
				ui.formatElt.parentNode.removeChild(ui.formatElt);
				wrapper.style.right = '0px';
			}
			else
			{
				wrapper.parentNode.appendChild(ui.formatElt);
				wrapper.style.right = ui.formatElt.style.width;
			}
		}
	};

	function createSidebar(ui, container)
	{
		var div = document.createElement('div');
		div.style.cssText = 'position:absolute;left:0;right:0;border-top:1px solid lightgray;' +
			'height:24px;bottom:31px;text-align:center;cursor:pointer;padding:6px 0 0 0;';
		div.className = 'geTitle';
		var span = document.createElement('span');
		span.style.fontSize = '18px';
		span.style.marginRight = '5px';
		span.innerHTML = '+';
		div.appendChild(span);
		mxUtils.write(div, mxResources.get('moreShapes'));
		container.appendChild(div);
		
		mxEvent.addListener(div, 'click', function()
		{
			ui.actions.get('shapes').funct();
		});

		var menuObj = new Menubar(ui, container);
		
		function addMenu(id, label)
		{
			var menu = ui.menus.get(id);
			
			var elt = menuObj.addMenu(label, mxUtils.bind(this, function()
			{
				// Allows extensions of menu.functid
				menu.funct.apply(this, arguments);
			}));
			
			elt.style.cssText = 'position:absolute;border-top:1px solid lightgray;width:50%;' +
				'height:24px;bottom:0px;text-align:center;cursor:pointer;padding:6px 0 0 0;cusor:pointer;';
			elt.className = 'geTitle';
			container.appendChild(elt);
			
			return elt;
		}
		
		if (Editor.enableCustomLibraries && (urlParams['embed'] != '1' || urlParams['libraries'] == '1'))
		{
			// Defined in native apps together with openLibrary
			if (ui.actions.get('newLibrary') != null)
			{
				var div = document.createElement('div');
				div.style.cssText = 'position:absolute;left:0px;width:50%;border-top:1px solid lightgray;' +
					'height:30px;bottom:0px;text-align:center;cursor:pointer;padding:0px;';
				div.className = 'geTitle';
				var span = document.createElement('span');
				span.style.cssText = 'position:relative;top:6px;';
				mxUtils.write(span, mxResources.get('newLibrary'));
				div.appendChild(span);
				container.appendChild(div);
				
				mxEvent.addListener(div, 'click', ui.actions.get('newLibrary').funct);
				
				var div = document.createElement('div');
				div.style.cssText = 'position:absolute;left:50%;width:50%;border-top:1px solid lightgray;' +
					'height:30px;bottom:0px;text-align:center;cursor:pointer;padding:0px;border-left: 1px solid lightgray;';
				div.className = 'geTitle';
				var span = document.createElement('span');
				span.style.cssText = 'position:relative;top:6px;';
				mxUtils.write(span, mxResources.get('openLibrary'));
				div.appendChild(span);
				container.appendChild(div);
				
				mxEvent.addListener(div, 'click', ui.actions.get('openLibrary').funct);
			}
			else
			{
				var elt = addMenu('newLibrary', mxResources.get('newLibrary'));
				elt.style.boxSizing = 'border-box';
				elt.style.paddingRight = '6px';
				elt.style.paddingLeft = '6px';
				elt.style.height = '32px';
				elt.style.left = '0';
				
				var elt = addMenu('openLibraryFrom', mxResources.get('openLibraryFrom'));
				elt.style.borderLeft = '1px solid lightgray';
				elt.style.boxSizing = 'border-box';
				elt.style.paddingRight = '6px';
				elt.style.paddingLeft = '6px';
				elt.style.height = '32px';
				elt.style.left = '50%';
			}
		}
		else
		{
			div.style.bottom = '0';
		}

		container.appendChild(ui.sidebar.container);
		container.style.overflow = 'hidden';
	};

	function toggleShapes(ui, visible)
	{
		if (EditorUi.windowed)
		{
			var graph = ui.editor.graph;
			graph.popupMenuHandler.hideMenu();
	
			if (ui.sidebarWindow == null)
			{
				var w = Math.min(graph.container.clientWidth - 10, 218);
				var h = (urlParams['embedInline'] == '1') ? 650 :
					Math.min(graph.container.clientHeight - 40, 650);
				
				ui.sidebarWindow = new WrapperWindow(ui, mxResources.get('shapes'),
					(urlParams['sketch'] == '1' && urlParams['embedInline'] != '1') ? 66 : 10,
					(urlParams['sketch'] == '1' && urlParams['embedInline'] != '1') ?
						Math.max(30, (graph.container.clientHeight - h) / 2) : 56,
					w - 6, h - 6, function(container)
				{
					createSidebar(ui, container);
				});
				
				ui.sidebarWindow.window.addListener(mxEvent.SHOW, mxUtils.bind(this, function()
				{
					ui.sidebarWindow.window.fit();
				}));
	
				ui.sidebarWindow.window.minimumSize = new mxRectangle(0, 0, 90, 90);
				ui.sidebarWindow.window.setVisible(true);

				if (isLocalStorage)
				{
					ui.getLocalData('sidebar', function(value)
					{
						ui.sidebar.showEntries(value, null, true);
					});
				}
				
				ui.restoreLibraries();
			}
			else
			{
				ui.sidebarWindow.window.setVisible((visible != null) ?
					visible : !ui.sidebarWindow.window.isVisible());
			}
		}
		else
		{
			if (ui.sidebarElt == null)
			{
				ui.sidebarElt = ui.createSidebarContainer();
				createSidebar(ui, ui.sidebarElt);
				ui.sidebarElt.style.border = 'none';
				ui.sidebarElt.style.width = '210px';
				ui.sidebarElt.style.borderRight = '1px solid gray';
			}

			var wrapper = ui.diagramContainer.parentNode;

			if (ui.sidebarElt.parentNode != null)
			{
				ui.sidebarElt.parentNode.removeChild(ui.sidebarElt);
				wrapper.style.left = '0px';
			}
			else
			{
				wrapper.parentNode.appendChild(ui.sidebarElt);
				wrapper.style.left = ui.sidebarElt.style.width;
			}
		}
	};
	
    // Changes colors for some UI elements
	var fill = '#29b6f2';
	Editor.checkmarkImage = Graph.createSvgImage(22, 18, '<path transform="translate(4 0)" d="M7.181,15.007a1,1,0,0,1-.793-0.391L3.222,10.5A1,1,0,1,1,4.808,9.274L7.132,12.3l6.044-8.86A1,1,0,1,1,14.83,4.569l-6.823,10a1,1,0,0,1-.8.437H7.181Z" fill="' + fill + '"/>').src;
	mxWindow.prototype.closeImage = Graph.createSvgImage(18, 10, '<path d="M 5 1 L 13 9 M 13 1 L 5 9" stroke="#C0C0C0" stroke-width="2"/>').src;
	mxWindow.prototype.minimizeImage = Graph.createSvgImage(14, 10, '<path d="M 3 7 L 7 3 L 11 7" stroke="#C0C0C0" stroke-width="2" fill="none"/>').src;
	mxWindow.prototype.normalizeImage = Graph.createSvgImage(14, 10, '<path d="M 3 3 L 7 7 L 11 3" stroke="#C0C0C0" stroke-width="2" fill="none"/>').src;
	mxConstraintHandler.prototype.pointImage = Graph.createSvgImage(5, 5,
		'<path d="m 0 0 L 5 5 M 0 5 L 5 0" stroke-width="2" style="stroke-opacity:0.4" stroke="#ffffff"/>' +
		'<path d="m 0 0 L 5 5 M 0 5 L 5 0" stroke="' + fill + '"/>');
	mxOutline.prototype.sizerImage = null;
	
	mxConstants.VERTEX_SELECTION_COLOR = '#C0C0C0';
	mxConstants.EDGE_SELECTION_COLOR = '#C0C0C0';
	mxConstants.CONNECT_HANDLE_FILLCOLOR = '#cee7ff';
	mxConstants.DEFAULT_VALID_COLOR = fill;
	mxConstants.GUIDE_COLOR = '#C0C0C0';
	mxConstants.HIGHLIGHT_STROKEWIDTH = 5;
	mxConstants.HIGHLIGHT_OPACITY = 35;
	mxConstants.OUTLINE_COLOR = '#29b6f2';
	mxConstants.OUTLINE_HANDLE_FILLCOLOR = '#29b6f2';
	mxConstants.OUTLINE_HANDLE_STROKECOLOR = '#fff';

	Graph.prototype.svgShadowColor = '#3D4574';
	Graph.prototype.svgShadowOpacity = '0.4';
	Graph.prototype.svgShadowSize = '0.6';
	Graph.prototype.svgShadowBlur = '1.2';

	Format.inactiveTabBackgroundColor = '#f0f0f0';
	mxGraphHandler.prototype.previewColor = '#C0C0C0';
	mxRubberband.prototype.defaultOpacity = 50;
	HoverIcons.prototype.inactiveOpacity = 25;
	Format.prototype.showCloseButton = false;
	EditorUi.prototype.closableScratchpad = false;
	EditorUi.prototype.toolbarHeight = (urlParams['sketch'] == '1') ? 1 : 46;
	EditorUi.prototype.footerHeight = 0;
	Graph.prototype.editAfterInsert = urlParams['sketch'] != '1' &&
		!mxClient.IS_IOS && !mxClient.IS_ANDROID;
	
	/**
	 * Creates inline CSS element.
	 */
	Editor.styleElt = document.createElement('style')
	Editor.styleElt.type = 'text/css';
	Editor.styleElt.innerHTML = Editor.createMinimalCss();
	document.getElementsByTagName('head')[0].appendChild(Editor.styleElt);

	/**
     * Sets the XML node for the current diagram.
     */
    Editor.prototype.isChromelessView = function()
    {
    	return false;
    };

    /**
     * Sets the XML node for the current diagram.
     */
    Graph.prototype.isLightboxView = function()
    {
    	return false;
    };
    
    // Overridden to ignore tabContainer height for diagramContainer
    var editorUiUpdateTabContainer = EditorUi.prototype.updateTabContainer;
    
    EditorUi.prototype.updateTabContainer = function()
    {
    	if (this.tabContainer != null)
        {
        	// Makes room for view zoom menu
        	this.tabContainer.style.right = '70px';
        	this.diagramContainer.style.bottom = (urlParams['sketch'] == '1') ?
				'0px' : this.tabContainerHeight + 'px';
        }
    	
    	editorUiUpdateTabContainer.apply(this, arguments);
    };

    // Overridden to update save menu state
	/**
	 * Updates action states depending on the selection.
	 */
	var editorUiUpdateActionStates = EditorUi.prototype.updateActionStates;
	
	EditorUi.prototype.updateActionStates = function()
	{
		editorUiUpdateActionStates.apply(this, arguments);

		this.menus.get('save').setEnabled(this.getCurrentFile() != null || urlParams['embed'] == '1');
	};

    // Hides keyboard shortcuts in menus
    var menusAddShortcut = Menus.prototype.addShortcut; 
    
    Menus.prototype.addShortcut = function(item, action)
    {
        if (action.shortcut != null && iw < 900 && !mxClient.IS_IOS)
        {
            var td = item.firstChild.nextSibling;
            td.setAttribute('title', action.shortcut);
        }
        else
        {
        	menusAddShortcut.apply(this, arguments);
        }
    };

    var appUpdateUserElement = App.prototype.updateUserElement;
    
    App.prototype.updateUserElement = function()
    {
    	appUpdateUserElement.apply(this, arguments);
    	
		if (this.userElement != null)
		{
			var elt = this.userElement;
    		elt.style.cssText = 'position:relative;margin-right:4px;cursor:pointer;display:' + elt.style.display;
    		elt.className = 'geToolbarButton';
    		elt.innerText = '';
			elt.style.backgroundImage = 'url(' + Editor.userImage + ')';
        	elt.style.backgroundPosition = 'center center';
        	elt.style.backgroundRepeat = 'no-repeat';
        	elt.style.backgroundSize = '24px 24px';
        	elt.style.height = '24px';
        	elt.style.width = '24px';
        	elt.style.cssFloat = 'right';
        	elt.setAttribute('title', mxResources.get('changeUser'));
        	
        	if (elt.style.display != 'none')
        	{
        		elt.style.display = 'inline-block';

				var file = this.getCurrentFile();
	
				if (file != null && file.isRealtimeEnabled() && file.isRealtimeSupported())
				{
					var icon = document.createElement('img');
					icon.setAttribute('border', '0');
					icon.style.position = 'absolute';
					icon.style.left = '18px';
					icon.style.top = '2px';
					icon.style.width = '12px';
					icon.style.height = '12px';
					// icon.style.cursor = 'default';

					var err = file.getRealtimeError();
					var state = file.getRealtimeState();
					var status = mxResources.get('realtimeCollaboration');

					if (state == 1)
					{
						icon.src = Editor.syncImage;
						status += ' (' + mxResources.get('online') + ')';
					}
					else
					{
						icon.src = Editor.syncProblemImage;

						if (err != null && err.message != null)
						{
							status += ' (' + err.message + ')';
						}
						else
						{
							status += ' (' + mxResources.get('disconnected') + ')';
						}
					}
					
					icon.setAttribute('title', status);
					elt.style.paddingRight = '4px';
					elt.appendChild(icon);
				}
        	}
		}
    };
    
    var appUpdateButtonContainer = App.prototype.updateButtonContainer;
    
    App.prototype.updateButtonContainer = function()
    {
    	appUpdateButtonContainer.apply(this, arguments);
    	
    	if (this.shareButton != null)
		{
    		var elt = this.shareButton;
    		elt.style.cssText = 'display:inline-block;position:relative;box-sizing:border-box;margin-right:4px;cursor:pointer;';
    		elt.className = 'geToolbarButton';
    		elt.innerText = '';
			elt.style.backgroundImage = 'url(' + Editor.shareImage + ')';
        	elt.style.backgroundPosition = 'center center';
        	elt.style.backgroundRepeat = 'no-repeat';
        	elt.style.backgroundSize = '24px 24px';
        	elt.style.height = '24px';
        	elt.style.width = '24px';

			// Share button hidden via CSS to enable notifications button
			if (urlParams['sketch'] == '1')
			{
				this.shareButton.style.display = 'none';
			}
		}
		
		if (this.buttonContainer != null)
		{
			this.buttonContainer.style.marginTop = '-2px';
			this.buttonContainer.style.paddingTop = '4px';
		}
    };

	EditorUi.prototype.addEmbedButtons = function()
	{
		if (this.buttonContainer != null && urlParams['embedInline'] != '1')
		{
			var div = document.createElement('div');
			div.style.display = 'inline-block';
			div.style.position = 'relative';
			div.style.marginTop = '6px';
			div.style.marginRight = '4px';
			
			var button = document.createElement('a');
			button.className = 'geMenuItem gePrimaryBtn';
			button.style.marginLeft = '8px';
			button.style.padding = '6px';
			
			if (urlParams['noSaveBtn'] == '1')
			{
				if (urlParams['saveAndExit'] != '0')
				{
					var saveAndExitTitle = urlParams['publishClose'] == '1' ? mxResources.get('publish') : mxResources.get('saveAndExit');
					mxUtils.write(button, saveAndExitTitle);
					button.setAttribute('title', saveAndExitTitle);
						
					mxEvent.addListener(button, 'click', mxUtils.bind(this, function()
					{
						this.actions.get('saveAndExit').funct();
					}));
					
					div.appendChild(button);
				}
			}
			else
			{
				mxUtils.write(button, mxResources.get('save'));
				button.setAttribute('title', mxResources.get('save') + ' (' + Editor.ctrlKey + '+S)');
				
				mxEvent.addListener(button, 'click', mxUtils.bind(this, function()
				{
					this.actions.get('save').funct();
				}));
				
				div.appendChild(button);
				
				if (urlParams['saveAndExit'] == '1')
				{
					button = document.createElement('a');
					mxUtils.write(button, mxResources.get('saveAndExit'));
					button.setAttribute('title', mxResources.get('saveAndExit'));
					button.className = 'geMenuItem';
					button.style.marginLeft = '6px';
					button.style.padding = '6px';
					
					mxEvent.addListener(button, 'click', mxUtils.bind(this, function()
					{
						this.actions.get('saveAndExit').funct();
					}));
					
					div.appendChild(button);
				}
			}

			if (urlParams['noExitBtn'] != '1')
			{
				button = document.createElement('a');
				var exitTitle = urlParams['publishClose'] == '1' ? mxResources.get('close') : mxResources.get('exit');
				mxUtils.write(button, exitTitle);
				button.setAttribute('title', exitTitle);
				button.className = 'geMenuItem';
				button.style.marginLeft = '6px';
				button.style.padding = '6px';
				
				mxEvent.addListener(button, 'click', mxUtils.bind(this, function()
				{
					this.actions.get('exit').funct();
				}));
				
				div.appendChild(button);
			}
			
			this.buttonContainer.appendChild(div);
			this.buttonContainer.style.top = '6px';

			this.editor.fireEvent(new mxEventObject('statusChanged'));
		}
	};
	
	// Fixes sidebar tooltips (previews)
	var sidebarGetTooltipOffset = Sidebar.prototype.getTooltipOffset;
	
	Sidebar.prototype.getTooltipOffset = function(elt, bounds)
	{
		if (this.editorUi.sidebarWindow == null ||
			mxUtils.isAncestorNode(this.editorUi.picker, elt))
		{
			var off = mxUtils.getOffset(this.editorUi.picker);
			
			off.x += this.editorUi.picker.offsetWidth + 4;
			off.y += elt.offsetTop - bounds.height / 2 + 16;
			
			return off;
		}
		else
		{
			var result = sidebarGetTooltipOffset.apply(this, arguments);
			var off = mxUtils.getOffset(this.editorUi.sidebarWindow.window.div);
			
			result.x += off.x - 16;
			result.y += off.y;
	        
			return result;
		}
	};
    
    // Adds context menu items
    var menuCreatePopupMenu = Menus.prototype.createPopupMenu;
    
    Menus.prototype.createPopupMenu = function(menu, cell, evt)
    {
        var graph = this.editorUi.editor.graph;
        menu.smartSeparators = true;
        menuCreatePopupMenu.apply(this, arguments);
	
		if (urlParams['sketch'] == '1')
		{
			if (graph.isEnabled())
			{
				menu.addSeparator();
				
				if (graph.getSelectionCount() == 1)
	        	{
					this.addMenuItems(menu, ['-', 'lockUnlock'], null, evt);
				}
			}
		}
		else
		{
			if (graph.getSelectionCount() == 1)
			{
				if (graph.isCellFoldable(graph.getSelectionCell()))
				{
					this.addMenuItems(menu, (graph.isCellCollapsed(cell)) ? ['expand'] : ['collapse'], null, evt);
				}
	            
				this.addMenuItems(menu, ['collapsible', '-', 'lockUnlock', 'enterGroup'], null, evt);
				menu.addSeparator();
				this.addSubmenu('layout', menu);
	        }
	        else if (graph.isSelectionEmpty() && graph.isEnabled())
	        {
				menu.addSeparator();
				this.addMenuItems(menu, ['editData'], null, evt);
				menu.addSeparator();
				this.addSubmenu('layout', menu);
				this.addSubmenu('insert', menu);
				this.addMenuItems(menu, ['-', 'exitGroup'], null, evt);
			}
			else if (graph.isEnabled())
			{
				this.addMenuItems(menu, ['-', 'lockUnlock'], null, evt);
			}
		}
	};

	// Adds copy as image after paste for empty selection
	var menuAddPopupMenuEditItems = Menus.prototype.addPopupMenuEditItems;
	
	/**
	 * Creates the keyboard event handler for the current graph and history.
	 */
	Menus.prototype.addPopupMenuEditItems = function(menu, cell, evt)
	{
		menuAddPopupMenuEditItems.apply(this, arguments);
		
		if (this.editorUi.editor.graph.isSelectionEmpty())
		{
			this.addMenuItems(menu, ['copyAsImage'], null, evt);
		}
	};

    
    // Overridden to toggle window instead
    EditorUi.prototype.toggleFormatPanel = function(visible)
    {
        if (this.formatWindow != null)
        {
        	this.formatWindow.window.setVisible((visible != null) ?
        		visible : !this.formatWindow.window.isVisible());
        }
        else
        {
        	toggleFormat(this);
        }
    };

    DiagramFormatPanel.prototype.isMathOptionVisible = function()
    {
        return true;
    };
    
	// Initializes the user interface
	var editorUiDestroy = EditorUi.prototype.destroy;
	EditorUi.prototype.destroy = function()
	{
        if (this.sidebarWindow != null)
        {
            this.sidebarWindow.window.setVisible(false);
            this.sidebarWindow.window.destroy();
            this.sidebarWindow = null;
        }
        
        if (this.formatWindow != null)
        {
        	this.formatWindow.window.setVisible(false);
        	this.formatWindow.window.destroy();
        	this.formatWindow = null;
        }

        if (this.actions.outlineWindow != null)
        {
        	this.actions.outlineWindow.window.setVisible(false);
        	this.actions.outlineWindow.window.destroy();
        	this.actions.outlineWindow = null;
        }

        if (this.actions.layersWindow != null)
        {
        	this.actions.layersWindow.window.setVisible(false);
        	this.actions.layersWindow.destroy();
        	this.actions.layersWindow = null;
        }

        if (this.menus.tagsWindow != null)
        {
        	this.menus.tagsWindow.window.setVisible(false);
        	this.menus.tagsWindow.window.destroy();
        	this.menus.tagsWindow = null;
        }

        if (this.menus.findWindow != null)
        {
        	this.menus.findWindow.window.setVisible(false);
        	this.menus.findWindow.window.destroy();
        	this.menus.findWindow = null;
        }

        if (this.menus.findReplaceWindow != null)
        {
        	this.menus.findReplaceWindow.window.setVisible(false);
        	this.menus.findReplaceWindow.window.destroy();
        	this.menus.findReplaceWindow = null;
        }

		editorUiDestroy.apply(this, arguments);
	};
	
	// Hides windows when a file is closed
	var editorUiSetGraphEnabled = EditorUi.prototype.setGraphEnabled;
	
	EditorUi.prototype.setGraphEnabled = function(enabled)
	{
		editorUiSetGraphEnabled.apply(this, arguments);
		
		if (!enabled)
		{
			if (this.sidebarWindow != null)
            {
            	this.sidebarWindow.window.setVisible(false);
            }

            if (this.formatWindow != null)
            {
            	this.formatWindow.window.setVisible(false);
            }
		}
		else
		{
			var iw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

			if (iw >= 1000 && this.sidebarWindow != null && urlParams['sketch'] != '1')
            {
                this.sidebarWindow.window.setVisible(true);
            }
            
            if (this.formatWindow != null && (iw >= 1000 || urlParams['sketch'] == '1'))
            {
            	this.formatWindow.window.setVisible(true);
            }
		}
	};
	
    // Disables centering of graph after iframe resize
	EditorUi.prototype.chromelessWindowResize = function() {};
	
	// Adds actions and menus
	var menusInit = Menus.prototype.init;
	Menus.prototype.init = function()
	{
		menusInit.apply(this, arguments);
		
        var ui = this.editorUi;
        var graph = ui.editor.graph;

        var togglePagesAction = ui.actions.put('togglePagesVisible', new Action(mxResources.get('pages'), function(e)
        {
            ui.setPagesVisible(!Editor.pagesVisible);
        }));

		togglePagesAction.setToggleAction(true);
		togglePagesAction.setSelectedCallback(function() { return Editor.pagesVisible; });
		
        ui.actions.put('importCsv', new Action(mxResources.get('csv') + '...', function()
        {
            graph.popupMenuHandler.hideMenu();
            ui.showImportCsvDialog();
        }));
        ui.actions.put('importText', new Action(mxResources.get('text') + '...', function()
        {
            var dlg = new ParseDialog(ui, 'Insert from Text');
            ui.showDialog(dlg.container, 620, 420, true, false);
            dlg.init();
        }));
        ui.actions.put('formatSql', new Action(mxResources.get('formatSql') + '...', function()
        {
            var dlg = new ParseDialog(ui, 'Insert from Text', 'formatSql');
            ui.showDialog(dlg.container, 620, 420, true, false);
            dlg.init();
        }));

        ui.actions.put('toggleShapes', new Action(mxResources.get((urlParams['sketch'] == '1') ?
			'moreShapes' : 'shapes') + '...', function()
        {
        	toggleShapes(ui);
        }, null, null, Editor.ctrlKey + '+Shift+K'));

        var action = ui.actions.put('toggleFormat', new Action(mxResources.get('format'), function()
        {
        	toggleFormat(ui);
        }));

		action.shortcut = ui.actions.get('formatPanel').shortcut;
		action.setToggleAction(true);
		action.setSelectedCallback(mxUtils.bind(this, function()
		{
			return ui.formatWindow != null && ui.formatWindow.window.isVisible();
		}));

        if (EditorUi.enablePlantUml && !ui.isOffline())
        {
	        ui.actions.put('plantUml', new Action(mxResources.get('plantUml') + '...', function()
	        {
	            var dlg = new ParseDialog(ui, mxResources.get('plantUml') + '...', 'plantUml');
	            ui.showDialog(dlg.container, 620, 420, true, false);
	            dlg.init();
	        }));
        }
        
    	ui.actions.put('mermaid', new Action(mxResources.get('mermaid') + '...', function()
        {
            var dlg = new ParseDialog(ui, mxResources.get('mermaid') + '...', 'mermaid');
            ui.showDialog(dlg.container, 620, 420, true, false);
            dlg.init();
        }));

		// Adds submenu for edit items
		var addPopupMenuCellEditItems = this.addPopupMenuCellEditItems;

		this.put('editCell', new Menu(mxUtils.bind(this, function(menu, parent)
		{
			var graph = this.editorUi.editor.graph;
			var cell = graph.getSelectionCell();
			addPopupMenuCellEditItems.call(this, menu, cell, null, parent);

			this.addMenuItems(menu, ['editTooltip'], parent);

			if (graph.model.isVertex(cell))
			{
				this.addMenuItems(menu, ['editGeometry'], parent);
			}

			this.addMenuItems(menu, ['-', 'edit'], parent);
		})));

		this.addPopupMenuCellEditItems = function(menu, cell, evt, parent)
		{
			// LATER: Pass-through for evt from context menu to submenu item
			menu.addSeparator();
			this.addSubmenu('editCell', menu, parent, mxResources.get('edit'));
		};

		this.put('file', new Menu(mxUtils.bind(this, function(menu, parent)
		{
			var file = ui.getCurrentFile();
			ui.menus.addMenuItems(menu, ['new'], parent);
			ui.menus.addSubmenu('openFrom', menu, parent);

			if (isLocalStorage)
			{
				this.addSubmenu('openRecent', menu, parent);
			}
			
			menu.addSeparator(parent);

			ui.menus.addMenuItems(menu, ['-', 'save'], parent);

			if (file == null || file.constructor != DriveFile)
			{
				ui.menus.addMenuItems(menu, ['saveAs'], parent);
			}

			if (!mxClient.IS_CHROMEAPP && !EditorUi.isElectronApp &&
				(file.constructor != LocalFile || file.fileHandle != null))
			{
				ui.menus.addMenuItems(menu, ['synchronize'], parent);
			}

			if (file != null && file.constructor == DriveFile)
			{
				ui.menus.addMenuItems(menu, ['-', 'rename', 'makeCopy',
					'-', 'moveToFolder', 'openFolder'], parent);
			}
			else
			{
				ui.menus.addMenuItems(menu, ['-', 'rename'], parent);
				
				if (ui.isOfflineApp())
				{
					if (navigator.onLine && urlParams['stealth'] != '1' && urlParams['lockdown'] != '1')
					{
						this.addMenuItems(menu, ['upload'], parent);
					}
				}
				else
				{
					ui.menus.addMenuItems(menu, ['makeCopy'], parent);
				}
			}

			if (file != null && file.isRevisionHistorySupported())
			{
				ui.menus.addMenuItems(menu, ['-', 'revisionHistory'], parent);
			}

			if (file != null)
			{
				if (ui.fileNode != null && urlParams['embedInline'] != '1')
				{
					var filename = (file.getTitle() != null) ?
						file.getTitle() : ui.defaultFilename;
					
					if ((file.constructor == DriveFile && file.sync != null &&
						file.sync.isConnected()) || (!/(\.html)$/i.test(filename) &&
						!/(\.svg)$/i.test(filename)))
					{
						this.addMenuItems(menu, ['properties'], parent);
					}
				}
				
				if (file.constructor == DriveFile)
				{
					ui.menus.addMenuItems(menu, ['share'], parent);
				}
			}

			ui.menus.addMenuItems(menu, ['-', 'autosave'], parent);
		})));

        this.put('diagram', new Menu(mxUtils.bind(this, function(menu, parent)
        {
			var file = ui.getCurrentFile();
        	ui.menus.addSubmenu('extras', menu, parent, mxResources.get('preferences'));
			menu.addSeparator(parent);
			
			if (mxClient.IS_CHROMEAPP || EditorUi.isElectronApp)
			{
				ui.menus.addMenuItems(menu, ['new', 'open', '-', 'synchronize',
					'-', 'save', 'saveAs', '-'], parent);
			}
			else if (urlParams['embed'] == '1' || ui.mode == App.MODE_ATLAS)
			{
				if (urlParams['noSaveBtn'] != '1' &&
					urlParams['embedInline'] != '1')
				{
					ui.menus.addMenuItems(menu, ['-', 'save'], parent);
				}
				
				if (urlParams['saveAndExit'] == '1' || 
					(urlParams['noSaveBtn'] == '1' &&
					urlParams['saveAndExit'] != '0') || ui.mode == App.MODE_ATLAS)
				{
					ui.menus.addMenuItems(menu, ['saveAndExit'], parent);
					
					if (file != null && file.isRevisionHistorySupported())
					{
						ui.menus.addMenuItems(menu, ['revisionHistory'], parent);
					}
				}
				
				menu.addSeparator(parent);
			}
			else if (ui.mode == App.MODE_ATLAS)
			{
				ui.menus.addMenuItems(menu, ['save', 'synchronize', '-'], parent);
			}
			else if (urlParams['noFileMenu'] != '1')
			{
				if (urlParams['sketch'] != '1')
				{
					ui.menus.addMenuItems(menu, ['new'], parent);
					ui.menus.addSubmenu('openFrom', menu, parent);

					if (isLocalStorage)
					{
						this.addSubmenu('openRecent', menu, parent);
					}
				
					menu.addSeparator(parent);

					if (file != null)
					{		
						if (file.constructor == DriveFile)
						{
							ui.menus.addMenuItems(menu, ['share'], parent);
						}
						
						if (!mxClient.IS_CHROMEAPP && !EditorUi.isElectronApp &&
							file.constructor != LocalFile)
						{
							ui.menus.addMenuItems(menu, ['synchronize'], parent);
						}
					}
					
					menu.addSeparator(parent);
					ui.menus.addSubmenu('save', menu, parent);
				}
				else
				{
					ui.menus.addSubmenu('file', menu, parent);
				}
			}
			
			ui.menus.addSubmenu('exportAs', menu, parent);
			
			if (mxClient.IS_CHROMEAPP || EditorUi.isElectronApp)
			{
				ui.menus.addMenuItems(menu, ['import'], parent);
			}
			else if (urlParams['noFileMenu'] != '1')
			{
				ui.menus.addSubmenu('importFrom', menu, parent);
			}

			ui.menus.addMenuItems(menu, ['-',  'findReplace'], parent);

			if (ui.commentsSupported())
			{
				ui.menus.addMenuItems(menu, ['comments', '-'], parent);
			}

			ui.menus.addMenuItems(menu, ['toggleFormat', 'layers', 'tags', '-', 'pageSetup'], parent);

			// Cannot use print in standalone mode on iOS as we cannot open new windows
			if (urlParams['noFileMenu'] != '1' && (!mxClient.IS_IOS || !navigator.standalone))
			{
				ui.menus.addMenuItems(menu, ['print'], parent);
			}

			if (urlParams['sketch'] != '1')
			{
				if (file != null && ui.fileNode != null && urlParams['embedInline'] != '1')
				{
					var filename = (file.getTitle() != null) ?
						file.getTitle() : ui.defaultFilename;
					
					if (!/(\.html)$/i.test(filename) &&
						!/(\.svg)$/i.test(filename))
					{
						this.addMenuItems(menu, ['-', 'properties']);
					}
				}
			}

			menu.addSeparator(parent);
			ui.menus.addSubmenu('help', menu, parent);

            if (urlParams['embed'] == '1' || ui.mode == App.MODE_ATLAS)
			{
				if (urlParams['noExitBtn'] != '1' || ui.mode == App.MODE_ATLAS)
				{
					ui.menus.addMenuItems(menu, ['-', 'exit'], parent);
				}
			}
			else if (urlParams['noFileMenu'] != '1')
			{
				ui.menus.addMenuItems(menu, ['-', 'close']);
			}
        })));

		this.put('save', new Menu(mxUtils.bind(this, function(menu, parent)
        {
			var file = ui.getCurrentFile();
			
			if (file != null && file.constructor == DriveFile)
			{
				ui.menus.addMenuItems(menu, ['save', 'makeCopy', '-', 'rename', 'moveToFolder'], parent);
			}
			else
			{
				ui.menus.addMenuItems(menu, ['save', 'saveAs', '-', 'rename'], parent);
				
				if (ui.isOfflineApp())
				{
					if (navigator.onLine && urlParams['stealth'] != '1' && urlParams['lockdown'] != '1')
					{
						this.addMenuItems(menu, ['upload'], parent);
					}
				}
				else
				{
					ui.menus.addMenuItems(menu, ['makeCopy'], parent);
				}
			}
			
			ui.menus.addMenuItems(menu, ['-', 'autosave'], parent);

			if (file != null && file.isRevisionHistorySupported())
			{
				ui.menus.addMenuItems(menu, ['-', 'revisionHistory'], parent);
			}
        })));
        
        // Augments the existing export menu
        var exportAsMenu = this.get('exportAs');
        
        this.put('exportAs', new Menu(mxUtils.bind(this, function(menu, parent)
        {
        	exportAsMenu.funct(menu, parent);

    		if (!mxClient.IS_CHROMEAPP && !EditorUi.isElectronApp)
    		{
	            // Publish menu contains only one element by default...
	            //ui.menus.addSubmenu('publish', menu, parent); 
	            ui.menus.addMenuItems(menu, ['publishLink'], parent);
    		}
    		
    		if (ui.mode != App.MODE_ATLAS && urlParams['extAuth'] != '1')
    		{
    			menu.addSeparator(parent);
    			ui.menus.addSubmenu('embed', menu, parent);
    		}
        })));

        var langMenu = this.get('language');
        
        this.put('table', new Menu(mxUtils.bind(this, function(menu, parent)
		{
			ui.menus.addInsertTableCellItem(menu, parent);
		})));

		var unitsMenu = this.get('units');
		
		this.put('units', new Menu(mxUtils.bind(this, function(menu, parent)
		{
			unitsMenu.funct(menu, parent);
			this.addMenuItems(menu, ['-', 'ruler', '-', 'pageScale'], parent);
		})));
		
        // Extras menu is labelled preferences but keeps ID for extensions
        this.put('extras', new Menu(mxUtils.bind(this, function(menu, parent)
        {
			if (langMenu != null)
			{
				ui.menus.addSubmenu('language', menu, parent);
			}
			
			if (urlParams['embed'] != '1' && urlParams['extAuth'] != '1' && ui.mode != App.MODE_ATLAS)
			{
				ui.menus.addSubmenu('theme', menu, parent);
			}
			
			ui.menus.addSubmenu('units', menu, parent);
			menu.addSeparator(parent);

			if (urlParams['sketch'] != '1')
			{
				ui.menus.addMenuItems(menu, ['scrollbars', '-', 'tooltips',
					'copyConnect', 'collapseExpand'], parent);
			}

			if (urlParams['embedInline'] != '1' && urlParams['sketch'] != '1' && urlParams['embed'] != '1' &&
				(isLocalStorage || mxClient.IS_CHROMEAPP) && ui.mode != App.MODE_ATLAS)
			{
				ui.menus.addMenuItems(menu, ['-', 'showStartScreen', 'search', 'scratchpad'], parent);
			}

			menu.addSeparator(parent);
			
			if (urlParams['sketch'] == '1')
			{
				ui.menus.addMenuItems(menu, ['copyConnect',
					'collapseExpand', 'tooltips', '-'], parent);
			}
			
			if (EditorUi.isElectronApp)
			{
				ui.menus.addMenuItems(menu, ['-',
					'spellCheck', 'autoBkp',
					'drafts', '-'], parent);
			}

			var file = ui.getCurrentFile();
			
			if (file != null && file.isRealtimeEnabled() && file.isRealtimeSupported())
			{
				this.addMenuItems(menu, ['-', 'showRemoteCursors',
					'shareCursor', '-'], parent);
			}

			if (Graph.translateDiagram)
			{
				ui.menus.addMenuItems(menu, ['diagramLanguage'], parent);
			}
			
			if (ui.mode != App.MODE_ATLAS) 
			{
				ui.menus.addMenuItem(menu, 'configuration', parent);
			}

			if (urlParams['sketch'] != '1')
			{
				if (!ui.isOfflineApp() && isLocalStorage && ui.mode != App.MODE_ATLAS)
				{
					ui.menus.addMenuItem(menu, 'plugins', parent);
				}
			}
			
			// Adds trailing separator in case new plugin entries are added
			menu.addSeparator(parent);
        })));
        
        this.put('insertAdvanced', new Menu(mxUtils.bind(this, function(menu, parent)
        {
            ui.menus.addMenuItems(menu, ['importText', 'plantUml', 'mermaid', '-',
				'formatSql', 'importCsv', '-', 'createShape', 'editDiagram'], parent);
        })));
        
        (mxUtils.bind(this, function()
        {
			var insertMenu = this.get('insert');
			var insertMenuFunct = insertMenu.funct;
			
			insertMenu.funct = function(menu, parent)
			{
				if (urlParams['sketch'] == '1')
				{
					ui.menus.addMenuItems(menu, ['toggleShapes'], parent);
					ui.menus.addSubmenu('table', menu, parent);
					menu.addSeparator(parent);

					if (ui.insertTemplateEnabled && !ui.isOffline())
					{
						ui.menus.addMenuItems(menu, ['insertTemplate'], parent);
					}
					
					ui.menus.addMenuItems(menu, ['insertImage', 'insertLink', '-'], parent);
					ui.menus.addSubmenu('insertAdvanced', menu, parent, mxResources.get('advanced'));
					ui.menus.addSubmenu('layout', menu, parent);
				}
				else
				{
					insertMenuFunct.apply(this, arguments);
					ui.menus.addSubmenu('table', menu, parent);
				}
			};
        }))();
		
        var methods = ['horizontalFlow', 'verticalFlow', '-', 'horizontalTree', 'verticalTree',
                       'radialTree', '-', 'organic', 'circle'];

        var addInsertItem = function(menu, parent, title, method)
        {
            menu.addItem(title, null, mxUtils.bind(this, function()
            {
                var dlg = new CreateGraphDialog(ui, title, method);
                ui.showDialog(dlg.container, 620, 420, true, false);
                // Executed after dialog is added to dom
                dlg.init();
            }), parent);
        };

        this.put('insertLayout', new Menu(mxUtils.bind(this, function(menu, parent)
        {
            for (var i = 0; i < methods.length; i++)
            {
                if (methods[i] == '-')
                {
                    menu.addSeparator(parent);
                }
                else
                {
                    addInsertItem(menu, parent, mxResources.get(methods[i]) + '...', methods[i]);
                }
            }
        })));
	};
	
	// Installs the format toolbar
	EditorUi.prototype.installFormatToolbar = function(container)
	{
		var graph = this.editor.graph;
		var div = document.createElement('div');
		
		div.style.cssText = 'position:absolute;top:10px;z-index:1;border-radius:4px;' +
			'box-shadow:0px 0px 3px 1px #d1d1d1;padding:6px;white-space:nowrap;background-color:#fff;' +
			'transform:translate(-50%, 0);left:50%;';
		
		graph.getSelectionModel().addListener(mxEvent.CHANGE, mxUtils.bind(this, function(sender, evt)
		{
			if (graph.getSelectionCount() > 0)
			{
				container.appendChild(div);
				div.innerHTML = 'Selected: ' + graph.getSelectionCount();
			}
			else if (div.parentNode != null)
			{
				div.parentNode.removeChild(div);
			}
		}));
	};

	var formatWindowInitialized = false;

	EditorUi.prototype.initFormatWindow = function()
	{
		if (!formatWindowInitialized && this.formatWindow != null)
		{
			formatWindowInitialized = true;

			var toggleMinimized = this.formatWindow.window.toggleMinimized;
			var w = 240;
			
			this.formatWindow.window.toggleMinimized = function()
			{
				toggleMinimized.apply(this, arguments);
				
				if (this.minimized)
				{
					w = parseInt(this.div.style.width);
					this.div.style.width = '140px';
					this.table.style.width = '140px';
					this.div.style.left = (parseInt(this.div.style.left) + w - 140) + 'px';
				}
				else
				{
					this.div.style.width = w + 'px';
					this.table.style.width = this.div.style.width;
					this.div.style.left = (Math.max(0, parseInt(this.div.style.left) - w + 140)) + 'px';
				}
				
				this.fit();
			};
			
			mxEvent.addListener(this.formatWindow.window.title, 'dblclick', mxUtils.bind(this, function(evt)
			{
				if (mxEvent.getSource(evt) == this.formatWindow.window.title)
				{
					this.formatWindow.window.toggleMinimized();
				}
			}));
		}
	};
	
	// Initializes the user interface
	var editorUiInit = EditorUi.prototype.init;

	EditorUi.prototype.init = function()
	{
		editorUiInit.apply(this, arguments);
		
		var div = document.createElement('div');
		div.style.cssText = 'position:absolute;left:0px;right:0px;top:0px;overflow-y:auto;overflow-x:hidden;';
		div.style.bottom = (urlParams['embed'] != '1' || urlParams['libraries'] == '1') ? '63px' : '32px';
		this.sidebar = this.createSidebar(div);
		
		if (urlParams['sketch'] == '1' && this.sidebar != null && this.isSettingsEnabled())
		{
			/**
			 * Shows scratchpad if never shown.
			 */
			if ((!this.editor.chromeless || this.editor.editable) && (mxSettings.settings.isNew ||
				parseInt(mxSettings.settings.version || 0) <= 8))
			{
				this.toggleScratchpad();
				mxSettings.save();
			}

			this.sidebar.showPalette('search', mxSettings.settings.search);
		}

		if ((urlParams['sketch'] != '1' && iw >= 1000) || urlParams['clibs'] != null ||
			urlParams['libs'] != null || urlParams['search-shapes'] != null)
		{
			toggleShapes(this, true);
			
			if (this.sidebar != null && urlParams['search-shapes'] != null && this.sidebar.searchShapes != null)
			{
				this.sidebar.searchShapes(urlParams['search-shapes']);
				this.sidebar.showEntries('search');
			}
		}

		// Overrides mxWindow.fit to allow for embedViewport
		var ui = this;

		mxWindow.prototype.fit = function()
		{
			if (!Editor.inlineFullscreen && ui.embedViewport != null)
			{
				var left = parseInt(this.div.offsetLeft);
				var width = parseInt(this.div.offsetWidth);
				var right = ui.embedViewport.x + ui.embedViewport.width;
				var top = parseInt(this.div.offsetTop);
				var height = parseInt(this.div.offsetHeight);
				var bottom = ui.embedViewport.y + ui.embedViewport.height;

				this.div.style.left = Math.max(ui.embedViewport.x, Math.min(left, right - width)) + 'px';
				this.div.style.top = Math.max(ui.embedViewport.y, Math.min(top, bottom - height)) + 'px';
				this.div.style.height = Math.min(ui.embedViewport.height, parseInt(this.div.style.height)) + 'px';
				this.div.style.width = Math.min(ui.embedViewport.width, parseInt(this.div.style.width)) + 'px';
			}
			else
			{
				mxUtils.fit(this.div);
			}
		};

		// Overrides insert ellipse shortcut
		this.keyHandler.bindAction(75, true, 'toggleShapes', true); // Ctrl+Shift+K

		if (EditorUi.windowed && (urlParams['sketch'] == '1' || iw >= 1000))
		{
			if (urlParams['embedInline'] != '1')
			{
				toggleFormat(this, true);

				if (urlParams['sketch'] == '1')
				{
					this.initFormatWindow();
					
					var ih = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
					
					if (this.formatWindow != null && (iw < 1200 || ih < 708))
					{
						this.formatWindow.window.toggleMinimized();
					}
					else
					{
						this.formatWindow.window.setVisible(true);
					}
				}
				else
				{
					this.formatWindow.window.setVisible(true);
				}
			}
		}
        
		// Needed for creating elements in Format panel
		var ui = this;
		var graph = ui.editor.graph;
		ui.toolbar = this.createToolbar(ui.createDiv('geToolbar'));
		ui.defaultLibraryName = mxResources.get('untitledLibrary');

		var menubar = document.createElement('div');
		menubar.className = 'geMenubarContainer';
		var before = null;
		var menuObj = new Menubar(ui, menubar);

		function addMenu(id, small, img)
		{
			var menu = ui.menus.get(id);

			var elt = menuObj.addMenu(mxResources.get(id), mxUtils.bind(this, function()
			{
				// Allows extensions of menu.functid
				menu.funct.apply(this, arguments);
			}), before);
            
			elt.className = (urlParams['sketch'] == '1') ? 'geToolbarButton' : 'geMenuItem';
			elt.style.display = 'inline-block';
			elt.style.boxSizing = 'border-box';
			elt.style.top = '6px';
			elt.style.marginRight = '6px';
			elt.style.height = '30px';
			elt.style.paddingTop = '6px';
			elt.style.paddingBottom = '6px';
			elt.style.cursor = 'pointer';
			elt.setAttribute('title', mxResources.get(id));
			ui.menus.menuCreated(menu, elt, 'geMenuItem');
            
			if (img != null)
			{
				elt.style.backgroundImage = 'url(' + img + ')';
				elt.style.backgroundPosition = 'center center';
				elt.style.backgroundRepeat = 'no-repeat';
				elt.style.backgroundSize = '24px 24px';
				elt.style.width = '34px';
				elt.innerText = '';
			}
			else if (!small)
			{
				elt.style.backgroundImage = 'url(' + mxWindow.prototype.normalizeImage + ')';
				elt.style.backgroundPosition = 'right 6px center';
				elt.style.backgroundRepeat = 'no-repeat';
				elt.style.paddingRight = '22px';
			} 

			return elt;
		};
        
		function addMenuItem(label, fn, small, tooltip, action, img)
		{
			var btn = document.createElement('a');
			btn.className = (urlParams['sketch'] == '1') ? 'geToolbarButton' : 'geMenuItem';
			btn.style.display = 'inline-block';
			btn.style.boxSizing = 'border-box';
			btn.style.height = '30px';
			btn.style.padding = '6px';
			btn.style.position = 'relative';
			btn.style.verticalAlign = 'top';
			btn.style.top = '0px';
			
			if (urlParams['sketch'] == '1')
			{
				btn.style.borderStyle = 'none';
				btn.style.boxShadow = 'none';
				btn.style.padding = '6px';
				btn.style.margin = '0px';
			}

			if (ui.statusContainer != null)
			{
				menubar.insertBefore(btn, ui.statusContainer);
			}
			else
			{
				menubar.appendChild(btn);
			}
            
			if (img != null)
			{
				btn.style.backgroundImage = 'url(' + img + ')';
				btn.style.backgroundPosition = 'center center';
				btn.style.backgroundRepeat = 'no-repeat';
				btn.style.backgroundSize = '24px 24px';
				btn.style.width = '34px';
			}
			else
			{
				mxUtils.write(btn, label);
			}
            
    		// Prevents focus
            mxEvent.addListener(btn, (mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown',
            	mxUtils.bind(this, function(evt)
    		{
    			evt.preventDefault();
    		}));

            mxEvent.addListener(btn, 'click', function(evt)
            {
            	if (btn.getAttribute('disabled') != 'disabled')
            	{
            		fn(evt);
            	}
            	
                mxEvent.consume(evt);
            });
            
            if (small == null)
            {
                btn.style.marginRight = '4px';
            }
            
            if (tooltip != null)
            {
                btn.setAttribute('title', tooltip);
            }

            if (action != null)
            {
                function updateState()
                {
                    if (action.isEnabled())
                    {
                        btn.removeAttribute('disabled');
                        btn.style.cursor = 'pointer';
                    }
                    else
                    {
                        btn.setAttribute('disabled', 'disabled');
                        btn.style.cursor = 'default';
                    }
                };
                
                action.addListener('stateChanged', updateState);
				graph.addListener('enabledChanged', updateState);
                updateState();
            }
           
            return btn;
        };
        
        function createGroup(btns, op, container)
        {
            var btnGroup = document.createElement('div');
            btnGroup.className = 'geMenuItem';
            btnGroup.style.display = 'inline-block';
            btnGroup.style.verticalAlign = 'top';
            btnGroup.style.marginRight = '6px';
            btnGroup.style.padding = '0 4px 0 4px';
            btnGroup.style.height = '30px';
            btnGroup.style.position = 'relative';
            btnGroup.style.top = '0px';

			if (urlParams['sketch'] == '1')
			{
				btnGroup.style.boxShadow = 'none';
			}
            
            for (var i = 0; i < btns.length; i++)
            {
            	if (btns[i] != null)
            	{
					if (urlParams['sketch'] == '1')
					{
						btns[i].style.padding = '10px 8px';
						btns[i].style.width = '30px';
					}
					
            		btns[i].style.margin = '0px';
	                btns[i].style.boxShadow = 'none';
	                btnGroup.appendChild(btns[i]);
            	}
            }
            
            if (op != null)
            {
            	mxUtils.setOpacity(btnGroup, op);
            }

			if (ui.statusContainer != null && urlParams['sketch'] != '1')
            {
            	menubar.insertBefore(btnGroup, ui.statusContainer);
            }
            else
            {
            	menubar.appendChild(btnGroup);
            }
            
            return btnGroup;
        };

		ui.statusContainer = ui.createStatusContainer();
		ui.statusContainer.style.position = 'relative';
		ui.statusContainer.style.maxWidth = '';
		ui.statusContainer.style.marginTop = '7px';
		ui.statusContainer.style.marginLeft = '6px';
		ui.statusContainer.style.color = 'gray';
		ui.statusContainer.style.cursor = 'default';
		
		function updateTitle()
		{
			var file = ui.getCurrentFile();
			
			if (file != null && file.getTitle() != null)
			{
				var mode = file.getMode();
				
				if (mode == 'google')
				{
					mode = 'googleDrive';
				}
				else if (mode == 'github')
				{
					mode = 'gitHub';
				}
				else if (mode == 'gitlab')
				{
					mode = 'gitLab';
				}
				else if (mode == 'onedrive')
				{
					mode = 'oneDrive';
				}
				
				mode = mxResources.get(mode);
				menubar.setAttribute('title', file.getTitle() + ((mode != null) ? ' (' + mode + ')' : ''));
			}
			else
			{
				menubar.removeAttribute('title');
			}
		};
		
		// Hides popup menus
		var uiHideCurrentMenu = ui.hideCurrentMenu;
		
		ui.hideCurrentMenu = function()
		{
			uiHideCurrentMenu.apply(this, arguments);
			this.editor.graph.popupMenuHandler.hideMenu();
		};

		// Connects the status bar to the editor status
		var uiDescriptorChanged = ui.descriptorChanged;
		
		ui.descriptorChanged = function()
		{
			uiDescriptorChanged.apply(this, arguments);
			updateTitle();
		};
		
		ui.setStatusText(ui.editor.getStatus());
		menubar.appendChild(ui.statusContainer);

		ui.buttonContainer = document.createElement('div');
		ui.buttonContainer.style.cssText = 'position:absolute;right:0px;padding-right:34px;top:10px;' +
			'white-space:nowrap;padding-top:2px;background-color:inherit;';
		menubar.appendChild(ui.buttonContainer);
		
		// Container for the user element
		ui.menubarContainer = ui.buttonContainer;

        ui.tabContainer = document.createElement('div');
		ui.tabContainer.className = 'geTabContainer';
        ui.tabContainer.style.cssText = 'position:absolute;left:0px;right:0px;bottom:0px;height:30px;white-space:nowrap;' +
            'margin-bottom:-2px;visibility:hidden;';

        var previousParent = ui.diagramContainer.parentNode;

        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:absolute;top:0px;left:0px;right:0px;bottom:0px;overflow:hidden;';
        ui.diagramContainer.style.top = (urlParams['sketch'] == '1') ? '0px' : '47px';

		//Create draggable titlebar
		if (urlParams['winCtrls'] == '1' && urlParams['sketch'] == '1')
		{
			wrapper.style.top = '20px';
			ui.titlebar = document.createElement('div');
			ui.titlebar.style.cssText = 'position:absolute;top:0px;left:0px;right:0px;height:20px;overflow:hidden;box-shadow: 0px 0px 2px #c0c0c0;';
			var title = document.createElement('div');
			title.style.cssText = 'max-width: calc(100% - 100px);text-overflow: ellipsis;user-select:none;height:20px;margin: 2px 10px;font-size: 12px;white-space: nowrap;overflow: hidden;';
			ui.titlebar.appendChild(title);
			previousParent.appendChild(ui.titlebar);
		}
		
		// Adds outline option to zoom menu
        var viewZoomMenu = ui.menus.get('viewZoom');
		var viewZoomMenuFunct = viewZoomMenu.funct;
		
		viewZoomMenu.funct = function(menu, parent)
		{
			viewZoomMenuFunct.apply(this, arguments);
			ui.menus.addMenuItems(menu, ['-', 'outline', 'fullscreen'], parent);
		};
		
		var insertImage = (urlParams['sketch'] != '1') ? Editor.plusImage : Editor.shapesImage;
		var footer = (urlParams['sketch'] == '1') ? document.createElement('div') : null;
		var picker = (urlParams['sketch'] == '1') ? document.createElement('div') : null;
		var toolbar = (urlParams['sketch'] == '1') ? document.createElement('div') : null;

		var inlineSizeChanged = mxUtils.bind(this, function()
		{
			if (Editor.inlineFullscreen)
			{
				toolbar.style.left = '10px';
				toolbar.style.top = '10px';
				
				picker.style.left = '10px';
				picker.style.top = '60px';

				footer.style.top = '10px';
				footer.style.right = '12px';
				footer.style.left = '';

				ui.diagramContainer.setAttribute('data-bounds', ui.diagramContainer.style.top + ' ' +
					ui.diagramContainer.style.left + ' ' + ui.diagramContainer.style.width + ' ' +
					ui.diagramContainer.style.height);

				ui.diagramContainer.style.top = '0px';
				ui.diagramContainer.style.left = '0px';
				ui.diagramContainer.style.bottom = '0px';
				ui.diagramContainer.style.right = '0px';
				ui.diagramContainer.style.width = '';
				ui.diagramContainer.style.height = '';
			}
			else
			{
				var bounds = ui.diagramContainer.getAttribute('data-bounds');

				if (bounds != null)
				{
					ui.diagramContainer.style.background = 'transparent';
					ui.diagramContainer.removeAttribute('data-bounds');
					var gb = graph.getGraphBounds();
					var tokens = bounds.split(' ');

					ui.diagramContainer.style.top = tokens[0];
					ui.diagramContainer.style.left = tokens[1];
					ui.diagramContainer.style.width = (gb.width + 50) + 'px';
					ui.diagramContainer.style.height = (gb.height + 46) + 'px';
					ui.diagramContainer.style.bottom = '';
					ui.diagramContainer.style.right = '';

					var parent = window.opener || window.parent;
					parent.postMessage(JSON.stringify({
						event: 'resize',
						rect: ui.diagramContainer.getBoundingClientRect()
					}), '*');
					ui.refresh();
				}

				toolbar.style.left = ui.diagramContainer.offsetLeft + 'px';
				toolbar.style.top = (ui.diagramContainer.offsetTop -
					toolbar.offsetHeight - 4) + 'px';
				
				picker.style.display = '';
				picker.style.left = (ui.diagramContainer.offsetLeft -
					picker.offsetWidth - 4) + 'px';
				picker.style.top = ui.diagramContainer.offsetTop + 'px';

				footer.style.left = (ui.diagramContainer.offsetLeft +
					ui.diagramContainer.offsetWidth -
					footer.offsetWidth) + 'px';
				footer.style.top = toolbar.style.top;
				footer.style.right = '';

				ui.bottomResizer.style.left = (ui.diagramContainer.offsetLeft +
					(ui.diagramContainer.offsetWidth -
					ui.bottomResizer.offsetWidth) / 2) + 'px';
				ui.bottomResizer.style.top = (ui.diagramContainer.offsetTop +
					ui.diagramContainer.offsetHeight -
					ui.bottomResizer.offsetHeight / 2 - 1) + 'px';

				ui.rightResizer.style.left = (ui.diagramContainer.offsetLeft +
					ui.diagramContainer.offsetWidth -
					ui.rightResizer.offsetWidth / 2 - 1) + 'px';
				ui.rightResizer.style.top = (ui.diagramContainer.offsetTop +
					(ui.diagramContainer.offsetHeight -
					ui.bottomResizer.offsetHeight) / 2) + 'px';
			}

			ui.bottomResizer.style.visibility = (Editor.inlineFullscreen) ? 'hidden' : '';
			ui.rightResizer.style.visibility = ui.bottomResizer.style.visibility;
			menubar.style.display = 'none';
			toolbar.style.visibility = '';
			footer.style.visibility = '';
		});

		var fullscreenAction = ui.actions.get('fullscreen');
		var fullscreenElt = addMenuItem('', fullscreenAction.funct, null, mxResources.get(''), fullscreenAction, Editor.fullscreenImage);
		
		var inlineFullscreenChanged = mxUtils.bind(this, function()
		{
			fullscreenElt.style.backgroundImage = 'url(' + ((!Editor.inlineFullscreen) ?
				Editor.fullscreenImage : Editor.fullscreenExitImage) + ')';
			this.diagramContainer.style.background = (Editor.inlineFullscreen) ?
				(Editor.isDarkMode() ? Editor.darkColor : '#ffffff') : 'transparent';
			inlineSizeChanged();
		});

		var editInlineStart = mxUtils.bind(this, function()
		{
			toggleFormat(ui, true);
			ui.initFormatWindow();
			var r  = this.diagramContainer.getBoundingClientRect();
			this.formatWindow.window.setLocation(r.x + r.width + 4, r.y);
			inlineFullscreenChanged();
		});

		ui.addListener('inlineFullscreenChanged', inlineFullscreenChanged);
		ui.addListener('editInlineStart', editInlineStart);

		if (urlParams['embedInline'] == '1')
		{
			ui.addListener('darkModeChanged', editInlineStart);
		}

		ui.addListener('editInlineStop', mxUtils.bind(this, function(evt)
		{
			ui.diagramContainer.style.width = '10px';
			ui.diagramContainer.style.height = '10px';
			ui.diagramContainer.style.border = '';
			ui.bottomResizer.style.visibility = 'hidden';
			ui.rightResizer.style.visibility = 'hidden';
			toolbar.style.visibility = 'hidden';
			footer.style.visibility = 'hidden';
			picker.style.display = 'none';
		}));

		// Hides hover icons if freehand is active
		if (ui.hoverIcons != null)
		{
			var hoverIconsUpdate = ui.hoverIcons.update;
			
			ui.hoverIcons.update = function()
			{
				if (!graph.freehand.isDrawing())
				{
					hoverIconsUpdate.apply(this, arguments);
				}
			};
		}
	
		// Removes sketch style from freehand shapes
		if (graph.freehand != null)
		{
			var freehandCreateStyle = graph.freehand.createStyle;
			
			graph.freehand.createStyle = function(stencil)
			{
				return freehandCreateStyle.apply(this, arguments) + 'sketch=0;';
			};
		}
		
		if (urlParams['sketch'] == '1')
		{
			picker.className = 'geToolbarContainer';
			footer.className = 'geToolbarContainer';
			toolbar.className = 'geToolbarContainer';
			menubar.className = 'geToolbarContainer';
			
			ui.picker = picker;
			var statusVisible = false;
			
			if (urlParams['embed'] != '1' && ui.getServiceName() != 'atlassian')
			{
				mxEvent.addListener(menubar, 'mouseenter', function()
				{
					ui.statusContainer.style.display = 'inline-block';
				});
				
				mxEvent.addListener(menubar, 'mouseleave', function()
				{
					if (!statusVisible)
					{
						ui.statusContainer.style.display = 'none';
					}
				});
			}
			
			var setNotificationTitle = mxUtils.bind(this, function(title)
			{
				if (ui.notificationBtn != null)
				{
					if (title != null)
					{
						ui.notificationBtn.setAttribute('title', title);
					}
					else
					{
						ui.notificationBtn.removeAttribute('title');
					}
				}
			});
					
			// Connects the status bar to the editor status and moves
			// status to bell icon title for frequent common messages
			menubar.style.visibility = (menubar.clientWidth < 20) ? 'hidden' : '';

			ui.editor.addListener('statusChanged', mxUtils.bind(this, function()
			{
				ui.setStatusText(ui.editor.getStatus());

				if (urlParams['embed'] != '1' && ui.getServiceName() != 'atlassian')
				{
					ui.statusContainer.style.display = 'inline-block';
					statusVisible = true;

					if (ui.statusContainer.children.length == 1 &&
						ui.editor.getStatus() == '')
					{
						menubar.style.visibility = 'hidden';
					}
					else
					{
						if (ui.statusContainer.children.length == 0 ||
							(ui.statusContainer.children.length == 1 &&
							typeof ui.statusContainer.firstChild.getAttribute === 'function' &&
							ui.statusContainer.firstChild.getAttribute('class') == null))
						{
							var title = (ui.statusContainer.firstChild != null &&
								typeof ui.statusContainer.firstChild.getAttribute === 'function') ?
								ui.statusContainer.firstChild.getAttribute('title') :
								ui.editor.getStatus();
							setNotificationTitle(title);
							var file = ui.getCurrentFile();
							var key = (file != null) ? file.savingStatusKey :
								DrawioFile.prototype.savingStatusKey;
							
							if (title == mxResources.get(key) + '...')
							{
								ui.statusContainer.innerHTML = '<img title="' + mxUtils.htmlEntities(
									mxResources.get(key)) + '...' + '"src="' + Editor.tailSpin + '">';
								ui.statusContainer.style.display = 'inline-block';
								statusVisible = true;
							}
							else if (ui.buttonContainer.clientWidth > 6)
							{
								ui.statusContainer.style.display = 'none';
								statusVisible = false;
							}
						}
						else
						{
							ui.statusContainer.style.display = 'inline-block';
							setNotificationTitle(null);
							statusVisible = true;
						}

						menubar.style.visibility = (menubar.clientWidth < 20 &&
							!statusVisible) ? 'hidden' : '';
					}
				}
			}));
			
			elt = addMenu('diagram', null, Editor.menuImage);
			elt.style.boxShadow = 'none';
			elt.style.padding = '6px';
			elt.style.margin = '0px';
			toolbar.appendChild(elt);

			mxEvent.disableContextMenu(elt);

			mxEvent.addGestureListeners(elt, mxUtils.bind(this, function(evt)
			{
				if (mxEvent.isShiftDown(evt) || mxEvent.isAltDown(evt) ||
					mxEvent.isMetaDown(evt) || mxEvent.isControlDown(evt) ||
					mxEvent.isPopupTrigger(evt))
				{
					this.appIconClicked(evt);
				}
			}), null, null);

			ui.statusContainer.style.position = '';
			ui.statusContainer.style.display = 'none';
			ui.statusContainer.style.margin = '0px';
			ui.statusContainer.style.padding = '6px 0px';
			ui.statusContainer.style.maxWidth = Math.min(iw - 240, 280) + 'px';
			ui.statusContainer.style.display = 'inline-block';
			ui.statusContainer.style.textOverflow = 'ellipsis';
			
			ui.buttonContainer.style.position = '';
			ui.buttonContainer.style.paddingRight = '0px';
			ui.buttonContainer.style.display = 'inline-block';
						
			var foldImg = document.createElement('a');
			foldImg.style.padding = '0px';
			foldImg.style.boxShadow = 'none';
			foldImg.className = 'geMenuItem';
			foldImg.style.display = 'inline-block';
			foldImg.style.width = '40px';
			foldImg.style.height = '12px';
			foldImg.style.marginBottom = '-2px';
			foldImg.style.backgroundImage = 'url(' + mxWindow.prototype.normalizeImage + ')';
			foldImg.style.backgroundPosition = 'top center';
			foldImg.style.backgroundRepeat = 'no-repeat';
			foldImg.setAttribute('title', 'Minimize'/*TODO:mxResources.get('minimize')*/);
			
			var collapsed = false;

			var initPicker = mxUtils.bind(this, function()
			{
				picker.innerText = '';
				
				if (!collapsed)
				{
					function addKey(elt, key)
					{
						elt.style.position = 'relative';
						elt.style.overflow = 'visible';

						var div = document.createElement('div');
						div.style.position = 'absolute';
						div.style.left = '34px';
						div.style.top = '28px';
						div.style.fontSize = '8px';
						mxUtils.write(div, key);
						elt.appendChild(div);
					};

					function addElt(elt, title, cursor, key)
					{
						if (title != null)
						{
							elt.setAttribute('title', title);
						}
						
						elt.style.cursor = (cursor != null) ? cursor : 'default';
						elt.style.margin = '2px 0px';
						picker.appendChild(elt);
						mxUtils.br(picker);

						if (key != null)
						{
							addKey(elt, key);
						}
						
						return elt;
					};

					// Append sidebar elements
					addElt(ui.sidebar.createVertexTemplate('text;strokeColor=none;fillColor=none;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;', 
						60, 30, 'Text', mxResources.get('text') + ' (A)', true, false, null, true, true),
						mxResources.get('text') + ' (A)', null, 'A');
					addElt(ui.sidebar.createVertexTemplate('shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;' +
						'fontColor=#000000;darkOpacity=0.05;fillColor=#FFF9B2;strokeColor=none;fillStyle=solid;' +
						'direction=west;gradientDirection=north;gradientColor=#FFF2A1;shadow=1;size=20;pointerEvents=1;',
						140, 160, '', mxResources.get('note') + ' (S)', true, false, null, true),
						mxResources.get('note') + ' (S)', null, 'S');
					addElt(ui.sidebar.createVertexTemplate('rounded=0;whiteSpace=wrap;html=1;', 160, 80, '',
						mxResources.get('rectangle') + ' (D)', true, false, null, true),
						mxResources.get('rectangle') + ' (D)', null, 'D');
					addElt(ui.sidebar.createVertexTemplate('ellipse;whiteSpace=wrap;html=1;', 160, 100, '',
						mxResources.get('ellipse') + ' (F)', true, false, null, true),
						mxResources.get('ellipse') + ' (F)', null, 'F');
					
					(function()
					{
						var edgeStyle = 'edgeStyle=none;orthogonalLoop=1;jettySize=auto;html=1;';
						var cell = new mxCell('', new mxGeometry(0, 0, graph.defaultEdgeLength, 0), edgeStyle);
						cell.geometry.setTerminalPoint(new mxPoint(0, 0), true);
						cell.geometry.setTerminalPoint(new mxPoint(cell.geometry.width, 0), false);
						cell.geometry.points = [];
						cell.geometry.relative = true;
						cell.edge = true;
						
						addElt(ui.sidebar.createEdgeTemplateFromCells([cell],
							cell.geometry.width, cell.geometry.height,
							mxResources.get('line') + ' (C)', true, null, true, false),
							mxResources.get('line') + ' (C)', null, 'C');
							
						cell = cell.clone();
						cell.style = edgeStyle + 'shape=flexArrow;rounded=1;startSize=8;endSize=8;';
						cell.geometry.width = graph.defaultEdgeLength + 20;
						cell.geometry.setTerminalPoint(new mxPoint(0, 20), true);
						cell.geometry.setTerminalPoint(new mxPoint(cell.geometry.width, 20), false);
		
						addElt(ui.sidebar.createEdgeTemplateFromCells([cell],
							cell.geometry.width, 40, mxResources.get('arrow'),
							true, null, true, false), mxResources.get('arrow'));
				 	})();
				
					function addAction(action, label, image, key)
					{
						var elt = addMenuItem('', action.funct, null, label, action, image);
						elt.style.width = '40px';
						elt.style.height = '34px';
						elt.style.opacity = '0.7';
						
						return addElt(elt, null, 'pointer', key);
					};
					
					addAction(ui.actions.get('insertFreehand'), mxResources.get('freehand') + ' (X)',
						Editor.freehandImage, 'X');

					elt = addMenu('insert', null, Editor.plusImage);
					elt.style.boxShadow = 'none';
					elt.style.opacity = '0.7';
					elt.style.padding = '6px';
					elt.style.margin = '0px';
					elt.style.height = '34px';
					elt.style.width = '37px';
					addElt(elt, null, 'pointer');
				}

				if (urlParams['embedInline'] != '1')
				{
					picker.appendChild(foldImg);
				}
			});
			
			mxEvent.addListener(foldImg, 'click', mxUtils.bind(this, function()
			{
				if (collapsed)
				{
					mxUtils.setPrefixedStyle(picker.style, 'transform', 'translate(0, -50%)');
					picker.style.padding = '8px 6px 4px';
					picker.style.top = '50%';
					picker.style.bottom = '';
					picker.style.height = '';
					foldImg.style.backgroundImage = 'url(' + mxWindow.prototype.normalizeImage + ')';
					foldImg.style.width = '40px';
					foldImg.style.height = '12px';
					foldImg.setAttribute('title', 'Minimize'/*TODO:mxResources.get('minimize')*/);
					collapsed = false;
					initPicker();
				}
				else
				{				
					picker.innerText = '';
					picker.appendChild(foldImg);
					mxUtils.setPrefixedStyle(picker.style, 'transform', 'translate(0, 0)');
					picker.style.top = '';
					picker.style.bottom = '12px';
					picker.style.padding = '0px';
					picker.style.height = '24px';
					foldImg.style.height = '24px';
					foldImg.style.backgroundImage = 'url(' + Editor.plusImage + ')';
					foldImg.setAttribute('title', mxResources.get('insert'));
					foldImg.style.width = '24px';
					collapsed = true;
				}
			}));
			
			initPicker();
			
			ui.addListener('darkModeChanged', initPicker);
			ui.addListener('sketchModeChanged', initPicker);
		}
		else
		{
			// Connects the status bar to the editor status
			ui.editor.addListener('statusChanged', mxUtils.bind(this, function()
			{
				ui.setStatusText(ui.editor.getStatus());
			}));
		}

		if (viewZoomMenu != null)
		{
			var fitFunction = function(evt)
	        {
				if (mxEvent.isAltDown(evt))
				{
					ui.hideCurrentMenu();
					ui.actions.get('customZoom').funct();
					mxEvent.consume(evt);
				}
				// geItem is a dropdown menu, geMenuItem is a button in the toolbar
				else if (mxEvent.getSource(evt).className != 'geItem' || mxEvent.isShiftDown(evt))
				{
					ui.hideCurrentMenu();
					ui.actions.get('smartFit').funct();
					mxEvent.consume(evt);
				}
	        };

        	var zoomInAction = ui.actions.get('zoomIn');
			var zoomOutAction = ui.actions.get('zoomOut');
			var resetViewAction = ui.actions.get('resetView');
        	var undoAction = ui.actions.get('undo');
        	var redoAction = ui.actions.get('redo');        	
	        var undoElt = addMenuItem('', undoAction.funct, null, mxResources.get('undo') + ' (' + undoAction.shortcut + ')', undoAction, Editor.undoImage);
	        var redoElt = addMenuItem('', redoAction.funct, null, mxResources.get('redo') + ' (' + redoAction.shortcut + ')', redoAction, Editor.redoImage);

			if (footer != null)
			{
				var deleteAction = ui.actions.get('delete');
				var deleteElt = addMenuItem('', deleteAction.funct, null, mxResources.get('delete'), deleteAction, Editor.trashImage);
				deleteElt.style.opacity = '0.1';
	        	toolbar.appendChild(deleteElt);

				deleteAction.addListener('stateChanged', function()
				{
					deleteElt.style.opacity = (deleteAction.enabled) ? '' : '0.1';
				});
				
				var undoListener = function()
				{
					undoElt.style.display = (ui.editor.undoManager.history.length > 0 ||
						graph.isEditing()) ? 'inline-block' : 'none';
					redoElt.style.display = undoElt.style.display;
					
					undoElt.style.opacity = (undoAction.enabled) ? '' : '0.1';
					redoElt.style.opacity = (redoAction.enabled) ? '' : '0.1';
				};
				
				toolbar.appendChild(undoElt);
				toolbar.appendChild(redoElt);
				
				undoAction.addListener('stateChanged', undoListener);
				redoAction.addListener('stateChanged', undoListener);
				undoListener();
				
				var pageMenu = this.createPageMenuTab(false, true);
				pageMenu.style.display = 'none';
				pageMenu.style.position = '';
				pageMenu.style.marginLeft = '';
				pageMenu.style.top = '';
				pageMenu.style.left = '';
				pageMenu.style.height = '100%';
				pageMenu.style.lineHeight = '';
				pageMenu.style.borderStyle = 'none';
				pageMenu.style.padding = '3px 0';
				pageMenu.style.margin = '0px';
				pageMenu.style.background = '';
				pageMenu.style.border = '';
				pageMenu.style.boxShadow = 'none';
				pageMenu.style.verticalAlign = 'top';
				pageMenu.style.width = 'auto';
				pageMenu.style.maxWidth = '160px';
				pageMenu.style.position = 'relative';
				pageMenu.style.padding = '6px';
				pageMenu.style.textOverflow = 'ellipsis';
				pageMenu.style.opacity = '0.8';
				footer.appendChild(pageMenu);

				function updatePageName()
				{
					pageMenu.innerText = '';

					if (ui.currentPage != null)
					{
						mxUtils.write(pageMenu, ui.currentPage.getName());
						var n = (ui.pages != null) ? ui.pages.length : 1;
						var idx = ui.getPageIndex(ui.currentPage);
						idx = (idx != null) ? idx + 1 : 1;
						var id = ui.currentPage.getId();
						pageMenu.setAttribute('title', ui.currentPage.getName() +
							' (' + idx + '/' + n + ')' + ((id != null) ?
							' [' + id + ']' : ''));
					}
				};

				ui.editor.addListener('pagesPatched', updatePageName);
				ui.editor.addListener('pageSelected', updatePageName);
				ui.editor.addListener('pageRenamed', updatePageName);
				ui.editor.addListener('fileLoaded', updatePageName);
				updatePageName();
				
				// Page menu only visible for multiple pages
				function pagesVisibleChanged()
				{
					pageMenu.style.display = ui.pages != null &&
						(urlParams['pages'] != '0' || ui.pages.length > 1 ||
						Editor.pagesVisible) ? 'inline-block' : 'none';
				};

				ui.addListener('fileDescriptorChanged', pagesVisibleChanged);
				ui.addListener('pagesVisibleChanged', pagesVisibleChanged);
				ui.editor.addListener('pagesPatched', pagesVisibleChanged);
				pagesVisibleChanged();
				
				var zoomOutElt = addMenuItem('', zoomOutAction.funct, true, mxResources.get('zoomOut') +
					' (' + Editor.ctrlKey + ' -/Alt+Mousewheel)', zoomOutAction, Editor.zoomOutImage);
				footer.appendChild(zoomOutElt);

				var elt = menuObj.addMenu('100%', viewZoomMenu.funct);
				elt.setAttribute('title', mxResources.get('zoom'));
				elt.innerHTML = '100%';
				elt.style.display = 'inline-block';
				elt.style.color = 'inherit';
				elt.style.cursor = 'pointer';
				elt.style.textAlign = 'center';
				elt.style.whiteSpace = 'nowrap';
	        	elt.style.paddingRight = '10px';
				elt.style.textDecoration = 'none';
				elt.style.verticalAlign = 'top';
				elt.style.padding = '6px 0';
				elt.style.fontSize = '14px';
				elt.style.width = '40px';
				elt.style.opacity = '0.4';
				footer.appendChild(elt);
				
				var zoomInElt = addMenuItem('', zoomInAction.funct, true, mxResources.get('zoomIn') +
					' (' + Editor.ctrlKey + ' +/Alt+Mousewheel)', zoomInAction, Editor.zoomInImage);
				footer.appendChild(zoomInElt);

				if (urlParams['embedInline'] == '1')
				{
					footer.appendChild(fullscreenElt);
					var exitAction = ui.actions.get('exit');
					footer.appendChild(addMenuItem('', exitAction.funct, null,
						mxResources.get('exit'), exitAction,
						Editor.closeImage));
				}
				else
				{
					fullscreenElt.parentNode.removeChild(fullscreenElt);
				}

				ui.tabContainer.style.visibility = 'hidden';
				menubar.style.cssText = 'position:absolute;right:14px;top:10px;height:30px;z-index:1;border-radius:4px;' +
					'box-shadow:0px 0px 3px 1px #d1d1d1;padding:6px 0px 6px 6px;border-bottom:1px solid lightgray;' +
					'text-align:right;white-space:nowrap;overflow:hidden;user-select:none;';
				toolbar.style.cssText = 'position:absolute;left:10px;top:10px;height:30px;z-index:1;border-radius:4px;' +
					'box-shadow:0px 0px 3px 1px #d1d1d1;padding:6px;border-bottom:1px solid lightgray;' +
					'text-align:right;white-space:nowrap;overflow:hidden;user-select:none;';
				footer.style.cssText = 'position:absolute;right:14px;bottom:14px;height:28px;z-index:1;border-radius:4px;' +
					'box-shadow:0px 0px 3px 1px #d1d1d1;padding:8px;white-space:nowrap;user-select:none;';
				wrapper.appendChild(toolbar);
				wrapper.appendChild(footer);
				
				picker.style.cssText = 'position:absolute;left:10px;z-index:1;border-radius:4px;' +
					'box-shadow:0px 0px 3px 1px #d1d1d1;padding:8px 6px 4px 6px;white-space:nowrap;' +
					'transform:translate(0, -50%);top:50%;user-select:none;';

				if (mxClient.IS_POINTER)
				{
					picker.style.touchAction = 'none';
				}

				wrapper.appendChild(picker);
				
				window.setTimeout(function()
				{
					mxUtils.setPrefixedStyle(picker.style, 'transition', 'transform .3s ease-out');
				}, 0);
				
				if (urlParams['format-toolbar'] == '1')
				{
					this.installFormatToolbar(wrapper);
				}
			}
			else
			{
				var fitElt = addMenuItem('', fitFunction, true, mxResources.get('fit') + ' (' + Editor.ctrlKey + '+H)', resetViewAction, Editor.zoomFitImage);
				
				menubar.style.cssText = 'position:absolute;left:0px;right:0px;top:0px;height:30px;padding:8px;' +
					'text-align:left;white-space:nowrap;';
				this.tabContainer.style.right = '70px';
				var elt = menuObj.addMenu('100%', viewZoomMenu.funct);
				elt.setAttribute('title', mxResources.get('zoom') + ' (Alt+Mousewheel)');
				elt.style.whiteSpace = 'nowrap';
	        	elt.style.paddingRight = '10px';
				elt.style.textDecoration = 'none';
				elt.style.textDecoration = 'none';
				elt.style.overflow = 'hidden';
				elt.style.visibility = 'hidden';
				elt.style.textAlign = 'center';
				elt.style.cursor = 'pointer';
				elt.style.height = (parseInt(ui.tabContainerHeight) - 1) + 'px';
				elt.style.lineHeight = (parseInt(ui.tabContainerHeight) + 1) + 'px';
				elt.style.position = 'absolute';
				elt.style.display = 'block';
				elt.style.fontSize = '12px';
				elt.style.width = '59px';
				elt.style.right = '0px';
				elt.style.bottom = '0px';
	        	elt.style.backgroundImage = 'url(' + mxWindow.prototype.minimizeImage + ')';
	        	elt.style.backgroundPosition = 'right 6px center';
	        	elt.style.backgroundRepeat = 'no-repeat';
				wrapper.appendChild(elt);
			}

	    	// Updates the label if the scale changes
			(function(elt)
			{
				// Adds shift+/alt+click on zoom label
				mxEvent.addListener(elt, 'click', fitFunction);

				var updateZoom = mxUtils.bind(this, function()
				{
					elt.innerText = '';
					mxUtils.write(elt, Math.round(ui.editor.graph.view.scale * 100) + '%');
				});

				ui.editor.graph.view.addListener(mxEvent.EVENT_SCALE, updateZoom);
				ui.editor.addListener('resetGraphView', updateZoom);
				ui.editor.addListener('pageSelected', updateZoom);
			})(elt);
	    	
	    	// Augments setGraphEnabled to update visible state
	    	var uiSetGraphEnabled = ui.setGraphEnabled;
	    	
	    	ui.setGraphEnabled = function()
	    	{
	    		uiSetGraphEnabled.apply(this, arguments);
	    		
	    		if (this.tabContainer != null)
	    		{
	    			elt.style.visibility = this.tabContainer.style.visibility;
    	        	this.diagramContainer.style.bottom = (this.tabContainer.style.visibility != 'hidden' &&
						footer == null) ? this.tabContainerHeight + 'px' : '0px';
	    		}
	    	};
		}
        
        wrapper.appendChild(menubar);
        wrapper.appendChild(ui.diagramContainer);
        previousParent.appendChild(wrapper);
        ui.updateTabContainer();

		if (!EditorUi.windowed && (urlParams['sketch'] == '1' || iw >= 1000) &&
			urlParams['embedInline'] != '1')
		{
			toggleFormat(this, true);
		}
        
		if (footer == null)
		{
        	wrapper.appendChild(ui.tabContainer);
		}
		
        var langMenuElt = null;
        
        function refreshMenu()
        {
			if (urlParams['sketch'] == '1')
			{
				if (urlParams['embedInline'] != '1')
				{
					toolbar.style.left = (picker.offsetTop - picker.offsetHeight / 2 < 58) ? '70px' : '10px';
				}
			}
			else
			{
				// Removes all existing menu items
				var node = menubar.firstChild;
				
				while (node != null)
				{
					var temp = node.nextSibling;
					
					if (node.className == 'geMenuItem' || node.className == 'geItem')
					{
						node.parentNode.removeChild(node);
					}
					
					node = temp;
				}
				
				before = menubar.firstChild;
				iw = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
				var small = iw < 1000 || urlParams['sketch'] == '1';
				var appElt = null;
		
				if (!small)
				{
					appElt = addMenu('diagram');
				}

				var temp = (small) ? addMenu('diagram', null, Editor.menuImage) : null;

				if (temp != null)
				{
					appElt = temp;
				}

		        createGroup([appElt, addMenuItem(mxResources.get('shapes'), ui.actions.get('toggleShapes').funct, null,
					mxResources.get('shapes'), ui.actions.get('image'), (small) ? Editor.shapesImage : null),
	       			addMenuItem(mxResources.get('format'), ui.actions.get('toggleFormat').funct, null,
	       			mxResources.get('format') + ' (' + ui.actions.get('formatPanel').shortcut + ')', ui.actions.get('image'),
	   				(small) ? Editor.formatImage : null)],
	   				(small) ? 60 : null);
			
		        var elt = addMenu('insert', true, (small) ? insertImage : null);
	        	createGroup([elt, addMenuItem(mxResources.get('delete'), ui.actions.get('delete').funct,
					null, mxResources.get('delete'), ui.actions.get('delete'),
		        	(small) ? Editor.trashImage : null)], (small) ? 60 : null);
	
		        if (iw >= 411)
		        {
			        createGroup([undoElt, redoElt], 60);
		
			        if (iw >= 520)
			        {
				        createGroup([fitElt,
					        (iw >= 640) ? addMenuItem('', zoomInAction.funct, true, mxResources.get('zoomIn') + ' (' + Editor.ctrlKey + ' +)',
								zoomInAction, Editor.zoomInImage) : null,
					        (iw >= 640) ? addMenuItem('', zoomOutAction.funct, true, mxResources.get('zoomOut') + ' (' + Editor.ctrlKey + ' -)',
								zoomOutAction, Editor.zoomOutImage) : null], 60);
			        }
		        }
			}
			
			if (appElt != null)
			{
				mxEvent.disableContextMenu(appElt);

				mxEvent.addGestureListeners(appElt, mxUtils.bind(this, function(evt)
				{
					if (mxEvent.isShiftDown(evt) || mxEvent.isAltDown(evt) ||
						mxEvent.isMetaDown(evt) || mxEvent.isControlDown(evt) ||
						mxEvent.isPopupTrigger(evt))
					{
						ui.appIconClicked(evt);
					}
				}), null, null);
			}
	        
	        var langMenu = ui.menus.get('language');

			if (langMenu != null && !mxClient.IS_CHROMEAPP &&
				!EditorUi.isElectronApp && iw >= 600 &&
				urlParams['sketch'] != '1')
			{
				if (langMenuElt == null)
				{
					var elt = menuObj.addMenu('', langMenu.funct);
					elt.setAttribute('title', mxResources.get('language'));
					elt.className = 'geToolbarButton';
					elt.style.backgroundImage = 'url(' + Editor.globeImage + ')';
		        	elt.style.backgroundPosition = 'center center';
		        	elt.style.backgroundRepeat = 'no-repeat';
		        	elt.style.backgroundSize = '24px 24px';
					elt.style.position = 'absolute';
		        	elt.style.height = '24px';
		        	elt.style.width = '24px';
					elt.style.zIndex = '1';
					elt.style.right = '8px';
					elt.style.cursor = 'pointer';
					elt.style.top = (urlParams['embed'] == '1') ? '12px' : '11px';
					menubar.appendChild(elt);
					langMenuElt = elt;
				}
				
				ui.buttonContainer.style.paddingRight = '34px';
			}
			else
			{
				ui.buttonContainer.style.paddingRight = '4px';
				
				if (langMenuElt != null)
				{
					langMenuElt.parentNode.removeChild(langMenuElt);
					langMenuElt = null;
				}
			}
        };
        
        refreshMenu();
        
        mxEvent.addListener(window, 'resize', function()
		{
        	refreshMenu();
        	
            if (ui.sidebarWindow != null)
            {
                ui.sidebarWindow.window.fit();
            }
            
            if (ui.formatWindow != null)
            {
            	ui.formatWindow.window.fit();
            }

            if (ui.actions.outlineWindow != null)
            {
            	ui.actions.outlineWindow.window.fit();
            }

            if (ui.actions.layersWindow != null)
            {
            	ui.actions.layersWindow.window.fit();
            }

            if (ui.menus.tagsWindow != null)
            {
            	ui.menus.tagsWindow.window.fit();
            }

            if (ui.menus.findWindow != null)
            {
            	ui.menus.findWindow.window.fit();
            }

            if (ui.menus.findReplaceWindow != null)
            {
            	ui.menus.findReplaceWindow.window.fit();
            }
		});

		if (urlParams['embedInline'] == '1')
		{
			document.body.style.cursor = 'text';
			picker.style.transform = '';

			mxEvent.addGestureListeners(ui.diagramContainer.parentNode, function(evt)
			{
				if (mxEvent.getSource(evt) ==
					ui.diagramContainer.parentNode)
				{
					ui.embedExitPoint = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
					ui.sendEmbeddedSvgExport();
				}
			});

			var div = document.createElement('div');
			div.style.position = 'absolute';
			div.style.width = '10px';
			div.style.height = '10px';
			div.style.borderRadius = '5px';
			div.style.border = '1px solid gray';
			div.style.background = '#ffffff';
			div.style.cursor = 'row-resize';
			ui.diagramContainer.parentNode.appendChild(div);
			ui.bottomResizer = div;

			var x0 = null;
			var y0 = null;
			var w0 = null;
			var h0 = null;

			mxEvent.addGestureListeners(div, function(evt)
			{
				h0 = parseInt(ui.diagramContainer.style.height);
				y0 = mxEvent.getClientY(evt);
				graph.popupMenuHandler.hideMenu();
				mxEvent.consume(evt);
			});

			div = div.cloneNode(false);
			div.style.cursor = 'col-resize';
			ui.diagramContainer.parentNode.appendChild(div);
			ui.rightResizer = div;

			mxEvent.addGestureListeners(div, function(evt)
			{
				w0 = parseInt(ui.diagramContainer.style.width);
				x0 = mxEvent.getClientX(evt);
				graph.popupMenuHandler.hideMenu();
				mxEvent.consume(evt);
			});

			mxEvent.addGestureListeners(document.body, null, function(evt)
			{
				var changed = false;

				if (x0 != null)
				{
					ui.diagramContainer.style.width = Math.max(20,
						w0 + mxEvent.getClientX(evt) - x0) + 'px';
					changed = true;
				}

				if (y0 != null)
				{
					ui.diagramContainer.style.height = Math.max(20,
						h0 + mxEvent.getClientY(evt) - y0) + 'px';
					changed = true;
				}

				if (changed)
				{
					var parent = window.opener || window.parent;
					parent.postMessage(JSON.stringify({
						event: 'resize',
						fullscreen: Editor.inlineFullscreen,
						rect: ui.diagramContainer.getBoundingClientRect()
					}), '*');
					inlineSizeChanged();
					ui.refresh();
				}
			}, function(evt)
			{
				if (x0 != null || y0 != null)
				{
					mxEvent.consume(evt);
				}

				x0 = null;
				y0 = null;
			});

			this.diagramContainer.style.borderRadius = '4px';
			document.body.style.backgroundColor = 'transparent';
			ui.bottomResizer.style.visibility = 'hidden';
			ui.rightResizer.style.visibility = 'hidden';
			toolbar.style.visibility = 'hidden';
			footer.style.visibility = 'hidden';
			picker.style.display = 'none';
		}
		
		if (urlParams['prefetchFonts'] == '1')
		{
			ui.editor.loadFonts();
		}
	};	
};

(function()
{
	var initialized = false;
	
	// ChromeApp has async local storage
	if (uiTheme == 'min' && !initialized && !mxClient.IS_CHROMEAPP)
	{
		EditorUi.initMinimalTheme();
		initialized = true;
	}
	
	var uiInitTheme = EditorUi.initTheme;
	
	// For async startup like chromeos
	EditorUi.initTheme = function()
	{
		uiInitTheme.apply(this, arguments);
		
		if (uiTheme == 'min' && !initialized)
		{
			this.initMinimalTheme();
			initialized = true;
		}
	};
})();
