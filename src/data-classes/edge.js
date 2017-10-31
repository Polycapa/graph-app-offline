class Edge {
    constructor(id, source, target) {
        this._id = id;
        this.source = source;
        this.target = target;
    }

    get fullId() {
        return `e${this.id}`;
    }

    get id() {
        return this._id;
    }

    get color() {
        return this._color || 'blue';
    }

    set color(value) {
        this._color = value;
    }

    get data() {
        return {
            id: `e${this.id}`,
            source: this.source.fullId,
            target: this.target.fullId,
            color: this.color
        };
    }
}