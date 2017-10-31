import { Node } from './node';

class Graph {

    private cy: any;
    private _nodeColor: string;

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

    get nodes() {
        return this.cy.json().elements.nodes;
    }

    get edges() {
        return this.cy.json().elements.edges;
    }

    get lastId() {
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

    get nextId() {
        return this.lastId !== undefined ? this.lastId + 1 : 0;
    }

    getNodeData(node) {
        return node.data;
    }

    addNode(x, y, label, color) {
        // Set node data
        label = label || '';
        color = color || this.nodeColor;

        var nextId = this.nextId;
        if (!label) {
            label = `Node ${nextId}`
        }
        var nodeId = `n${nextId}`;

        let node = new Node(this.nextId, x, y);
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
}