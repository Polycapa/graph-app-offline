class GraphCreatorGraph {

    //region Init

    // Init graph with cytoscape library
    constructor(cytoscape, container, style, localStorageKey) {
        if (!cytoscape && !container) {
            throw new Error('Missing parameters');
        }

        this.cytoscape = cytoscape;
        this.container = container;

        this.init();

        if (style) {
            this.nodeColor = style.nodeColor;
            this.edgeColor = style.edgeColor;
            this.edgeArrowColor = style.edgeArrowColor;
        }

        this.localStorageKey = localStorageKey;

        if (this.localStorageKey) {
            this.loadFromStorage();
        }
    }

    init() {
        this.cy = this.cytoscape({
            container: this.container,
            style: [{
                selector: 'node',
                style: {
                    'background-color': 'data(color)',
                    'color': 'black',
                    'label': 'data(label)',
                    'min-zoomed-font-size': '3',
                    'font-size': 10
                }
            }, {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': 'data(color)',
                    'mid-target-arrow-shape': 'data(arrowShape)',
                    'mid-target-arrow-color': 'data(arrowColor)',
                    'mid-target-arrow-fill': 'filled',
                    'arrow-scale': 2,
                    'label': 'data(label)',
                    'color': 'black',
                    'text-rotation': 'autorotate',
                    'text-margin-y': -15
                }
            }, {
                selector: 'node.selected',
                style: {
                    'border-width': '5px',
                    'border-color': 'black'
                }
            }, {
                selector: 'edge.selected',
                style: {
                    'width': 10,
                    'line-style': 'dashed'
                }
            }]
        });

        this.cy.on('tap', 'node', this._nodeClick.bind(this));
        this.cy.on('tap', 'edge', this._edgeClick.bind(this));
        this.cy.on('cxttap', this._rightClick.bind(this));
    }

    //endregion

    //region Style
    get nodeColor() {
        return this._nodeColor || 'yellow';
    }

    set nodeColor(value) {
        if (!value) {
            return;
        }
        this._nodeColor = value;
    }

    get nodeLabelColor() {
        return 'black';
    }

    get edgeColor() {
        return this._edgeColor || 'blue';
    }

    set edgeColor(value) {
        if (!value) {
            return;
        }
        this._edgeColor = value;
    }

    get edgeArrowColor() {
        return this._edgeArrowColor || this.edgeColor;
    }

    set edgeArrowColor(value) {
        if (!value) {
            return;
        }
        this._edgeArrowColor = value;
    }

    //endregion

    //region Graph view
    center() {
        this.cy.animate({
            fit: {
                eles: this.cy.nodes(),
                padding: 50
            }
        });
    }
    //endregion

    //region Graph data
    get nodes() {
        return this.cy.json().elements.nodes;
    }

    get edges() {
        return this.cy.json().elements.edges;
    }

    get selectedNodes() {
        return this.cy.$('node.selected');
    }

    get selectedEdges() {
        return this.cy.$('edge.selected');
    }

    get beforeNodeCreation() {
        return this._beforeNodeCreation || (_ => {});
    }

    set beforeNodeCreation(value) {
        if (typeof value !== "function") {
            return;
        }

        this._beforeNodeCreation = value;
    }

    get onNodeSelection() {
        return this._onNodeSelection || (_ => {});
    }

    set onNodeSelection(value) {
        if (typeof value !== "function") {
            return;
        }

        this._onNodeSelection = value;
    }

    get onNodeUnselection() {
        return this._onNodeUnselection || (_ => {});
    }

    set onNodeUnselection(value) {
        if (typeof value !== "function") {
            return;
        }

        this._onNodeUnselection = value;
    }



    get beforeEdgeCreation() {
        return this._beforeEdgeCreation || (_ => {});
    }

    set beforeEdgeCreation(value) {
        if (typeof value !== "function") {
            return;
        }

        this._beforeEdgeCreation = value;
    }

    get onEdgeSelection() {
        return this._onEdgeSelection || (_ => {});
    }

    set onEdgeSelection(value) {
        if (typeof value !== "function") {
            return;
        }

        this._onEdgeSelection = value;
    }

    get onEdgeUnselection() {
        return this._onEdgeUnselection || (_ => {});
    }

    set onEdgeUnselection(value) {
        if (typeof value !== "function") {
            return;
        }

        this._onEdgeUnselection = value;
    }

    get json() {
        return this.cy.json();
    }

    set json(value) {
        this.cy.json(value);
    }

    loadFromStorage() {
        if (this.localStorageKey) {
            let data = localStorage.getItem(this.localStorageKey);
            if (data) {
                this.json = JSON.parse(data);
            } else {
                this.init();
            }
        } else {
            console.error('Missing localStorage key to retrieve data');
        }
    }

    saveToStorage() {
        if (this.localStorageKey) {
            this.unselectAllNodes();
            this.unselectAllEdges();
            localStorage.setItem(this.localStorageKey, JSON.stringify(this.json));
        } else {
            console.error('Missing localStorage key to save data');
        }
    }

    //endregion    

    //region Node gestion
    get lastNodeId() {
        var nodes = this.nodes;

        if (!nodes) {
            return;
        }


        let lastId = -1;
        for (let node of nodes) {
            let id = this.getNodeData(node).id;
            id = Number(id.substring(1));
            if (id > lastId) {
                lastId = id;
            }
        }

        return lastId;
    }

    get nextNodeId() {
        return this.lastNodeId !== undefined ? this.lastNodeId + 1 : 0;
    }

    getNode(nodeId) {
        return this.cyToNode(this.cy.$(`#${nodeId}`));
    }

    getNodeData(node) {
        return typeof node.data === "function" ? node.data() : node.data;
    }

    updateNodeProperty(nodeId, property, value) {
        this.cy.$(`#${nodeId}`).data(property, value);
        this.saveToStorage();
    }

    updateNodeData(nodeId, data) {
        for (var key in data) {
            this.updateNodeProperty(nodeId, key, data[key]);
        }
    }

    unselectAllNodes() {
        this.selectedNodes.forEach(node => node.removeClass('selected'));
        this.onNodeUnselection();
    }

    cyToNode(cyNode) {
        let data = this.getNodeData(cyNode);
        let node = new GraphCreatorNode(data.id, data.x, data.y);
        node.label = data.label;
        node.color = data.color;
        return node;
    }

    //endregion

    //region Edge gestion
    get lastEdgeId() {
        var edges = this.edges;

        if (!edges) {
            return;
        }


        let lastId = -1;
        for (let edge of edges) {
            let id = this.getEdgeData(edge).id;
            id = Number(id.substring(1));
            if (id > lastId) {
                lastId = id;
            }
        }

        return lastId;
    }

    get nextEdgeId() {
        return this.lastEdgeId !== undefined ? this.lastEdgeId + 1 : 0;
    }

    getEdge(edgeId) {
        return this.cyToEdge(this.cy.$(`#${edgeId}`));
    }

    getEdgeData(edge) {
        return typeof edge.data === "function" ? edge.data() : edge.data;
    }

    updateEdgeProperty(edgeId, property, value) {
        let edge = this.cy.$(`#${edgeId}`);
        edge.data(property, value);
        this.saveToStorage();
    }

    updateEdgeData(edgeId, data) {
        for (var key in data) {
            this.updateEdgeProperty(edgeId, key, data[key]);
        }
    }

    unselectAllEdges() {
        this.selectedEdges.forEach(edge => edge.removeClass('selected'));
        this.onEdgeUnselection();
    }

    cyToEdge(cyEdge) {
        let data = this.getEdgeData(cyEdge);
        let edge = new GraphCreatorEdge(data.id, this.getNode(data.source), this.getNode(data.target), data.oriented);
        edge.arrowColor = data.arrowColor;
        edge.color = data.color;
        edge.label = data.label;
        return edge;
    }
    //endregion

    //region Graph insertion

    /**
     * Insert a node in the graph
     * 
     * @param {number} x X coordinate 
     * @param {number} y Y coordinate
     * @param {string} label Label of the node
     * @param {string} color Color of the node
     * @returns Node created
     * @memberof Graph
     */
    addNode(x, y, label, color) {
        // Set node data
        label = label || '';
        color = color || this.nodeColor;

        var nextId = this.nextNodeId;

        let node = new GraphCreatorNode(nextId, x, y);
        node.label = label;
        node.color = color || this.nodeColor;

        // Add it to graph
        this.cy.add({
            group: "nodes",
            data: node.data,
            position: node.position,
            grabbable: true
        });

        this.unselectAllNodes();

        this.saveToStorage();

        return node;
    }

    /**
     * Insert an edge in the graph
     * 
     * @param {GraphCreatorNode} source The source node
     * @param {GraphCreatorNode} target The target node
     * @param {string} color The color of the edge
     * @param {boolean} oriented True if edge is oriented
     * @param {string} arrowColor The color of the edge arrow
     * @returns Edge created
     * @memberof Graph
     */
    addEdge(source, target, color, label, oriented, arrowColor) {
        label = label || '';
        color = color || this.edgeColor;
        arrowColor = arrowColor || this.edgeColor;

        var edge = new GraphCreatorEdge(this.nextEdgeId, source, target, oriented);
        edge.color = color;
        edge.arrow = arrowColor;
        edge.label = label;

        this.cy.add({
            group: 'edges',
            data: edge.data
        });

        this.unselectAllEdges();
        this.unselectAllNodes();

        this.saveToStorage();

        return edge;
    }
    //endregion

    //region Graph deletion

    remove(id) {
        let item = this.cy.$(`#${id}`);
        this.cy.remove(item);

        this.saveToStorage();
    }

    //endregion

    //region Event handling

    _nodeClick(e) {
        let node = e.target;
        let mousePosition = e.renderedPosition;
        if (this.selectedNodes.length >= 2 && !node.hasClass('selected')) {
            return;
        }
        node.toggleClass('selected');

        if (node.hasClass('selected')) {
            this.onNodeSelection(this.cyToNode(node), mousePosition);
        } else {
            this.onNodeUnselection(this.cyToNode(node), mousePosition);
        }

        if (this.selectedNodes.length === 2) {
            let firstData = this.getNodeData(this.selectedNodes[0]);
            let secondData = this.getNodeData(this.selectedNodes[1]);
            let nodeData = this.getNodeData(node);

            let sourceData, targetData;
            if (firstData.id === nodeData.id) {
                // Node is first data
                targetData = firstData;
                sourceData = secondData;
            } else {
                // Node is second data
                targetData = secondData;
                sourceData = firstData;
            }

            let source = new GraphCreatorNode(sourceData.id, sourceData.x, sourceData.y);
            let target = new GraphCreatorNode(targetData.id, targetData.x, targetData.y);

            this.beforeEdgeCreation(source, target, mousePosition);
        } else {
            this.onEdgeUnselection();
        }
    }

    _edgeClick(e) {
        let clickedEdge = e.target;
        let mousePosition = e.renderedPosition;
        let alreadySelected = clickedEdge.hasClass('selected');

        // Unselect all edges
        this.selectedEdges.forEach(edge => {
            edge.removeClass('selected');
            this.onEdgeUnselection(this.cyToEdge(edge), mousePosition);
        });


        if (!alreadySelected) {
            clickedEdge.addClass('selected');
            this.onEdgeSelection(this.cyToEdge(clickedEdge), mousePosition);
        }
    }

    _rightClick(e) {
        let target = e.target;
        let position = e.position;
        let mousePosition = e.renderedPosition;

        if (target === this.cy) {
            // Right click on background, insert node
            this.beforeNodeCreation(position, mousePosition);
        } else if (target.isNode()) {
            // Remove node
            this.remove(this.getNodeData(target).id);
        } else if (target.isEdge()) {
            // Remove edge
            this.remove(this.getEdgeData(target).id);
        }
    }

    //endregion
}