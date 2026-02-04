class Page {
    array: Textbox[] = [];
    add(texbox: Textbox): void {
        this.array.push(texbox);
    }
    clear(): void {
        this.array = [];
    }
    popLast(): Textbox {
        return this.array.pop() as Textbox;
    }
    render(): Array<number> {
        const final: Array<Array<number>> = [];
        // takes each textbox and generates their string arrays
        for (var i = 0; i < this.array.length; i++) {
            final.push(this.array[i].render());
        }
        return final.flat();
    }
}
const page: Page = new Page();








var lineStartX: number;
var nextLineY: number;
var charX: number;
var charY: number;
var text: string = "";

class Textbox {
    content: string = "";
    left: number = 0;
    top: number = 0;
    right: number = 0;
    bottom: number = 0;
    action: () => void = () => { };

    resolve(): void {
        // todo: make this handle all the layout events etc, and assign proper values to left, top, right, bottom
    }

    render(): Array<number> {

        let x = this.left;
        let y = this.top;

        const data: Array<Array<number>> = [];
        const pixelSize: number = 6;
        let offset: number = 0;

        for (var i = 0; i < this.content.length; i++) {
            let obj: string = this.content.charAt(i);


            if (!chars.has(obj.toLowerCase()))
                continue;

            let char: Char = chars.get(obj.toLowerCase()) as Char;

            data.push([x + offset, y, char.val, 0] as Array<number>);

            offset += char.kerneling + 1;

        }
        return data.flat();
    }
}


export function textboxAt(x: number, y: number, content: string): void {
    const t: Textbox = new Textbox();
    t.top = y;
    t.left = x;
    t.content = content;

    page.add(t);
}

export function editedTextboxAt(x: number, y: number, minWidth: number, placeholder: string, fontSize: number): void {
    const t: Textbox = new Textbox();
    t.top = y;
    t.left = x;
    t.content = placeholder;
}

export function centerText(x: number): void {
    const t: Textbox = page.popLast();
    // need to make sure width is defined from kerneling before being able to center it. 
    const halfWidth: number = (t.right - t.left) / 2;

    t.left = x - halfWidth;
    t.right = x + halfWidth;

    page.add(t);
}

export function makeHyperlink(action: () => void): void {
    const t: Textbox = page.popLast();
    t.action = action;
    page.add(t);
}

export function trunctateText(content: string): void {
    const t: Textbox = new Textbox();
}

export function delayText(content: string): void {
    const t: Textbox = new Textbox();
}
export function corruptText(content: string): void {
    const t: Textbox = new Textbox();
}


export function ClearPage(): void {
    page.clear();
}

export function DrawPage(): Array<number> {
    return page.render();
}






const randomChars: Map<string, Char> = new Map();
const chars: Map<string, Char> = new Map();

class Char {
    ch: string;   // store single character code
    val: number;
    kerneling: number;
    constructor(ch: string, val: number, kerneling: number) {
        this.ch = ch;
        this.val = val;
        this.kerneling = kerneling;
    }
}

export function InitTextSystem(): void {
    const charArr = [
        new Char(" ", 0, 3),
        new Char("a", 1, 3),
        new Char("b", 2, 4),
        new Char("c", 3, 4),
        new Char("d", 4, 4),
        new Char("e", 5, 4),
        new Char("f", 6, 4),
        new Char("g", 7, 4),
        new Char("h", 8, 4),
        new Char("i", 9, 3),
        new Char("j", 10, 4),
        new Char("k", 11, 3),
        new Char("l", 12, 3),
        new Char("m", 13, 5),
        new Char("n", 14, 4),
        new Char("o", 15, 5),
        new Char("p", 16, 4),
        new Char("q", 17, 5),
        new Char("r", 18, 3),
        new Char("s", 19, 4),
        new Char("t", 20, 3),
        new Char("u", 21, 4),
        new Char("v", 22, 5),
        new Char("w", 23, 5),
        new Char("x", 24, 5),
        new Char("y", 25, 3),
        new Char("z", 26, 4),
        new Char("0", 27, 3),
        new Char("1", 28, 4),
        new Char("2", 29, 4),
        new Char("3", 30, 4),
        new Char("4", 31, 4),
        new Char("5", 32, 4),
        new Char("6", 33, 4),
        new Char("7", 34, 4),
        new Char("8", 35, 4),
        new Char("9", 36, 4),
        new Char(".", 37, 1),
        new Char("%", 38, 4),
        new Char(":", 39, 1),
        new Char("$", 40, 5),
        new Char("(", 41, 2),
        new Char(")", 42, 2),
        new Char("|", 43, 1),
        new Char("[", 44, 3),
        new Char("]", 45, 3),
        new Char("<", 46, 6),
        new Char(">", 47, 6),
        new Char("?", 48, 4),
        new Char("!", 49, 1),
    ];
    var i: i32 = 0;
    // populates the chars map
    for (i = 0; i < charArr.length; i++) {
        const obj: Char = charArr[i];
        chars.set(obj.ch, obj);
    }

    // populates the randomChars map by pulling a random char using splice and adding it. 
    i = 0;
    while (charArr.length > 0) {
        var index: i32 = Math.floor(Math.random() * charArr.length) as i32;
        const obj = charArr.splice(index, 1)[0];
        randomChars.set(obj.ch, new Char(obj.ch, i, obj.kerneling));
        i++;
    }
    //console.assert(chars.size == randomChars.size, `issue with the charArray/randomChars array, ${chars.size} == ${randomChars.size}`);
}


