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

    get nodeLabelColor() {
        return 'black';
    }

    set nodeColor(value) {
        if (!value) {
            return;
        }
        this._nodeColor = value;
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

    //region Graph insertion
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
    }

    //endregion
}