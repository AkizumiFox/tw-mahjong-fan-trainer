import { createDiceDots } from './tile-display.js';
import { updateDebugInfo } from './hand-display.js';

/**
 * Checks if an array of tiles forms a kong (four identical tiles)
 * @param {Array} tiles Array of tile objects to check
 * @returns {boolean} True if the tiles form a kong, false otherwise
 */
export function isKong(tiles) {
    // Check if we have exactly 4 tiles
    if (!tiles || tiles.length !== 4) return false;
    
    // Get the first tile's type and number
    const firstTile = tiles[0];
    if (!firstTile || !firstTile.type || !firstTile.number) return false;
    
    // Check if all tiles are identical
    return tiles.every(tile => 
        tile.type === firstTile.type && 
        tile.number === firstTile.number
    );
}

/**
 * Displays the table situation on the webpage
 * @param {Object} situation The table situation data to display
 */
export function displayTableSituation(situation) {
    const tableInfo = document.getElementById('tableInfo');
    const positions = ['opp', 'next', 'prev', 'me'];
    const windText = {
        'east': '東',
        'south': '南',
        'west': '西',
        'north': '北'
    };
    
    // Remove existing prevailing wind display if it exists
    const existingPrevailingWind = document.querySelector('.prevailing-wind');
    if (existingPrevailingWind) {
        existingPrevailingWind.remove();
    }
    
    // Add prevailing wind display
    const prevailingWindDiv = document.createElement('div');
    prevailingWindDiv.className = 'prevailing-wind';
    prevailingWindDiv.textContent = `${windText[situation.prevailingWind]}風場`;
    document.querySelector('.game-container').appendChild(prevailingWindDiv);
    
    tableInfo.innerHTML = positions.map(pos => {
        const positionText = {
            'opp': '對家',
            'next': '下家',
            'prev': '上家',
            'me': '自家'
        }[pos];
        
        return `
        <div class="table-position position-${pos}">
            <div class="position-indicators">
                ${positionText}
                ${situation.flowerPlacement === pos ? '<div class="flower-indicator">門</div>' : ''}
            </div>
            ${situation.dealer === pos ? `
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div class="dealer-indicator">莊</div>
                    ${situation.dealerStreak > 0 ? `
                        <div class="dice-display">
                            ${Array(9).fill('<div class="dice-dot empty"></div>').join('')}
                        </div>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `}).join('');
    
    // Update dice dots if there's a streak
    if (situation.dealerStreak > 0) {
        const diceDisplay = tableInfo.querySelector('.dice-display');
        if (diceDisplay) {
            diceDisplay.innerHTML = '';
            createDiceDots(situation.dealerStreak).forEach(dot => diceDisplay.appendChild(dot));
        }
    }

    updateDebugInfo({ tableSituation: situation });
} 