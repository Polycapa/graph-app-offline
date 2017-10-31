class Node {

    constructor(id, x, y) {
        this._id = id;
        this.x = x;
        this.y = y;
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

    get data() {
        return {
            id: `n${this.id}`,
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