class GraphCreatorNode {

    constructor(id, x, y) {
        if (id.indexOf && id.indexOf('n') !== -1) {
            id = id.substring(1);
        }

        this._id = id;
        this.x = x;
        this.y = y;
    }

    get fullId() {
        return `n${this.id}`;
    }

    get id() {
        return this._id;
    }

    get label() {
        return this._label;
    }

    set label(value) {
        this._label = value || `Node ${this.id}`;
    }

    get color() {
        return this._color || 'blue';
    }

    set color(value) {
        this._color = value;
    }

    get data() {
        return {
            id: this.fullId,
            x: this.x,
            y: this.y,
            label: this.label,
            color: this.color,
        };
    }

    get position() {
        return {
            x: this.x,
            y: this.y
        };
    }

}