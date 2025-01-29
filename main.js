import { generateWinningHand, organizeHand, generateTableSituation } from './mahjong-hand-generator.js';
import { checkAllFans, checkNonDealerAllFans } from './fan-calculator.js';
import { displayOrganizedHand, updateDebugInfo } from './hand-display.js';
import { displayTableSituation } from './table-display.js';
import { initializeModal } from './modal.js';
import { initializeQuizMode, updateCurrentRefs, isInQuizMode } from './quiz-mode.js';

let currentHand = null;
let currentFans = null;
let gameStarted = false;

/**
 * Starts the game and generates the first hand
 */
function startGame() {
    if (gameStarted) return;
    
    gameStarted = true;
    document.querySelector('.game-container').style.display = 'block';
    
    // Show appropriate display based on mode
    const fanDisplay = document.querySelector('.fan-display');
    const quizMode = document.querySelector('.quiz-mode');
    
    if (isInQuizMode()) {
        fanDisplay.style.display = 'none';
        quizMode.style.display = 'block';
    } else {
        fanDisplay.style.display = 'block';
        quizMode.style.display = 'none';
    }
    
    document.getElementById('startBtn').disabled = true;
    
    generateHand();
}

/**
 * Generates a new hand and updates the display
 * @returns {Object} The generated hand and its fans
 */
function generateHand() {
    if (!gameStarted) return;

    const tableSituation = generateTableSituation();
    const winningHand = generateWinningHand();
    currentHand = organizeHand(winningHand);
    
    displayTableSituation(tableSituation);
    displayOrganizedHand(currentHand);
    
    currentFans = checkAllFans(currentHand, tableSituation);
    displayFans(currentFans, tableSituation, currentHand);
    
    // Update quiz mode references
    updateCurrentRefs(currentHand, currentFans);

    return {
        hand: currentHand,
        fans: currentFans,
        tableSituation: tableSituation
    };
}

/**
 * Displays fans for the current hand
 * @param {Array} fans Array of achieved fans
 * @param {Object} tableSituation Current table situation
 * @param {Object} hand Current hand
 */
function displayFans(fans, tableSituation, hand) {
    const fanListDiv = document.getElementById('fanList');
    const totalFanDiv = document.getElementById('totalFan');
    const selfDrawFansDiv = document.getElementById('selfDrawFans');
    
    // Clear all displays
    fanListDiv.innerHTML = '';
    totalFanDiv.innerHTML = '';
    selfDrawFansDiv.style.display = 'none';
    
    // Check if this is a self-draw case where we need to show different fans
    const isSelfDraw = hand.win_type === 'self_draw' || hand.win_type === 'kong_draw';
    const isNotDealer = tableSituation.dealer !== 'me';
    
    if (isSelfDraw && isNotDealer) {
        // Show both dealer and non-dealer fans
        selfDrawFansDiv.style.display = 'block';
        fanListDiv.style.display = 'none';
        totalFanDiv.style.display = 'none';
        
        // Calculate and display dealer fans
        const dealerFans = checkAllFans(hand, tableSituation);
        const dealerFanListDiv = document.getElementById('dealerFanList');
        const dealerTotalFanDiv = document.getElementById('dealerTotalFan');
        let dealerTotalFan = 0;
        
        dealerFanListDiv.innerHTML = '';
        dealerFans.forEach(fan => {
            if (fan.achieved) {
                const fanDiv = document.createElement('div');
                fanDiv.className = 'fan-item';
                fanDiv.innerHTML = `
                    <span class="fan-name">${fan.name}</span>
                    <span class="fan-value">${fan.fan}台</span>
                `;
                dealerFanListDiv.appendChild(fanDiv);
                dealerTotalFan += fan.fan;
            }
        });
        
        dealerTotalFanDiv.className = 'total-fan';
        dealerTotalFanDiv.innerHTML = `
            <span>總台數：</span>
            <span class="total-fan-value">${dealerTotalFan}台</span>
        `;
        
        // Calculate and display non-dealer fans
        const nonDealerFans = checkNonDealerAllFans(hand, tableSituation);
        const nonDealerFanListDiv = document.getElementById('nonDealerFanList');
        const nonDealerTotalFanDiv = document.getElementById('nonDealerTotalFan');
        let nonDealerTotalFan = 0;
        
        nonDealerFanListDiv.innerHTML = '';
        nonDealerFans.forEach(fan => {
            if (fan.achieved) {
                const fanDiv = document.createElement('div');
                fanDiv.className = 'fan-item';
                fanDiv.innerHTML = `
                    <span class="fan-name">${fan.name}</span>
                    <span class="fan-value">${fan.fan}台</span>
                `;
                nonDealerFanListDiv.appendChild(fanDiv);
                nonDealerTotalFan += fan.fan;
            }
        });
        
        nonDealerTotalFanDiv.className = 'total-fan';
        nonDealerTotalFanDiv.innerHTML = `
            <span>總台數：</span>
            <span class="total-fan-value">${nonDealerTotalFan}台</span>
        `;
    } else {
        // Regular display for non-self-draw or dealer self-draw cases
        fanListDiv.style.display = 'block';
        totalFanDiv.style.display = 'block';
        let totalFan = 0;
        
        fans.forEach(fan => {
            if (fan.achieved) {
                const fanDiv = document.createElement('div');
                fanDiv.className = 'fan-item';
                fanDiv.innerHTML = `
                    <span class="fan-name">${fan.name}</span>
                    <span class="fan-value">${fan.fan}台</span>
                `;
                fanListDiv.appendChild(fanDiv);
                totalFan += fan.fan;
            }
        });
        
        totalFanDiv.className = 'total-fan';
        totalFanDiv.innerHTML = `
            <span>總台數：</span>
            <span class="total-fan-value">${totalFan}台</span>
        `;
    }
}

// Make functions available globally for HTML onclick handlers
window.generateHand = generateHand;
window.startGame = startGame;

// Initialize
initializeModal(generateHand);
initializeQuizMode(generateHand);

// Hide game container and fan display initially
document.querySelector('.game-container').style.display = 'none';
document.querySelector('.fan-display').style.display = 'none';