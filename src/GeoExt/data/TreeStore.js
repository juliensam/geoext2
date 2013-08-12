
Ext.define('GeoExt.data.TreeStore', {
    extend: 'Ext.data.TreeStore',
    alias: 'store.gx_tree',

    model: 'GeoExt.data.LayerTreeModel',

    children: null,

    defaultRoot: {
        expanded: true,
        children: []
    },

    constructor: function(config) {
        var me = this;

        if(!config.root) {
            config.root = this.defaultRoot;
        }

        if(config.children) {

            if(!(config.children instanceof Array)) {
                config.children = [config.children];
            }

            for(var i=0; i<config.children.length; i++) {
                config.root.children.push(this.getChildNodes(config.children[i]));
            }

            delete config.children;
        }

        this.callParent(arguments);
    },

    /** private: method[addLayerNode]
     *  :param node: ``Ext.tree.TreeNode`` The node that the layer node will
     *      be added to as child.
     *  :param layerRecord: ``Ext.data.Record`` The layer record containing the
     *      layer to be added.
     *  :param index: ``Number`` Optional index for the new layer.  Default is 0.
     *  
     *  Adds a child node representing a layer of the map
     */
    getChildNodes: function(node) {
        var me = this,
            childNodes = {};

        if(node.plugins && node.plugins instanceof Array) {
            for(var i=0; i<node.plugins.length; i++) {
                var plugin = Ext.ClassManager.getByAlias('plugin.'+node.plugins[i]);
                if(!plugin || !plugin.prototype.init) {
                    continue;
                }

                childNodes = Ext.apply(childNodes, plugin.prototype.init(node));
            }

            delete node.plugins;
        }

        childNodes = Ext.apply(childNodes, node);

        if(node.children) {
            for(var i=0; i<node.children.length; i++) {
                childNodes.children[i] = this.getChildNodes(node.children[0]);
            }
        }

        return childNodes;
    }
    });
