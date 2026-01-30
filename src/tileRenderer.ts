const tileWidth: number = 32; // width in pixels 
const tileHeight: number = 16; // height in pixels 
var t: number; 

class Map {
    size: number[]; 
    tiles: Array<Tile> = [];
    constructor(width: i32, height: i32) {
        this.size = [width, height];
        var start = [10,21];
        // draws the grid
        for (var y: number = 0; y < height; y++)
            for (var x: number = 0; x < width; x++) {
                this.tiles.push(new Tile(
                    (start[0] + (x - y)) * tileWidth,
                    (start[1] + (x + y)) * -tileHeight));
            }
    }

    renderAll(): Array<number> {
        const tileCount = this.tiles.length;
        const out = new Array<Array<number>>();
        for (let i = 0; i < tileCount; i++) {
            let copy = this.tiles[i].render(); 
            copy[1] += (Math.sin(i + t) * 10); 
            out.push(copy);
        }
        return out.flat();
    }
}

class Tile {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    render(): Array<number> {
        return [this.x, this.y];
    }
}

export function DrawMap(time: number): Array<number> {
    t = time; 
    return map.renderAll();
}

const map = new Map(10, 10);