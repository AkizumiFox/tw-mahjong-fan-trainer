import { checkAllFans, checkNonDealerAllFans } from './fan-calculator.js';

let isQuizMode = true;
let correctCount = 0;
let incorrectCount = 0;
let currentHandRef = null;
let currentFansRef = null;

/**
 * Returns whether quiz mode is active
 * @returns {boolean} True if in quiz mode, false otherwise
 */
export function isInQuizMode() {
    return isQuizMode;
}

/**
 * Updates input visibility based on hand type
 * @param {Object} hand The current hand
 * @param {Object} tableSituation The current table situation
 */
function updateInputVisibility(hand, tableSituation) {
    const singleFanInput = document.getElementById('singleFanInput');
    const dualFanInput = document.getElementById('dualFanInput');
    
    const isSelfDraw = hand.win_type === 'self_draw' || hand.win_type === 'kong_draw';
    const isNotDealer = tableSituation.dealer !== 'me';
    
    if (isSelfDraw && isNotDealer) {
        singleFanInput.style.display = 'none';
        dualFanInput.style.display = 'flex';
        // Clear single input
        document.getElementById('fanGuess').value = '';
    } else {
        singleFanInput.style.display = 'flex';
        dualFanInput.style.display = 'none';
        // Clear dual inputs
        document.getElementById('fanGuessDealer').value = '';
        document.getElementById('fanGuessNonDealer').value = '';
    }
}

/**
 * Updates the current hand and fans references
 * @param {Object} hand Current hand
 * @param {Array} fans Current achieved fans
 */
export function updateCurrentRefs(hand, fans) {
    currentHandRef = hand;
    currentFansRef = fans;
    
    // Get the table situation from debug info
    const debugOutput = document.getElementById('debugOutput');
    const debugInfo = JSON.parse(debugOutput.textContent);
    
    // Update input visibility when hand changes
    updateInputVisibility(hand, debugInfo.tableSituation);
}

/**
 * Toggles between quiz mode and answer display mode
 */
export function toggleQuizMode() {
    isQuizMode = !isQuizMode;
    const fanDisplay = document.querySelector('.fan-display');
    const quizMode = document.querySelector('.quiz-mode');
    const toggleBtn = document.querySelector('.toggle-quiz-btn');
    
    if (isQuizMode) {
        fanDisplay.style.display = 'none';
        quizMode.style.display = 'block';
        toggleBtn.textContent = '測驗模式';
        // Reset quiz state
        document.getElementById('fanGuess').value = '';
        document.getElementById('quizAnswer').classList.remove('revealed');
        document.getElementById('nextQuestionBtn').style.display = 'none';
        document.getElementById('quizFeedback').style.display = 'none';
        document.getElementById('submitGuess').disabled = false;
    } else {
        fanDisplay.style.display = 'block';
        quizMode.style.display = 'none';
        toggleBtn.textContent = '顯示答案模式';
    }
}

/**
 * Displays fans in quiz mode
 * @param {Array} fans Array of achieved fans
 * @param {Object} tableSituation Current table situation
 * @param {Object} hand Current hand
 */
export function displayQuizFans(fans, tableSituation, hand) {
    const fanListDiv = document.getElementById('quizFanList');
    const totalFanDiv = document.getElementById('quizTotalFan');
    let totalFan = 0;
    
    fanListDiv.innerHTML = '';
    
    // Check if this is a self-draw case where we need to show different fans
    const isSelfDraw = hand.win_type === 'self_draw' || hand.win_type === 'kong_draw';
    const isNotDealer = tableSituation.dealer !== 'me';
    
    if (isSelfDraw && isNotDealer) {
        // Calculate both dealer and non-dealer fans
        const dealerFans = checkAllFans(hand, tableSituation);
        const nonDealerFans = checkNonDealerAllFans(hand, tableSituation);
        
        // Use the higher value between dealer and non-dealer fans
        const dealerTotalFan = dealerFans.reduce((sum, fan) => sum + (fan.achieved ? fan.fan : 0), 0);
        const nonDealerTotalFan = nonDealerFans.reduce((sum, fan) => sum + (fan.achieved ? fan.fan : 0), 0);
        
        const displayFans = dealerTotalFan > nonDealerTotalFan ? dealerFans : nonDealerFans;
        totalFan = Math.max(dealerTotalFan, nonDealerTotalFan);
        
        displayFans.forEach(fan => {
            if (fan.achieved) {
                const fanDiv = document.createElement('div');
                fanDiv.className = 'fan-item';
                fanDiv.innerHTML = `
                    <span class="fan-name">${fan.name}</span>
                    <span class="fan-value">${fan.fan}台</span>
                `;
                fanListDiv.appendChild(fanDiv);
            }
        });
    } else {
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
    }
    
    totalFanDiv.className = 'total-fan';
    totalFanDiv.innerHTML = `
        <span>總台數：</span>
        <span class="total-fan-value">${totalFan}台</span>
    `;
}

/**
 * Submits a guess for the current hand's fan count
 */
export function submitGuess() {
    if (!currentHandRef || !currentFansRef) return;

    const debugOutput = document.getElementById('debugOutput');
    const debugInfo = JSON.parse(debugOutput.textContent);
    const isSelfDraw = currentHandRef.win_type === 'self_draw' || currentHandRef.win_type === 'kong_draw';
    const isNotDealer = debugInfo.tableSituation.dealer !== 'me';

    let isCorrect = false;
    if (isSelfDraw && isNotDealer) {
        const dealerGuess = parseInt(document.getElementById('fanGuessDealer').value);
        const nonDealerGuess = parseInt(document.getElementById('fanGuessNonDealer').value);
        
        // Calculate actual fans
        const dealerFans = checkAllFans(currentHandRef, debugInfo.tableSituation);
        const nonDealerFans = checkNonDealerAllFans(currentHandRef, debugInfo.tableSituation);
        
        const actualDealerFan = dealerFans.reduce((sum, fan) => sum + (fan.achieved ? fan.fan : 0), 0);
        const actualNonDealerFan = nonDealerFans.reduce((sum, fan) => sum + (fan.achieved ? fan.fan : 0), 0);
        
        isCorrect = dealerGuess === actualDealerFan && nonDealerGuess === actualNonDealerFan;
    } else {
        const guess = parseInt(document.getElementById('fanGuess').value);
        const totalFan = currentFansRef.reduce((sum, fan) => sum + (fan.achieved ? fan.fan : 0), 0);
        isCorrect = guess === totalFan;
    }

    const feedback = document.getElementById('quizFeedback');
    const quizAnswer = document.getElementById('quizAnswer');
    
    if (isCorrect) {
        feedback.textContent = '正確！';
        feedback.className = 'quiz-feedback correct';
        correctCount++;
    } else {
        feedback.textContent = '錯誤！';
        feedback.className = 'quiz-feedback incorrect';
        incorrectCount++;
    }
    feedback.style.display = 'block';
    
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('incorrectCount').textContent = incorrectCount;
    
    quizAnswer.classList.add('revealed');
    document.getElementById('nextQuestionBtn').style.display = 'block';
    document.getElementById('submitGuess').disabled = true;
    
    displayQuizFans(currentFansRef, debugInfo.tableSituation, currentHandRef);
}

/**
 * Prepares the UI for the next question
 * @param {Function} generateHand Function to generate a new hand
 */
export function nextQuestion(generateHand) {
    // Clear all input fields
    document.getElementById('fanGuess').value = '';
    document.getElementById('fanGuessDealer').value = '';
    document.getElementById('fanGuessNonDealer').value = '';
    
    document.getElementById('quizAnswer').classList.remove('revealed');
    document.getElementById('nextQuestionBtn').style.display = 'none';
    document.getElementById('quizFeedback').style.display = 'none';
    document.getElementById('submitGuess').disabled = false;
    generateHand();
}

/**
 * Skips the current question without affecting the score
 * @param {Function} generateHand Function to generate a new hand
 */
export function skipQuestion() {
    if (!isQuizMode) return;
    
    // Clear all input fields
    document.getElementById('fanGuess').value = '';
    document.getElementById('fanGuessDealer').value = '';
    document.getElementById('fanGuessNonDealer').value = '';
    
    // Reset UI state
    document.getElementById('quizAnswer').classList.remove('revealed');
    document.getElementById('nextQuestionBtn').style.display = 'none';
    document.getElementById('quizFeedback').style.display = 'none';
    document.getElementById('submitGuess').disabled = false;
    
    // Generate new hand
    generateHand();
}

/**
 * Initializes quiz mode event listeners
 * @param {Function} generateHand Function to generate a new hand
 */
export function initializeQuizMode(generateHand) {
    // Make functions available globally for HTML onclick handlers
    window.toggleQuizMode = toggleQuizMode;
    window.submitGuess = submitGuess;
    window.nextQuestion = () => nextQuestion(generateHand);
    window.skipQuestion = () => skipQuestion(generateHand);

    // Add event listeners
    document.getElementById('submitGuess').addEventListener('click', window.submitGuess);
    document.getElementById('nextQuestionBtn').addEventListener('click', window.nextQuestion);
    
    // Add Enter key listeners for all input fields
    const handleEnterKey = (event) => {
        if (event.key === 'Enter') {
            window.submitGuess();
        }
    };
    
    document.getElementById('fanGuess').addEventListener('keypress', handleEnterKey);
    document.getElementById('fanGuessDealer').addEventListener('keypress', handleEnterKey);
    document.getElementById('fanGuessNonDealer').addEventListener('keypress', handleEnterKey);

    // Initialize quiz mode display
    document.querySelector('.fan-display').style.display = 'none';
    document.querySelector('.quiz-mode').style.display = 'block';
    document.querySelector('.toggle-quiz-btn').textContent = '測驗模式';
} 