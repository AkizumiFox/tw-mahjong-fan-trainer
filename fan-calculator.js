/**
 * @fileoverview Fan calculator for Taiwanese Mahjong
 * Contains functions to check for various scoring patterns (fans)
 */

/**
 * Checks if the dealer gets the dealer fan
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkDealerFan(tableSituation, hand) {
    return {
        achieved: tableSituation.dealer === "me" || (hand.win_type === "self_draw" || hand.win_type === "kong_draw") ||
                  (tableSituation.dealer === "next" && hand.win_type === "from_next")  || 
                  (tableSituation.dealer === "prev" && hand.win_type === "from_prev") || 
                  (tableSituation.dealer === "opp" && hand.win_type === "from_opp"),
        fan: 1,
        name: "莊家"
    };
}

/**
 * Checks if the dealer gets the continuing dealer fan
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkContinuingDealerFan(tableSituation, hand) {
    return {
        achieved: tableSituation.dealerStreak > 0 && (
            tableSituation.dealer === "me" || 
            (tableSituation.dealer === "next" && hand.win_type === "from_next")  || 
            (tableSituation.dealer === "prev" && hand.win_type === "from_prev") || 
            (tableSituation.dealer === "opp" && hand.win_type === "from_opp")
        ),
        fan: tableSituation.dealerStreak,
        name: "連莊"
    };
}

/**
 * Checks if the dealer gets the pull-dealer bonus fan
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkPullDealerFan(tableSituation, hand) {
    return {
        achieved: tableSituation.dealerStreak > 0 && (
            tableSituation.dealer === "me" || 
            (tableSituation.dealer === "next" && hand.win_type === "from_next")  || 
            (tableSituation.dealer === "prev" && hand.win_type === "from_prev") || 
            (tableSituation.dealer === "opp" && hand.win_type === "from_opp")
        ),
        fan: tableSituation.dealerStreak,
        name: "拉莊"
    };
}

/**
 * Checks if the hand is fully concealed
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkFullyConcealedFan(tableSituation, hand) {
    // A hand is fully concealed if all revealed melds are concealed kangs
    const hasNonConcealedMeld = hand.revealed.some(meld => 
        !meld.isKang || (meld.isKang && meld.kangType !== "concealed")
    );
    
    return {
        achieved: !hasNonConcealedMeld,
        fan: 1,
        name: "門清"
    };
}

/**
 * Checks if the hand qualifies for no-melds self-draw fan
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkNoMeldsSelfDrawFan(tableSituation, hand) {
    const hasNonConcealedMeld = hand.revealed.some(meld => 
        !meld.isKang || (meld.isKang && meld.kangType !== "concealed")
    );

    return {
        achieved: !hasNonConcealedMeld && hand.win_type === "self_draw",
        fan: 1,
        name: "不求人"
    };
}

/**
 * Checks if the win was by self-draw
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkSelfDrawFan(tableSituation, hand) {
    return {
        achieved: hand.win_type === "self_draw" || hand.win_type === "kong_draw",
        fan: 1,
        name: "自摸"
    };
}

/**
 * Gets the prevailing wind tile index
 * @param {string} wind The prevailing wind
 * @returns {number} The wind tile index (27-30)
 */
function getPrevailingWindTile(wind) {
    const windMap = {
        "east": 27,
        "south": 28,
        "west": 29,
        "north": 30
    };
    return windMap[wind];
}

/**
 * Gets the tile count for the hand
 * @param {Object} hand The winning hand
 * @returns {Array} The tile count array of 34 numbers.
 */
function getTileCount(hand) {
    // Initialize array of 34 zeros
    const tileCount = new Array(34).fill(0);
    
    // Count tiles in revealed melds
    hand.revealed.forEach(meld => {
        meld.tiles.forEach(tile => {
            tileCount[tile]++;
        });
    });
    
    // Count tiles in hand
    hand.inHand.forEach(tile => {
        tileCount[tile]++;
    });
    
    // Count winning tile
    tileCount[hand.winningTile]++;
    
    return tileCount;
}

/**
 * Checks if the hand has a triplet of the prevailing wind
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
*   achieved: boolean,
*   fan: number,
*   name: string
* }} Fan check result
*/
function checkPrevailingWindFan(tableSituation, hand) {
   const prevailingWindTile = getPrevailingWindTile(tableSituation.prevailingWind);
   const tileCount = getTileCount(hand);
   const hasPrevailingWindTriplet = tileCount[prevailingWindTile] >= 3;
   
   return {
       achieved: hasPrevailingWindTriplet,
       fan: 1,
       name: `場風（${tableSituation.prevailingWind === "east" ? "東" : 
                     tableSituation.prevailingWind === "south" ? "南" :
                     tableSituation.prevailingWind === "west" ? "西" : "北"}風）`
   };
}

/**
 * Checks if the hand has a triplet of the seat wind
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkSeatWindFan(tableSituation, hand) {
    const seatNumber = tableSituation.flowerPlacement === "me" ? 1 : 
                       tableSituation.flowerPlacement === "prev" ? 2 : 
                       tableSituation.flowerPlacement === "opp" ? 3 : 4;

    const checkSeatWindTile = 26 + seatNumber;
    const tileCount = getTileCount(hand);
    const hasSeatWindTriplet = tileCount[checkSeatWindTile] >= 3;

    return {
        achieved: hasSeatWindTriplet,
        fan: 1,
        name: `門風（${seatNumber === 1 ? "東" : 
                      seatNumber === 2 ? "南" :
                      seatNumber === 3 ? "西" : "北"}風）`
    };
}

/**
 * Checks if the player has matching season flower tiles
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkFlowerSeasonFan(tableSituation, hand) {
    // Get player's position (1-4 for East to North)
    const seatNumber = tableSituation.flowerPlacement === "me" ? 1 : 
                       tableSituation.flowerPlacement === "prev" ? 2 : 
                       tableSituation.flowerPlacement === "opp" ? 3 : 4;
    
    // Count matching season flowers (1-4)
    const matchingFlowers = hand.strings.flowers.filter(flower => {
        const flowerNumber = parseInt(flower[0]);
        return flowerNumber === seatNumber;
    }).length;
    
    return {
        achieved: matchingFlowers > 0,
        fan: matchingFlowers,
        name: `花牌（${seatNumber}花）`
    };
}

/**
 * Checks if the player has matching plant flower tiles
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkFlowerPlantFan(tableSituation, hand) {
    // Get player's position (1-4 for East to North)
    const seatNumber = tableSituation.flowerPlacement === "me" ? 1 : 
                       tableSituation.flowerPlacement === "prev" ? 2 : 
                       tableSituation.flowerPlacement === "opp" ? 3 : 4;
    
    // Count matching plant flowers (5-8)
    const matchingFlowers = hand.strings.flowers.filter(flower => {
        const flowerNumber = parseInt(flower[0]);
        return flowerNumber === seatNumber + 4;
    }).length;
    
    return {
        achieved: matchingFlowers > 0,
        fan: matchingFlowers,
        name: `花牌（${seatNumber}花）`
    };
}

/**
 * Checks if the win was by robbing a kong
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkRobbingKongFan(tableSituation, hand) {
    return {
        achieved: hand.win_type === "robbing_kang_prev" ||
                  hand.win_type === "robbing_kang_next" ||
                  hand.win_type === "robbing_kang_opp",
        fan: 1,
        name: "搶槓"
    };
}

/**
 * Checks if the hand has a red dragon triplet (中)
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkRedDragonFan(tableSituation, hand) {
    const tileCount = getTileCount(hand);
    const hasRedDragonTriplet = tileCount[31] >= 3;
    
    return {
        achieved: hasRedDragonTriplet,
        fan: 1,
        name: "三元牌（白板）"
    };
}

/**
 * Checks if the hand has a green dragon triplet (發)
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkGreenDragonFan(tableSituation, hand) {
    const tileCount = getTileCount(hand);
    const hasGreenDragonTriplet = tileCount[32] >= 3;
    
    return {
        achieved: hasGreenDragonTriplet,
        fan: 1,
        name: "三元牌（青發）"
    };
}

/**
 * Checks if the hand has a white dragon triplet (白)
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkWhiteDragonFan(tableSituation, hand) {
    const tileCount = getTileCount(hand);
    console.log(tileCount)
    const hasWhiteDragonTriplet = tileCount[33] >= 3;
    
    return {
        achieved: hasWhiteDragonTriplet,
        fan: 1,
        name: "三元牌（紅中）"
    };
}

/**
 * Check if tiles can form a valid meld (chow, pong)
 * @param {number[]} tiles Array of 3 tile indices
 * @returns {boolean} Whether the tiles form a valid meld
 */
function isValidMeld(tiles) {
    if (tiles.length !== 3) return false;
    
    // Sort tiles
    tiles.sort((a, b) => a - b);
    
    // Check for pong
    if (tiles[0] === tiles[1] && tiles[1] === tiles[2]) {
        return true;
    }
    
    // Check for chow
    // Must be in same suit
    const suit1 = Math.floor(tiles[0] / 9);
    const suit2 = Math.floor(tiles[1] / 9);
    const suit3 = Math.floor(tiles[2] / 9);
    
    if (suit1 === suit2 && suit2 === suit3 && suit1 < 3) { // Only numbered suits can form chows
        // Must be consecutive
        return tiles[0] + 1 === tiles[1] && tiles[1] + 1 === tiles[2];
    }
    
    return false;
}

/**
 * Check if tiles can form a valid pair
 * @param {number[]} tiles Array of 2 tile indices
 * @returns {boolean} Whether the tiles form a valid pair
 */
function isValidPair(tiles) {
    return tiles.length === 2 && tiles[0] === tiles[1];
}

/**
 * Recursive function to check if tiles can be arranged into valid melds
 * @param {number[]} tiles Array of tile indices
 * @param {number} numMelds Number of melds needed
 * @returns {boolean} Whether the tiles can form valid melds
 */
function canFormMelds(tiles, numMelds) {
    if (tiles.length === 2) {
        return numMelds === 0 && isValidPair(tiles);
    }
    
    if (numMelds === 0 || tiles.length < 3) return false;
    
    // Try each possible meld starting from current position
    for (let i = 0; i < tiles.length - 2; i++) {
        for (let j = i + 1; j < tiles.length - 1; j++) {
            for (let k = j + 1; k < tiles.length; k++) {
                const meld = [tiles[i], tiles[j], tiles[k]];
                if (isValidMeld(meld)) {
                    // Remove these tiles and recurse
                    const remaining = [...tiles];
                    remaining.splice(k, 1);
                    remaining.splice(j, 1);
                    remaining.splice(i, 1);
                    if (canFormMelds(remaining, numMelds - 1)) {
                        return true;
                    }
                }
            }
        }
    }
    
    return false;
}

/**
 * Find all possible winning tiles for a hand
 * @param {number[]} inHand Array of tile indices in hand
 * @returns {number[]} Array of possible winning tiles
 */
function getAllWinningTiles(inHand) {
    const winningTiles = [];
    
    // Try each possible tile
    for (let tile = 0; tile < 34; tile++) {
        // Add the tile to the hand
        const testHand = [...inHand, tile];
        
        // Sort for consistency
        testHand.sort((a, b) => a - b);
        
        // Check if this forms a winning hand
        for(let i = 0; i <= 4; i++) {
            if (canFormMelds(testHand, i)) {
                winningTiles.push(tile);
                break;
            }
        }
    }
    
    console.log(winningTiles);
    return winningTiles;
}

/**
 * Checks if the winning wait was a single wait
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkSingleWaitFan(tableSituation, hand) {
    const allWinningTiles = getAllWinningTiles(hand.inHand);
    return {
        achieved: allWinningTiles.length === 1,
        fan: 1,
        name: "獨聽"
    };
}

/**
 * Checks if the hand qualifies for half-qiu
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkHalfQiuFan(tableSituation, hand) {
    // This needs to check if all melds are revealed except for a single tile
    // and if the win was by self-draw
    const isHalfQiu = hand.inHand.length === 1 &&
                     (hand.win_type === "self_draw" || hand.win_type === "kong_draw");
    
    return {
        achieved: isHalfQiu,
        fan: 1,
        name: "半求"
    };
}

/**
 * Checks if the win was by kong-draw
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkKongDrawFan(tableSituation, hand) {
    return {
        achieved: hand.win_type === "kong_draw",
        fan: 1,
        name: "槓上開花"
    };
}

/**
 * Checks if a tile is an honor tile (winds or dragons)
 * @param {number} tile The tile index
 * @returns {boolean} Whether the tile is an honor tile
 */
function isHonorTile(tile) {
    return tile >= 27; // Tiles 27-33 are honors (winds and dragons)
}

/**
 * Checks if a meld is a sequence (chow)
 * @param {number[]} tiles Array of 3 tile indices
 * @returns {boolean} Whether the meld is a sequence
 */
function isSequence(tiles) {
    if (tiles.length !== 3) return false;
    const sorted = [...tiles].sort((a, b) => a - b);
    const suit1 = Math.floor(sorted[0] / 9);
    const suit2 = Math.floor(sorted[1] / 9);
    const suit3 = Math.floor(sorted[2] / 9);
    
    return suit1 === suit2 && suit2 === suit3 && suit1 < 3 && // Same suit, numbered tiles
           sorted[0] + 1 === sorted[1] && sorted[1] + 1 === sorted[2]; // Consecutive
}

/**
 * Recursive function to check if tiles can be arranged into all sequences
 * @param {number[]} tiles Array of tile indices
 * @returns {boolean} Whether all tiles can form sequences (except last 2 for pair)
 */
function canFormAllSequences(tiles) {
    if (tiles.length === 2) {
        return isValidPair(tiles); // Last two tiles should form a pair
    }
    
    if (tiles.length < 3) return false;
    
    // Try each possible sequence starting from current position
    for (let i = 0; i < tiles.length - 2; i++) {
        for (let j = i + 1; j < tiles.length - 1; j++) {
            for (let k = j + 1; k < tiles.length; k++) {
                const meld = [tiles[i], tiles[j], tiles[k]];
                if (isSequence(meld)) { // Only try sequences, not pongs
                    // Remove these tiles and recurse
                    const remaining = [...tiles];
                    remaining.splice(k, 1);
                    remaining.splice(j, 1);
                    remaining.splice(i, 1);
                    if (canFormAllSequences(remaining)) {
                        return true;
                    }
                }
            }
        }
    }
    
    return false;
}

/**
 * Checks if the hand qualifies for the Pinfu pattern
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkPinfuFan(tableSituation, hand) {
    // Must win on discard, not self-draw
    if (hand.win_type === "self_draw" || hand.win_type === "kong_draw") {
        return { achieved: false, fan: 2, name: "平胡" };
    }
    
    // No flowers allowed
    if (hand.strings.flowers.length > 0) {
        return { achieved: false, fan: 2, name: "平胡" };
    }
    
    // Check for honor tiles
    const tileCount = getTileCount(hand);
    for (let i = 27; i < 34; i++) {
        if (tileCount[i] > 0) {
            return { achieved: false, fan: 2, name: "平胡" };
        }
    }
    
    // All revealed melds must be sequences
    const allRevealedSequences = hand.revealed.every(meld => isSequence(meld.tiles));
    if (!allRevealedSequences) {
        return { achieved: false, fan: 2, name: "平胡" };
    }
    
    // Check if in-hand tiles can be arranged into all sequences (except pair)
    const allInHandSequences = canFormAllSequences([...hand.inHand, hand.winningTile]);
    if (!allInHandSequences) {
        return { achieved: false, fan: 2, name: "平胡" };
    }
    
    // Must be two-sided wait
    const winningTiles = getAllWinningTiles(hand.inHand);
    if (winningTiles.length < 2) {
        return { achieved: false, fan: 2, name: "平胡" };
    }
    
    return {
        achieved: true,
        fan: 2,
        name: "平胡"
    };
}

/**
 * Checks if the hand qualifies for Full Qiu pattern
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkFullQiuFan(tableSituation, hand) {
    // Must win on discard, not self-draw
    const isFullQiu = hand.inHand.length === 1 &&
                     !(hand.win_type === "self_draw" || hand.win_type === "kong_draw");
    
    return {
        achieved: isFullQiu,
        fan: 2,
        name: "全求"
    };
}

/**
 * Checks if the hand has a complete season set
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkCompleteSeasonSetFan(tableSituation, hand) {
    const flowers = hand.strings.flowers.map(f => parseInt(f[0]));
    const hasSeasonSet = [1,2,3,4].every(n => flowers.includes(n));
    
    return {
        achieved: hasSeasonSet,
        fan: 2,
        name: "花槓（春夏秋冬）"
    };
}

/**
 * Checks if the hand has a complete plant set
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkCompletePlantSetFan(tableSituation, hand) {
    const flowers = hand.strings.flowers.map(f => parseInt(f[0]));
    const hasPlantSet = [5,6,7,8].every(n => flowers.includes(n));
    
    return {
        achieved: hasPlantSet,
        fan: 2,
        name: "花槓（梅蘭竹菊）"
    };
}

/**
 * Checks if the hand has three concealed pungs
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkThreeConcealedPungsFan(tableSituation, hand) {
    const tileCount = getTileCount(hand);
    let concealedPungCount = 0;
    
    // Count concealed pungs from in-hand tiles
    for (let i = 0; i < 34; i++) {
        // Check if this tile forms a concealed pung
        const inHandCount = hand.inHand.filter(t => t === i).length;
        const isInRevealedMeld = hand.revealed.some(meld => 
            !meld.isKang && meld.tiles.includes(i)
        );
        
        if (inHandCount >= 3 && !isInRevealedMeld) {
            concealedPungCount++;
        }
    }
    
    // Add concealed kongs
    concealedPungCount += hand.revealed.filter(meld => 
        meld.isKang && meld.kangType === "concealed"
    ).length;
    
    return {
        achieved: concealedPungCount == 3,
        fan: 2,
        name: "三暗刻"
    };
}

// TODO: If there are >= 3 concealed pungs, then the hand cannot be a ping hu hand

/**
 * Checks if a meld is a pung (three of a kind)
 * @param {number[]} tiles Array of 3 or 4 tile indices
 * @returns {boolean} Whether the meld is a pung or kong
 */
function isPung(tiles) {
    if (tiles.length < 3) return false;
    return tiles.every(t => t === tiles[0]);
}

/**
 * Checks if the hand is composed entirely of pungs
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkAllPungsFan(tableSituation, hand) {
    // All revealed melds must be pungs/kongs
    const allRevealedPungs = hand.revealed.every(meld => isPung(meld.tiles));
    if (!allRevealedPungs) {
        return { achieved: false, fan: 4, name: "碰碰胡" };
    }
    
    // Check if in-hand tiles can be arranged into all pungs except one pair
    const tileCount = getTileCount(hand);
    let pairFound = false;
    let pungCount = 0;
    
    for (let i = 0; i < 34; i++) {
        if (tileCount[i] >= 3) {
            pungCount++;
            tileCount[i] -= 3;
            i--; // Check same tile again for possible additional pung
        } else if (tileCount[i] === 2 && !pairFound) {
            pairFound = true;
            tileCount[i] = 0;
        }
    }
    
    // All tiles should be used (no leftover tiles)
    const allTilesUsed = tileCount.every(count => count === 0);
    const correctStructure = pairFound && allTilesUsed;
    
    return {
        achieved: correctStructure,
        fan: 4,
        name: "碰碰胡"
    };
}

/**
 * Checks if the hand has Little Three Dragons pattern
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkLittleThreeDragonsFan(tableSituation, hand) {
    const tileCount = getTileCount(hand);
    let dragonPungs = 0;
    let dragonPair = false;
    
    // Check each dragon (31: Red, 32: Green, 33: White)
    for (let i = 31; i <= 33; i++) {
        if (tileCount[i] >= 3) {
            dragonPungs++;
        } else if (tileCount[i] === 2) {
            dragonPair = true;
        }
    }
    
    return {
        achieved: dragonPungs === 2 && dragonPair,
        fan: 4,
        name: "小三元"
    };
}

// TODO: LittleThreeDragons cannot count dragons fans in the hand

/**
 * Gets the suit of a tile (0: characters, 1: dots, 2: bamboo, 3: honors)
 * @param {number} tile The tile index
 * @returns {number} The suit index
 */
function getTileSuit(tile) {
    if (tile >= 27) return 3; // honors
    return Math.floor(tile / 9);
}

/**
 * Checks if the hand is a Half Flush
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkHalfFlushFan(tableSituation, hand) {
    const tileCount = getTileCount(hand);
    let suitCounts = [0, 0, 0, 0]; // characters, dots, bamboo, honors
    
    // Count tiles in each suit
    for (let i = 0; i < 34; i++) {
        if (tileCount[i] > 0) {
            suitCounts[getTileSuit(i)] += tileCount[i];
        }
    }
    
    // Must have some honor tiles
    if (suitCounts[3] === 0) {
        return { achieved: false, fan: 4, name: "混一色" };
    }
    
    // Must have exactly one numbered suit
    const numberedSuits = suitCounts.slice(0, 3).filter(count => count > 0).length;
    const hasOneNumberedSuit = numberedSuits === 1;
    
    const suitName = suitCounts[0] > 0 ? "萬子" : 
                    suitCounts[1] > 0 ? "筒子" : 
                    suitCounts[2] > 0 ? "索子" : "";
    
    return {
        achieved: hasOneNumberedSuit,
        fan: 4,
        name: `混一色（${suitName}）`
    };
}

/**
 * Checks if the hand has four concealed pungs
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkFourConcealedPungsFan(tableSituation, hand) {
    const tileCount = getTileCount(hand);
    let concealedPungCount = 0;
    
    // Count concealed pungs from in-hand tiles
    for (let i = 0; i < 34; i++) {
        // Check if this tile forms a concealed pung
        const inHandCount = hand.inHand.filter(t => t === i).length;
        const isInRevealedMeld = hand.revealed.some(meld => 
            !meld.isKang && meld.tiles.includes(i)
        );
        
        if (inHandCount >= 3 && !isInRevealedMeld) {
            concealedPungCount++;
        }
    }
    
    // Add concealed kongs
    concealedPungCount += hand.revealed.filter(meld => 
        meld.isKang && meld.kangType === "concealed"
    ).length;
    
    return {
        achieved: concealedPungCount === 4,
        fan: 5,
        name: "四暗刻"
    };
}

/**
 * Checks if the hand has five concealed pungs
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkFiveConcealedPungsFan(tableSituation, hand) {
    const tileCount = getTileCount(hand);
    let concealedPungCount = 0;
    
    // Count concealed pungs from in-hand tiles
    for (let i = 0; i < 34; i++) {
        // Check if this tile forms a concealed pung
        const inHandCount = hand.inHand.filter(t => t === i).length;
        const isInRevealedMeld = hand.revealed.some(meld => 
            !meld.isKang && meld.tiles.includes(i)
        );
        
        if (inHandCount >= 3 && !isInRevealedMeld) {
            concealedPungCount++;
        }
    }
    
    // Add concealed kongs
    concealedPungCount += hand.revealed.filter(meld => 
        meld.isKang && meld.kangType === "concealed"
    ).length;
    
    return {
        achieved: concealedPungCount === 5,
        fan: 8,
        name: "五暗刻"
    };
}

/**
 * Checks if the hand has Big Three Dragons pattern
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkBigThreeDragonsFan(tableSituation, hand) {
    const tileCount = getTileCount(hand);
    let dragonPungs = 0;
    
    // Check each dragon (31: Red, 32: Green, 33: White)
    for (let i = 31; i <= 33; i++) {
        if (tileCount[i] >= 3) {
            dragonPungs++;
        }
    }
    
    return {
        achieved: dragonPungs === 3,
        fan: 8,
        name: "大三元"
    };
}

/**
 * Checks if the hand has Little Four Winds pattern
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkLittleFourWindsFan(tableSituation, hand) {
    const tileCount = getTileCount(hand);
    let windPungs = 0;
    let windPair = false;
    
    // Check each wind (27: East, 28: South, 29: West, 30: North)
    for (let i = 27; i <= 30; i++) {
        if (tileCount[i] >= 3) {
            windPungs++;
        } else if (tileCount[i] === 2) {
            windPair = true;
        }
    }
    
    return {
        achieved: windPungs === 3 && windPair,
        fan: 8,
        name: "小四喜"
    };
}

/**
 * Checks if the hand is a Full Flush
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkFullFlushFan(tableSituation, hand) {
    const tileCount = getTileCount(hand);
    let suitCounts = [0, 0, 0, 0]; // characters, dots, bamboo, honors
    
    // Count tiles in each suit
    for (let i = 0; i < 34; i++) {
        if (tileCount[i] > 0) {
            suitCounts[getTileSuit(i)] += tileCount[i];
        }
    }
    
    // Must have no honor tiles
    if (suitCounts[3] > 0) {
        return { achieved: false, fan: 8, name: "清一色" };
    }
    
    // Must have exactly one numbered suit
    const numberedSuits = suitCounts.slice(0, 3).filter(count => count > 0).length;
    const hasOneNumberedSuit = numberedSuits === 1;
    
    const suitName = suitCounts[0] > 0 ? "萬子" : 
                    suitCounts[1] > 0 ? "筒子" : 
                    suitCounts[2] > 0 ? "索子" : "";
    
    return {
        achieved: hasOneNumberedSuit,
        fan: 8,
        name: `清一色（${suitName}）`
    };
}

/**
 * Checks if the hand is All Honors
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkAllHonorsFan(tableSituation, hand) {
    const tileCount = getTileCount(hand);
    
    // Check if any non-honor tiles are present
    for (let i = 0; i < 27; i++) {
        if (tileCount[i] > 0) {
            return { achieved: false, fan: 8, name: "字一色" };
        }
    }
    
    // Must have some tiles
    const hasHonors = tileCount.slice(27).some(count => count > 0);
    
    return {
        achieved: hasHonors,
        fan: 8,
        name: "字一色"
    };
}

/**
 * Checks if the hand has all eight flower tiles
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string
 * }} Fan check result
 */
function checkEightFlowersFan(tableSituation, hand) {
    const flowers = hand.strings.flowers.map(f => parseInt(f[0]));
    const hasAllFlowers = [1,2,3,4,5,6,7,8].every(n => flowers.includes(n));
    
    return {
        achieved: hasAllFlowers,
        fan: 8,
        name: "八仙過海"
    };
}

// TODO: If there is EightFlowersFan, then we randomize the hand.

/**
 * Checks if the hand has Big Four Winds pattern
 * @param {Object} tableSituation The current table situation
 * @param {Object} hand The winning hand
 * @returns {{
 *   achieved: boolean,
 *   fan: number,
 *   name: string,
 *   excludes: string[] // List of fan names that should be excluded if this pattern is achieved
 * }} Fan check result
 */
function checkBigFourWindsFan(tableSituation, hand) {
    const tileCount = getTileCount(hand);
    let windPungs = 0;
    
    // Check each wind (27: East, 28: South, 29: West, 30: North)
    for (let i = 27; i <= 30; i++) {
        if (tileCount[i] >= 3) {
            windPungs++;
        }
    }
    
    return {
        achieved: windPungs === 4,
        fan: 16,
        name: "大四喜",
        excludes: ["風牌", "場風"] // Excludes seat wind and prevailing wind fans
    };
}

// Create a map of fan check functions
const fanCheckMap = {
    checkDealerFan,
    checkContinuingDealerFan,
    checkPullDealerFan,
    checkFullyConcealedFan,
    checkNoMeldsSelfDrawFan,
    checkSelfDrawFan,
    checkSeatWindFan,
    checkPrevailingWindFan,
    checkFlowerSeasonFan,
    checkFlowerPlantFan,
    checkRobbingKongFan,
    checkRedDragonFan,
    checkGreenDragonFan,
    checkWhiteDragonFan,
    checkSingleWaitFan,
    checkHalfQiuFan,
    checkKongDrawFan,
    checkPinfuFan,
    checkFullQiuFan,
    checkCompleteSeasonSetFan,
    checkCompletePlantSetFan,
    checkThreeConcealedPungsFan,
    checkAllPungsFan,
    checkLittleThreeDragonsFan,
    checkHalfFlushFan,
    checkFourConcealedPungsFan,
    checkFiveConcealedPungsFan,
    checkBigThreeDragonsFan,
    checkLittleFourWindsFan,
    checkFullFlushFan,
    checkAllHonorsFan,
    checkBigFourWindsFan
};

function checkAllFans(hand, tableSituation) {
    // Define the order of fan checks
    const fanOrder = [
        'checkDealerFan',
        'checkContinuingDealerFan',
        'checkPullDealerFan',
        'checkFullyConcealedFan',
        'checkNoMeldsSelfDrawFan',
        'checkSelfDrawFan',
        'checkSeatWindFan',
        'checkPrevailingWindFan',
        'checkFlowerSeasonFan',
        'checkFlowerPlantFan',
        'checkRobbingKongFan',
        'checkRedDragonFan',
        'checkGreenDragonFan',
        'checkWhiteDragonFan',
        'checkSingleWaitFan',
        'checkHalfQiuFan',
        'checkKongDrawFan',
        'checkPinfuFan',
        'checkFullQiuFan',
        'checkCompleteSeasonSetFan',
        'checkCompletePlantSetFan',
        'checkThreeConcealedPungsFan',
        'checkAllPungsFan',
        'checkLittleThreeDragonsFan',
        'checkHalfFlushFan',
        'checkFourConcealedPungsFan',
        'checkFiveConcealedPungsFan',
        'checkBigThreeDragonsFan',
        'checkLittleFourWindsFan',
        'checkFullFlushFan',
        'checkAllHonorsFan',
        'checkBigFourWindsFan'
    ];

    // Keep track of excluded fans
    const excludedFans = new Set();
    
    // First pass: check for special conditions and fans that might exclude others
    let hasThreeConcealedPungs = false;
    let hasLittleThreeDragons = false;
    let hasBigThreeDragons = false;
    let hasLittleFourWinds = false;
    let hasBigFourWinds = false;
    let hasCompleteSeasonSet = false;
    let hasCompletePlantSet = false;

    for (const checkName of fanOrder) {
        const checkFn = fanCheckMap[checkName];
        if (checkFn) {
            const result = checkFn(tableSituation, hand);
            if (result.achieved) {
                // Check for special conditions
                if (checkName === 'checkThreeConcealedPungsFan') {
                    hasThreeConcealedPungs = true;
                    // If has three concealed pungs, exclude ping hu
                    excludedFans.add('平胡');
                }
                else if (checkName === 'checkLittleThreeDragonsFan') {
                    hasLittleThreeDragons = true;
                    // Exclude individual dragon fans
                    excludedFans.add('三元牌（紅中）');
                    excludedFans.add('三元牌（青發）');
                    excludedFans.add('三元牌（白板）');
                }
                else if (checkName === 'checkBigThreeDragonsFan') {
                    hasBigThreeDragons = true;
                    // Exclude individual dragon fans
                    excludedFans.add('三元牌（紅中）');
                    excludedFans.add('三元牌（青發）');
                    excludedFans.add('三元牌（白板）');
                }
                else if (checkName === 'checkLittleFourWindsFan') {
                    hasLittleFourWinds = true;
                    // Exclude wind fans
                    excludedFans.add('風牌');
                    excludedFans.add('場風');
                }
                else if (checkName === 'checkBigFourWindsFan') {
                    hasBigFourWinds = true;
                    // Exclude wind fans
                    excludedFans.add('風牌');
                    excludedFans.add('場風');
                }
                else if (checkName === 'checkCompleteSeasonSetFan') {
                    hasCompleteSeasonSet = true;
                    // If has complete season set, exclude individual season flower fans
                    const seatNumber = tableSituation.flowerPlacement === "me" ? 1 : 
                                    tableSituation.flowerPlacement === "prev" ? 2 : 
                                    tableSituation.flowerPlacement === "opp" ? 3 : 4;
                    excludedFans.add(`花牌（${seatNumber}季）`);
                }
                else if (checkName === 'checkCompletePlantSetFan') {
                    hasCompletePlantSet = true;
                    // If has complete plant set, exclude individual plant flower fans
                    const seatNumber = tableSituation.flowerPlacement === "me" ? 1 : 
                                    tableSituation.flowerPlacement === "prev" ? 2 : 
                                    tableSituation.flowerPlacement === "opp" ? 3 : 4;
                    excludedFans.add(`花牌（${seatNumber}花）`);
                }

                // Add any explicit exclusions from the fan result
                if (result.excludes) {
                    result.excludes.forEach(fan => excludedFans.add(fan));
                }
            }
        }
    }
    
    // Second pass: collect all achieved fans that aren't excluded
    const achievedFans = [];
    for (const checkName of fanOrder) {
        const checkFn = fanCheckMap[checkName];
        if (checkFn) {
            const result = checkFn(tableSituation, hand);
            if (result.achieved && !excludedFans.has(result.name)) {
                achievedFans.push(result);
            }
        }
    }
    
    return achievedFans;
}

const nonDealerFanCheckMap = {
    checkFullyConcealedFan,
    checkNoMeldsSelfDrawFan,
    checkSelfDrawFan,
    checkSeatWindFan,
    checkPrevailingWindFan,
    checkFlowerSeasonFan,
    checkFlowerPlantFan,
    checkRobbingKongFan,
    checkRedDragonFan,
    checkGreenDragonFan,
    checkWhiteDragonFan,
    checkSingleWaitFan,
    checkHalfQiuFan,
    checkKongDrawFan,
    checkPinfuFan,
    checkFullQiuFan,
    checkCompleteSeasonSetFan,
    checkCompletePlantSetFan,
    checkThreeConcealedPungsFan,
    checkAllPungsFan,
    checkLittleThreeDragonsFan,
    checkHalfFlushFan,
    checkFourConcealedPungsFan,
    checkFiveConcealedPungsFan,
    checkBigThreeDragonsFan,
    checkLittleFourWindsFan,
    checkFullFlushFan,
    checkAllHonorsFan,
    checkBigFourWindsFan
};

function checkNonDealerAllFans(hand, tableSituation) {
    // Define the order of fan checks
    const fanOrder = [
        'checkDealerFan',
        'checkContinuingDealerFan',
        'checkPullDealerFan',
        'checkFullyConcealedFan',
        'checkNoMeldsSelfDrawFan',
        'checkSelfDrawFan',
        'checkSeatWindFan',
        'checkPrevailingWindFan',
        'checkFlowerSeasonFan',
        'checkFlowerPlantFan',
        'checkRobbingKongFan',
        'checkRedDragonFan',
        'checkGreenDragonFan',
        'checkWhiteDragonFan',
        'checkSingleWaitFan',
        'checkHalfQiuFan',
        'checkKongDrawFan',
        'checkPinfuFan',
        'checkFullQiuFan',
        'checkCompleteSeasonSetFan',
        'checkCompletePlantSetFan',
        'checkThreeConcealedPungsFan',
        'checkAllPungsFan',
        'checkLittleThreeDragonsFan',
        'checkHalfFlushFan',
        'checkFourConcealedPungsFan',
        'checkFiveConcealedPungsFan',
        'checkBigThreeDragonsFan',
        'checkLittleFourWindsFan',
        'checkFullFlushFan',
        'checkAllHonorsFan',
        'checkBigFourWindsFan'
    ];

    // Keep track of excluded fans
    const excludedFans = new Set();
    
    // First pass: check for special conditions and fans that might exclude others
    let hasThreeConcealedPungs = false;
    let hasLittleThreeDragons = false;
    let hasBigThreeDragons = false;
    let hasLittleFourWinds = false;
    let hasBigFourWinds = false;
    let hasCompleteSeasonSet = false;
    let hasCompletePlantSet = false;

    for (const checkName of fanOrder) {
        const checkFn = nonDealerFanCheckMap[checkName];
        if (checkFn) {
            const result = checkFn(tableSituation, hand);
            if (result.achieved) {
                // Check for special conditions
                if (checkName === 'checkThreeConcealedPungsFan') {
                    hasThreeConcealedPungs = true;
                    // If has three concealed pungs, exclude ping hu
                    excludedFans.add('平胡');
                }
                else if (checkName === 'checkLittleThreeDragonsFan') {
                    hasLittleThreeDragons = true;
                    // Exclude individual dragon fans
                    excludedFans.add('三元牌（紅中）');
                    excludedFans.add('三元牌（青發）');
                    excludedFans.add('三元牌（白板）');
                }
                else if (checkName === 'checkBigThreeDragonsFan') {
                    hasBigThreeDragons = true;
                    // Exclude individual dragon fans
                    excludedFans.add('三元牌（紅中）');
                    excludedFans.add('三元牌（青發）');
                    excludedFans.add('三元牌（白板）');
                }
                else if (checkName === 'checkLittleFourWindsFan') {
                    hasLittleFourWinds = true;
                    // Exclude wind fans
                    excludedFans.add('風牌');
                    excludedFans.add('場風');
                }
                else if (checkName === 'checkBigFourWindsFan') {
                    hasBigFourWinds = true;
                    // Exclude wind fans
                    excludedFans.add('風牌');
                    excludedFans.add('場風');
                }
                else if (checkName === 'checkCompleteSeasonSetFan') {
                    hasCompleteSeasonSet = true;
                    // If has complete season set, exclude individual season flower fans
                    const seatNumber = tableSituation.flowerPlacement === "me" ? 1 : 
                                    tableSituation.flowerPlacement === "prev" ? 2 : 
                                    tableSituation.flowerPlacement === "opp" ? 3 : 4;
                    excludedFans.add(`花牌（${seatNumber}季）`);
                }
                else if (checkName === 'checkCompletePlantSetFan') {
                    hasCompletePlantSet = true;
                    // If has complete plant set, exclude individual plant flower fans
                    const seatNumber = tableSituation.flowerPlacement === "me" ? 1 : 
                                    tableSituation.flowerPlacement === "prev" ? 2 : 
                                    tableSituation.flowerPlacement === "opp" ? 3 : 4;
                    excludedFans.add(`花牌（${seatNumber}花）`);
                }

                // Add any explicit exclusions from the fan result
                if (result.excludes) {
                    result.excludes.forEach(fan => excludedFans.add(fan));
                }
            }
        }
    }
    
    // Second pass: collect all achieved fans that aren't excluded
    const achievedFans = [];
    for (const checkName of fanOrder) {
        const checkFn = nonDealerFanCheckMap[checkName];
        if (checkFn) {
            const result = checkFn(tableSituation, hand);
            if (result.achieved && !excludedFans.has(result.name)) {
                achievedFans.push(result);
            }
        }
    }
    
    return achievedFans;
}

// Export all fan checking functions
export {
    checkDealerFan,
    checkContinuingDealerFan,
    checkPullDealerFan,
    checkFullyConcealedFan,
    checkNoMeldsSelfDrawFan,
    checkSelfDrawFan,
    checkSeatWindFan,
    checkPrevailingWindFan,
    checkFlowerSeasonFan,
    checkFlowerPlantFan,
    checkRobbingKongFan,
    checkRedDragonFan,
    checkGreenDragonFan,
    checkWhiteDragonFan,
    checkSingleWaitFan,
    checkHalfQiuFan,
    checkKongDrawFan,
    checkPinfuFan,
    checkFullQiuFan,
    checkCompleteSeasonSetFan,
    checkCompletePlantSetFan,
    checkThreeConcealedPungsFan,
    checkAllPungsFan,
    checkLittleThreeDragonsFan,
    checkHalfFlushFan,
    checkFourConcealedPungsFan,
    checkFiveConcealedPungsFan,
    checkBigThreeDragonsFan,
    checkLittleFourWindsFan,
    checkFullFlushFan,
    checkAllHonorsFan,
    checkBigFourWindsFan,
    checkAllFans,
    checkNonDealerAllFans
}; 