/**
 * Creates an image element for a mahjong tile
 * @param {string} tileString The tile identifier string
 * @returns {HTMLImageElement} The created image element
 */
export function createTileImage(tileString) {
    const img = document.createElement('img');
    img.src = `tiles/${tileString}.png`;
    img.alt = tileString;
    img.className = 'tile';
    return img;
}

/**
 * Creates an array of dice dot elements based on the number
 * @param {number} number The number to display (1-6)
 * @returns {HTMLDivElement[]} Array of div elements representing dice dots
 */
export function createDiceDots(number) {
    const dotPositions = {
        1: [4],
        2: [0, 8],
        3: [0, 4, 8],
        4: [0, 2, 6, 8],
        5: [0, 2, 4, 6, 8],
        6: [0, 2, 3, 5, 6, 8]
    };
    
    const dots = [];
    for (let i = 0; i < 9; i++) {
        const dot = document.createElement('div');
        dot.className = dotPositions[number]?.includes(i) ? 'dice-dot' : 'dice-dot empty';
        dots.push(dot);
    }
    return dots;
} 