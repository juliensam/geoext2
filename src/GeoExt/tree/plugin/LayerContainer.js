/*
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full text
 * of the license.
 */

/**
 * @require GeoExt/tree/LayerLoader.js
 */

/**
 * @class
 * A layer node plugin that will collect all layers of an OpenLayers map. Only
 * layers that have displayInLayerSwitcher set to true will be included.
 * The childrens' iconCls defaults to "gx-tree-layer-icon" and this node'
 * text defaults to "Layers".
 */
Ext.define('GeoExt.tree.plugin.LayerContainer', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.gx_layercontainer',
    
    /**
     * @private
     * The default text for the target node.
     */
    defaultText: 'Layers',
    
    /**
     * A function, called in the scope of this loader, with a layer record
     * as argument. Is expected to return true for layers to be loaded, false
     * otherwise. By default, the filter checks for displayInLayerSwitcher:
     * @param {Function} filter
     *  
     * @example
     * filter: function(record) {
     *     return record.getLayer().displayInLayerSwitcher == true
     * }
     */
    filter: function(record) {
        return record.getLayer().displayInLayerSwitcher == true;
    },
    
    /** api: config[baseAttrs]
     *  An object containing attributes to be added to all nodes created by
     *  this loader.
     */
    baseAttrs: null,
    
    /**
     * @private
     */
    init: function(config) {
        var me = this, 
            treeLayers = {text: this.defaultText, children: []};

        var layers = config.layers;
        if(!layers) {
            layers = GeoExt.MapPanel.guess().layers;
        }

        if(!layers) {
            return treeLayers;
        }
        console.log(layers)
        layers.each(function(record) {
            var child = this.getLayerNode(record);
            if(child) {
                treeLayers.children.push(child);
            }
        }, this);

        return treeLayers;
    },

    /** api: method[createNode]
     *  :param attr: ``Object`` attributes for the new node
     *
     *  Override this function for custom TreeNode node implementation, or to
     *  modify the attributes at creation time.
     */
    createNode: function(attr) {
        if(this.baseAttrs){
            Ext.apply(attr, this.baseAttrs);
        }
        
        return attr;
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
    getLayerNode: function(layerRecord) {
        var child = null;

        if (this.filter(layerRecord) === true) {
            var layer = layerRecord.getLayer();
            var child = this.createNode({
                plugins: [{
                    ptype: 'gx_layer',
                }],
                layer: layer,
                text: layer.name,
                leaf: true,
                listeners: {
                    move: this.onChildMove,
                    scope: this
                }
            });
        }

        return child;
    },
    
    /**
     * @private
     * @param {Number} index  The record index in the layer store.
     * @returns {Number} The appropriate child node index for the record.
     */
    recordIndexToNodeIndex: function(index, node) {
        var me = this;
        var store = me.loader.store;
        var count = store.getCount();
        var nodeCount = node.childNodes.length;
        var nodeIndex = -1;
        for(var i=count-1; i>=0; --i) {
            if(me.loader.filter(store.getAt(i)) === true) {
                ++nodeIndex;
                if(index === i || nodeIndex > nodeCount-1) {
                    break;
                }
            }
        }
        return nodeIndex;
    }
});
