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
                    'target-arrow-shape': 'triangle',
                    'target-arrow-color': 'data(color)',
                    'label': 'data(label)',
                    'color': 'black'
                }
            }, {
                selector: '.selected',
                style: {
                    'border-width': '5px',
                    'border-color': 'black'
                }
            }]
        });

        if (style) {
            this.nodeColor = style.nodeColor;
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
        this._edgeColor = value;
    }

    //endregion

    get nodes() {
        return this.cy.json().elements.nodes;
    }

    get edges() {
        return this.cy.json().elements.edges;
    }

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
        return node.data;
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
        return edge.data;
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
            grabbable: false
        });

        return node;
    }

    /**
     * Insert an edge in the graph
     * 
     * @param {Node} source The source node
     * @param {Node} target The target node
     * @param {string} color 
     * @returns Edge created
     * @memberof Graph
     */
    addEdge(source, target, color) {
        color = color || this.edgeColor;

        var edge = new Edge(this.nextEdgeId, source, target);
        edge.color = color;

        this.cy.add({
            group: 'edges',
            data: edge.data,
        });

        return edge
    }
    //endregion
}