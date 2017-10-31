class Graph {

    // Init graph with cytoscape library
    constructor(cytoscape, container, style) {
        if (!cytoscape && !container) {
            throw new Error('Missing parameters');
        }

        this.cy = cytoscape({
            container: container,
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
                    'mid-target-arrow-shape': 'none',
                    'mid-target-arrow-color': 'data(arrowColor)',
                    'mid-target-arrow-fill': 'filled',
                    'arrow-scale': 2,
                    'label': 'data(label)',
                    'color': 'black'
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

        if (style) {
            this.nodeColor = style.nodeColor;
            this.edgeColor = style.edgeColor;
            this.edgeArrowColor = style.edgeArrowColor;
        }
    }

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

    get beforeEdgeCreation() {
        return this._beforeEdgeCreation || (_ => {});
    }

    set beforeEdgeCreation(value) {
        if (typeof value !== "function") {
            return;
        }

        this._beforeEdgeCreation = value;
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


    getNodeData(node) {
        return typeof node.data === "function" ? node.data() : node.data;
    }

    unselectAllNodes() {
        this.selectedNodes.forEach(node => node.removeClass('selected'));
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


    getEdgeData(edge) {
        return typeof edge.data === "function" ? edge.data() : edge.data;
    }

    unselectAllEdges() {
        this.selectedEdges.forEach(edge => edge.removeClass('selected'));
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

        let node = new Node(nextId, x, y);
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

        return node;
    }

    /**
     * Insert an edge in the graph
     * 
     * @param {Node} source The source node
     * @param {Node} target The target node
     * @param {string} color The color of the edge
     * @param {boolean} oriented True if edge is oriented
     * @param {string} arrowColor The color of the edge arrow
     * @returns Edge created
     * @memberof Graph
     */
    addEdge(source, target, color, oriented, arrowColor) {
        color = color || this.edgeColor;
        arrowColor = arrowColor || this.edgeColor;

        var edge = new Edge(this.nextEdgeId, source, target, oriented);
        edge.color = color;
        edge.arrow = arrowColor;

        this.cy.add({
            group: 'edges',
            data: edge.data,
            style: {
                'mid-target-arrow-shape': edge.oriented ? 'triangle' : 'none'
            }
        });

        this.unselectAllEdges();

        return edge;
    }
    //endregion

    //region Graph deletion

    remove(id) {
        let item = this.cy.$(`#${id}`);
        this.cy.remove(item);
    }

    //endregion

    //region Event handling

    _nodeClick(e) {
        let node = e.target;
        if (this.selectedNodes.length >= 2 && !node.hasClass('selected')) {
            return;
        }
        node.toggleClass('selected');

        if (this.selectedNodes.length === 2) {
            let sourceData = this.getNodeData(this.selectedNodes[0]);
            let targetData = this.getNodeData(this.selectedNodes[1]);

            let source = new Node(sourceData.id, sourceData.x, sourceData.y);
            let target = new Node(targetData.id, targetData.x, targetData.y);
            this.beforeEdgeCreation();
        }
    }

    _edgeClick(e) {
        let clickedEdge = e.target;
        let alreadySelected = clickedEdge.hasClass('selected');

        // Unselect all edges
        this.selectedEdges.forEach(edge => {
            edge.removeClass('selected');
        });


        if (!alreadySelected) {
            clickedEdge.addClass('selected');
        }
    }

    _rightClick(e) {
        let target = e.target;
        let position = e.position;

        if (target === this.cy) {
            // Right click on background, insert node
            this.beforeNodeCreation();
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