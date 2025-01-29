import { createTileImage } from './tile-display.js';

/**
 * Displays the organized hand on the webpage
 * @param {Object} organizedHand The organized hand data to display
 */
export function displayOrganizedHand(organizedHand) {
    // Display win type
    const winTypeDisplay = document.getElementById('winTypeDisplay');
    const winTypeText = {
        'self_draw': '自摸',
        'from_next': '下家放槍',
        'from_prev': '上家放槍',
        'from_opp': '對家放槍',
        'robbing_kang_next': '搶下家槓',
        'robbing_kang_prev': '搶上家槓',
        'robbing_kang_opp': '搶對家槓',
        'kong_draw': '槓上開花'
    };
    winTypeDisplay.textContent = winTypeText[organizedHand.win_type];
    
    // Display flowers
    const flowersDisplay = document.getElementById('flowersDisplay');
    flowersDisplay.innerHTML = '';
    organizedHand.strings.flowers.forEach(flower => {
        flowersDisplay.appendChild(createTileImage(flower));
    });
    
    // Display revealed melds
    const revealedDisplay = document.getElementById('revealedDisplay');
    revealedDisplay.innerHTML = '';
    organizedHand.strings.revealed.forEach(meld => {
        const meldContainer = document.createElement('div');
        meldContainer.className = 'meld-container';
        
        // Add kang label if it's a kang
        if (meld.isKang) {
            const label = document.createElement('div');
            label.className = 'kang-label';
            label.textContent = meld.kangType === 'revealed' ? '明槓' : '暗槓';
            meldContainer.appendChild(label);
        }
        
        // Add tiles
        meld.tiles.forEach(tileString => {
            meldContainer.appendChild(createTileImage(tileString));
        });
        
        revealedDisplay.appendChild(meldContainer);
    });
    
    // Display in-hand tiles
    const inHandDisplay = document.getElementById('inHandDisplay');
    inHandDisplay.innerHTML = '';
    organizedHand.strings.inHand.forEach(tileString => {
        inHandDisplay.appendChild(createTileImage(tileString));
    });
    
    // Display winning tile
    const winningTileDisplay = document.getElementById('winningTileDisplay');
    winningTileDisplay.innerHTML = '';
    winningTileDisplay.appendChild(createTileImage(organizedHand.strings.winningTile));

    updateDebugInfo({ hand: organizedHand });
}

/**
 * Updates the debug information display
 * @param {Object} newInfo The new information to add to debug display
 */
export function updateDebugInfo(newInfo) {
    const debugOutput = document.getElementById('debugOutput');
    try {
        const currentDebug = JSON.parse(debugOutput.textContent);
        debugOutput.textContent = JSON.stringify({
            ...currentDebug,
            ...newInfo
        }, null, 2);
    } catch {
        debugOutput.textContent = JSON.stringify(newInfo, null, 2);
    }
} 