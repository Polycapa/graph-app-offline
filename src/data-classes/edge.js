class Edge {
    constructor(id, source, target, oriented) {
        if (id.indexOf && id.indexOf('e') !== -1) {
            id = id.substring(1);
        }
        this._id = id;
        this.source = source;
        this.target = target;
        this.oriented = oriented === undefined ? false : true;
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

    get arrow() {
        return this._arrowColor || this.color;
    }

    set arrow(value) {
        this._arrowColor = value;
    }

    get data() {
        return {
            id: `e${this.id}`,
            source: this.source.fullId,
            target: this.target.fullId,
            color: this.color,
            arrowColor: this.arrow
        };
    }
}