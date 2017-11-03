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
                selector: '$node > node',
                css: {
                    'padding-top': '10px',
                    'padding-left': '10px',
                    'padding-bottom': '10px',
                    'padding-right': '10px',
                    'text-valign': 'top',
                    'text-halign': 'center',
                    'background-color': 'data(color)',
                    'font-size': 15
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

        this.undoRedo = this.cy.undoRedo();

        this.initEvents();
    }

    initEvents() {
        this.cy.on('tap', 'node', this._nodeClick.bind(this));
        this.cy.on('tap', 'edge', this._edgeClick.bind(this));
        this.cy.on('tap', this._globalTap.bind(this));
        this.cy.on('position', 'node', this._nodeMoved.bind(this))
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

    centerOn(id) {
        let item = this.cy.$(`#${id}`);
        this.cy.animate({
            fit: {
                eles: item,
                padding: 350
            }
        });
    }

    centerOnNode(nodeId) {
        let node = this.getCyNode(nodeId);
        this.cy.animate({
            fit: {
                eles: node,
                padding: 50
            }
        });
    }

    centerOnEdge(edgeId) {
        let edge = this.getCyEdge(edgeId);
        this.cy.animate({
            fit: {
                eles: edge,
                padding: 50
            }
        });
    }
    //endregion

    //region Graph data

    get mode() {
        return this._mode || 'select';
    }

    set mode(value) {
        let availableModes = ['select', 'add-node', 'add-edge', 'add-group', 'delete'];
        if (!value || availableModes.indexOf(value) === -1) {
            return;
        }

        this._mode = value;

        this.unselectAllNodes();
        this.unselectAllEdges();
    }
    get nodes() {
        return this.cy.json().elements.nodes;
    }

    get edges() {
        return this.cy.json().elements.edges;
    }

    get formattedNodes() {
        let nodes = [];
        if (this.nodes) {
            this.nodes.forEach(node => nodes.push(this.cyToNode(node)));
        }
        return nodes;
    }

    get selectedNodes() {
        return this.cy.$('node.selected');
    }

    get selectedEdges() {
        return this.cy.$('edge.selected');
    }

    png(background) {
        background = background || 'white';
        return this.cy.png({
            output: 'blob',
            bg: background
        });
    }

    //region Node callbacks
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

    get onNodeRemoving() {
        return this._onNodeRemoving || (_ => {});
    }

    set onNodeRemoving(value) {
        if (typeof value !== "function") {
            return;
        }

        this._onNodeRemoving = value;
    }


    //endregion

    //region Edge callbacks
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

    get onEdgeRemoving() {
        return this._onEdgeRemoving || (_ => {});
    }

    set onEdgeRemoving(value) {
        if (typeof value !== "function") {
            return;
        }

        this._onEdgeRemoving = value;
    }

    //endregion

    //region Group callbacks
    get beforeGroupCreation() {
        return this._beforeGroupCreation || (_ => {});
    }

    set beforeGroupCreation(value) {
        if (typeof value !== "function") {
            return;
        }

        this._beforeGroupCreation = value;
    }
    //endregion

    get json() {
        return this.cy.json();
    }

    set json(value) {
        this.cy.json(value);
    }

    //region Storage functions

    loadFromStorage() {
        if (this.localStorageKey) {
            let data = localStorage.getItem(this.localStorageKey);
            if (data) {
                data = JSON.parse(data);
                this.json = data;
                this.loadGroups(data);
            } else {
                this.init();
            }
        } else {
            console.warn('Missing localStorage key to retrieve data');
        }
    }

    saveToStorage() {
        if (this.localStorageKey) {
            this.unselectAllNodes();
            this.unselectAllEdges();
            localStorage.setItem(this.localStorageKey, JSON.stringify(this.json));
        } else {
            console.warn('Missing localStorage key to save data');
        }
    }

    loadGroups(data) {
        let nodes = data.elements.nodes;
        let groups = {};
        if (nodes) {
            for (let node of nodes) {
                let data = this.getNodeData(node);
                if (data.parent) {
                    if (!groups[data.parent]) {
                        groups[data.parent] = [];
                    }

                    groups[data.parent].push(data.id);
                }
            }
        }

        for (var key in groups) {
            let group = this.getNodeData(this.getNode(key));
            this.addGroup(groups[key], group.label, group.color, group.id);
        }
    }

    loadData(data) {
        this.json = data;
        this.loadGroups(data);
    }

    //endregion

    //endregion    

    //region Graph search

    getNodesWithLabel(label) {
        return this.searchNode('label', label);
    }

    getEdgesWithLabel(label) {
        return this.searchEdge('label', label);
    }

    searchNode(property, value) {
        let nodes = [];
        let cyNodes = this.cy.nodes(`[${property}@*="${value}"]`);

        cyNodes.forEach(node => {
            nodes.push(this.cyToNode(node));
        })
        return nodes;
    }

    searchEdge(property, value) {
        let edges = [];
        let cyEdges = this.cy.edges(`[${property}@*="${value}"]`);

        cyEdges.forEach(edge => {
            edges.push(this.cyToNode(edge));
        })
        return edges;
    }

    search(element, property, value) {
        let elements = [];
        switch (element) {
            case 'node':
                elements = this.searchNode(property, value);
                break;
            case 'edge':
                elements = this.searchEdge(property, value);
                break;
        }
        return elements;
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
        return this.cyToNode(this.getCyNode(nodeId));
    }

    getCyNode(nodeId) {
        return this.cy.$(`#${nodeId}`);
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
        node.parent = data.parent;
        return node;
    }

    deleteAllNodes() {
        if (this.nodes) {
            for (let node of this.nodes) {
                this.remove(this.getNodeData(node).id);
            }
        }
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
        return this.cyToEdge(this.getCyEdge(edgeId));
    }

    getCyEdge(edgeId) {
        return this.cy.$(`#${edgeId}`);
    }

    getEdgeData(edge) {
        return typeof edge.data === "function" ? edge.data() : edge.data;
    }

    updateEdgeProperty(edgeId, property, value) {
        let edge = this.getCyEdge(edgeId);
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

    getEdgesWithNode(nodeId) {
        let edges = [];

        if (this.edges && this.edges.length) {
            for (let edge of this.edges) {
                edge = this.cyToEdge(edge);

                if (edge.source.fullId === nodeId || edge.target.fullId === nodeId) {
                    edges.push(edge);
                }
            }
        }

        return edges;
    }

    deleteAllEdges() {
        if (this.edges) {
            for (let edge of this.edges) {
                this.remove(this.getEdgeData(edge).id);
            }
        }
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
    addNode(x, y, label, color, parentId, nodeId) {
        // Set node data
        label = label || '';
        color = color || this.nodeColor;

        var nextId = nodeId || this.nextNodeId;

        let node = new GraphCreatorNode(nextId, x, y);
        node.label = label;
        node.color = color || this.nodeColor;
        node.parent = parentId;

        // Add it to graph
        this.undoRedo.do('add', {
            group: "nodes",
            data: node.data,
            position: node.position,
            grabbable: true
        })

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

        this.undoRedo.do('add', {
            group: 'edges',
            data: edge.data
        });

        this.unselectAllEdges();
        this.unselectAllNodes();

        this.saveToStorage();

        return edge;
    }

    addGroup(nodesId, label, color, groupId) {
        if (nodesId.length === 0) {
            return;
        }


        label = label || '';
        color = color || this.nodeColor;
        groupId = groupId || this.nextNodeId;

        let nodes = [];
        let edges = [];

        let pos = {
            x: undefined,
            y: undefined
        };



        for (let id of nodesId) {
            let node = this.getNode(id)
            nodes.push(node);
            let nodeEdges = this.getEdgesWithNode(id);
            edges = edges.concat(nodeEdges);

            if (!pos.x && !pos.y) {
                pos.x = node.x;
                pos.y = node.y;
            }

            this.remove(node.fullId);
        }

        this.remove(groupId);
        let group = this.addNode(pos.x, pos.y, label, color, undefined, groupId);

        for (let node of nodes) {
            this.addNode(node.x, node.y, node.label, node.color, group.fullId, node.fullId);
        }

        for (let edge of edges) {
            this.addEdge(edge.source, edge.target, edge.color, edge.label, edge.oriented, edge.arrowColor);
        }

        this.saveToStorage();
    }
    //endregion

    //region Graph deletion

    remove(id) {
        let item = this.cy.$(`#${id}`);
        this.undoRedo.do('remove', item);

        let callback = item.isNode ? this.onNodeRemoving : this.onEdgeRemoving;

        callback(item);

        this.saveToStorage();
    }

    //endregion

    //region Event handling

    _nodeClick(e) {

        if (this.mode !== 'select' && this.mode !== 'add-edge' && this.mode !== 'delete' && this.mode !== 'add-group') {
            return;
        }

        let node = e.target;
        let mousePosition = e.renderedPosition;
        node.toggleClass('selected');


        switch (this.mode) {
            case 'select':
                if (node.hasClass('selected')) {
                    this.onNodeSelection(this.cyToNode(node), mousePosition);
                    this.selectedNodes.forEach(node => {
                        node.removeClass('selected');
                    });
                    node.addClass('selected');
                } else {
                    this.onNodeUnselection(this.cyToNode(node), mousePosition);
                }
                break;
            case 'add-edge':
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
                    if (this.selectedNodes.length > 2) {
                        node.removeClass('selected');
                    }
                    this.onEdgeUnselection();
                }
                break;
            case 'add-group':
                if (this.selectedNodes.length < 2) {
                    return;
                }
                let selectedNodes = [];
                this.selectedNodes.forEach(selected => selectedNodes.push(this.cyToNode(selected)));
                this.beforeGroupCreation(selectedNodes, mousePosition);
                break;
            case 'delete':
                this.remove(this.getNodeData(node).id);
                break;
            default:

        }
    }

    _edgeClick(e) {
        if (this.mode !== 'select' && this.mode !== 'delete') {
            return;
        }

        let clickedEdge = e.target;
        let mousePosition = e.renderedPosition;
        let alreadySelected = clickedEdge.hasClass('selected');

        // Unselect all edges
        this.selectedEdges.forEach(edge => {
            edge.removeClass('selected');
            this.onEdgeUnselection(this.cyToEdge(edge), mousePosition);
        });

        switch (this.mode) {
            case 'select':
                if (!alreadySelected) {
                    clickedEdge.addClass('selected');
                    this.onEdgeSelection(this.cyToEdge(clickedEdge), mousePosition);
                }
                break;
            case 'delete':
                this.remove(this.getEdgeData(clickedEdge).id);
                break;
            default:

        }
    }

    _globalTap(e) {

        let target = e.target;
        let position = e.position;
        let mousePosition = e.renderedPosition;

        if (target === this.cy) {
            // Right click on background, insert node
            if (this.mode === 'add-node') {
                this.beforeNodeCreation(position, mousePosition);
            }
        }
    }

    _nodeMoved(e) {
        let node = this.cyToNode(e.target);
        let position = e.target.position();
        this.updateNodeProperty(node.fullId, 'x', position.x);
        this.updateNodeProperty(node.fullId, 'y', position.y);
        this.saveToStorage();
    }

    //endregion

    //region Undo redo

    undo() {
        return this.undoRedo.undo();
    }

    redo() {
        return this.undoRedo.redo();
    }
    //endregion

    //region Algorithms

    dijkstra(startId, endId) {
        let dijkstra = this.cy.elements().dijkstra(`#${startId}`, () => 1);

        let end = this.getCyNode(endId);
        let distance = dijkstra.distanceTo(end);
        let cyPath = dijkstra.pathTo(end);
        let path = [];

        cyPath.forEach(item => {
            path.push(item.isNode() ? this.cyToNode(item) : this.cyToEdge(item));
        });

        return {
            distance: distance,
            path: path
        };
    }

    //endregion
}