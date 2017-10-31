export class Node {
    _id: number;
    x: number;
    y: number;
    private _label: string = '';
    color: string = 'red';

    constructor(id: number, x: number, y: number) {
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

    set label(value: string) {
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