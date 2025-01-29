/**
 * @fileoverview Taiwanese Mahjong winning hand generator
 * Generates valid 17-tile hands in the structure of 5 melds (3 tiles each) + 1 pair (2 tiles)
 * 
 * Tile index mapping:
 * 0-8: Characters (m) - 1m to 9m
 * 9-17: Dots (p) - 1p to 9p
 * 18-26: Bamboo (s) - 1s to 9s
 * 27-33: Honors (z) - 1z to 7z
 */

/**
 * Creates a fresh pool of tiles with 4 copies of each of the 34 tile types
 * @returns {number[]} Array of 34 numbers, each initialized to 4
 */
function freshTilePool() {
    return new Array(34).fill(4);
  }
  
  /**
   * Picks a random element from an array
   * @template T
   * @param {T[]} array Input array
   * @returns {T} Random element from the array
   */
  function randomChoice(array) {
    const idx = Math.floor(Math.random() * array.length);
    return array[idx];
  }
  
  /**
   * Attempts to pick a random pair from available tiles
   * @param {number[]} tileCounts Available tile counts
   * @returns {number[]|null} Array of 2 identical tile indices, or null if impossible
   */
  function pickRandomPair(tileCounts) {
    const candidates = [];
    for (let t = 0; t < 34; t++) {
      if (tileCounts[t] >= 2) {
        candidates.push(t);
      }
    }
    if (candidates.length === 0) {
      return null;
    }
    const tileType = randomChoice(candidates);
    return [tileType, tileType];
  }
  
  /**
   * Attempts to form a pong (three identical tiles)
   * @param {number[]} tileCounts Available tile counts
   * @returns {number[]|null} Array of 3 identical tile indices, or null if impossible
   */
  function tryPong(tileCounts) {
    const candidates = [];
    for (let t = 0; t < 34; t++) {
      if (tileCounts[t] >= 3) {
        candidates.push(t);
      }
    }
    if (candidates.length === 0) {
      return null;
    }
    const tileType = randomChoice(candidates);
    return [tileType, tileType, tileType];
  }
  
  /**
   * Attempts to form a chow (three consecutive suit tiles)
   * @param {number[]} tileCounts Available tile counts
   * @returns {number[]|null} Array of 3 consecutive tile indices, or null if impossible
   */
  function tryChow(tileCounts) {
    const possibleChows = [];
    
    // Characters (m): 0..8
    for (let x = 0; x <= 6; x++) {
      if (tileCounts[x] > 0 && tileCounts[x+1] > 0 && tileCounts[x+2] > 0) {
        possibleChows.push([x, x+1, x+2]);
      }
    }
    
    // Dots (p): 9..17
    for (let x = 9; x <= 15; x++) {
      if (tileCounts[x] > 0 && tileCounts[x+1] > 0 && tileCounts[x+2] > 0) {
        possibleChows.push([x, x+1, x+2]);
      }
    }
    
    // Bamboo (s): 18..26
    for (let x = 18; x <= 24; x++) {
      if (tileCounts[x] > 0 && tileCounts[x+1] > 0 && tileCounts[x+2] > 0) {
        possibleChows.push([x, x+1, x+2]);
      }
    }
    
    if (possibleChows.length === 0) {
      return null;
    }
    return randomChoice(possibleChows);
  }
  
  /**
   * Attempts to pick a random meld (either pong or chow)
   * @param {number[]} tileCounts Available tile counts
   * @returns {number[]|null} Array of 3 tile indices forming a meld, or null if impossible
   */
  function pickRandomMeld(tileCounts) {
    const meldType = Math.floor(Math.random() * 2);
    
    if (meldType === 0) {
      // Try chow first
      let meld = tryChow(tileCounts);
      if (meld !== null) {
        return meld;
      }
      // Fallback to pong
      return tryPong(tileCounts);
    } else {
      // Try pong first
      let meld = tryPong(tileCounts);
      if (meld !== null) {
        return meld;
      }
      // Fallback to chow
      return tryChow(tileCounts);
    }
  }
  
  /**
   * Converts a tile index to its string representation
   * @param {number} tileIndex Tile index (0-33)
   * @returns {string} String representation (e.g., "1m", "9p", "5s", "7z")
   */
  function tileTypeToString(tileIndex) {
    if (tileIndex >= 0 && tileIndex <= 8) {
      return (tileIndex + 1) + "m";
    } else if (tileIndex >= 9 && tileIndex <= 17) {
      return (tileIndex - 9 + 1) + "p";
    } else if (tileIndex >= 18 && tileIndex <= 26) {
      return (tileIndex - 18 + 1) + "s";
    } else {
      return (tileIndex - 27 + 1) + "z";
    }
  }
  
  /**
   * Checks if a tile is a pong (three of a kind)
   * @param {number[]} meld Array of 3 tile indices
   * @returns {boolean} True if the meld is a pong
   */
  function isPong(meld) {
    return meld[0] === meld[1] && meld[1] === meld[2];
  }
  
  /**
   * Compares two melds for sorting
   * @param {number[]} a First meld
   * @param {number[]} b Second meld
   * @returns {number} Comparison result
   */
  function compareMelds(a, b) {
    // Compare each tile in sequence (lexicographical order)
    const minLength = Math.min(a.length, b.length);
    for (let i = 0; i < minLength; i++) {
      if (a[i] !== b[i]) {
        return a[i] - b[i];
      }
    }
    
    // If all tiles up to minLength are equal, shorter meld comes first
    return a.length - b.length;
  }
  
  /**
   * Organizes a winning hand into game-state sections
   * @param {{indices: number[], strings: string[], structure: {pairs: number[][], melds: number[][]}}} hand The winning hand
   * @param {number} probReveal Probability of a meld being revealed (0-1)
   * @param {number} probKang Probability of a pong becoming a kang if possible (0-1)
   * @param {number} probFlower Probability of each flower being present (0-1)
   * @param {number} probSelfDraw Probability of self-draw win if not robbing kang (0-1)
   * @param {number} probRobKang Probability of robbing kang win if possible (0-1)
   * @param {number} probKongDraw Probability of kong-draw win if possible (0-1)
   * @returns {{
   *   inHand: number[],
   *   revealed: {tiles: number[], isKang: boolean, kangType?: "concealed" | "revealed"}[],
   *   winningTile: number,
   *   flowers: string[],
   *   win_type: "self_draw" | "from_next" | "from_prev" | "from_opp" | 
   *             "robbing_kang_next" | "robbing_kang_prev" | "robbing_kang_opp" | "kong_draw",
   *   strings: {
   *     inHand: string[],
   *     revealed: {tiles: string[], isKang: boolean, kangType?: "concealed" | "revealed"}[],
   *     winningTile: string,
   *     flowers: string[]
   *   }
   * }} The organized hand with sections
   */
  function organizeHand(hand, probReveal = 0.7, probKang = 0.3, probFlower = 0.5, probSelfDraw = 0.3, probRobKang = 0.5, probKongDraw = 0.1) {
    const tileCounts = freshTilePool();
    // Track used tiles
    hand.indices.forEach(idx => tileCounts[idx]--);
    
    const result = {
      inHand: [],
      revealed: [],
      winningTile: null,
      flowers: [],
      win_type: "from_other",  // default value
      strings: {
        inHand: [],
        revealed: [],
        winningTile: '',
        flowers: []
      }
    };
    
    // Process pairs (always in-hand)
    hand.structure.pairs.forEach(pair => {
      result.inHand.push(...pair);
    });
    
    // Process melds
    hand.structure.melds.forEach(meld => {
      if (Math.random() < probReveal) {
        // Revealed meld
        if (isPong(meld) && Math.random() < probKang) {
          // Check if we can make it a kang
          if (tileCounts[meld[0]] > 0) {
            // Add fourth tile to make it a kang
            const kangMeld = [...meld, meld[0]];
            // 50% chance for revealed vs concealed kang
            const kangType = Math.random() < 0.5 ? "revealed" : "concealed";
            result.revealed.push({
              tiles: kangMeld,
              isKang: true,
              kangType: kangType
            });
            tileCounts[meld[0]]--;
          } else {
            result.revealed.push({
              tiles: [...meld],
              isKang: false
            });
          }
        } else {
          result.revealed.push({
            tiles: [...meld],
            isKang: false
          });
        }
      } else {
        // In-hand meld
        result.inHand.push(...meld);
      }
    });
    
    // Choose winning tile from in-hand
    const winningTileIndex = Math.floor(Math.random() * result.inHand.length);
    result.winningTile = result.inHand[winningTileIndex];
    result.inHand.splice(winningTileIndex, 1);
    
    // Sort in-hand tiles by index
    result.inHand.sort((a, b) => a - b);
    
    // Sort revealed melds
    result.revealed.sort((a, b) => compareMelds(a.tiles, b.tiles));
    
    // Determine win type
    // Count how many times the winning tile appears in our hand
    const winningTileCount = result.inHand.filter(t => t === result.winningTile).length;
    
    if (winningTileCount === 0 && Math.random() < probRobKang) {
        // Determine which player we're robbing the kang from
        const rand = Math.random();
        if (rand < 1/3) {
            result.win_type = "robbing_kang_next";
        } else if (rand < 2/3) {
            result.win_type = "robbing_kang_prev";
        } else {
            result.win_type = "robbing_kang_opp";
        }
    } else {
        // Not robbing kang, determine between self draw and the three "from other" types
        const rand = Math.random();
        if (rand < 0.25) {
            // Check for Kong-Draw (槓上開花) if there's a kang in revealed melds
            const hasKang = result.revealed.some(meld => meld.isKang);
            if (hasKang && Math.random() < probKongDraw) { // Use the provided probability
                result.win_type = "kong_draw";
            } else {
                result.win_type = "self_draw";
            }
        } else if (rand < 0.5) {
            result.win_type = "from_next";
        } else if (rand < 0.75) {
            result.win_type = "from_prev";
        } else {
            result.win_type = "from_opp";
        }
    }
    
    // Add flowers (1f to 8f) in sorted order
    for (let i = 1; i <= 8; i++) {
      if (Math.random() < probFlower) {
        result.flowers.push(`${i}f`);
      }
    }
    // No need to sort flowers as they're already added in order
    result.strings.flowers = [...result.flowers];
    
    // Convert everything to strings
    result.strings.inHand = result.inHand.map(tileTypeToString);
    result.strings.revealed = result.revealed.map(meld => ({
      tiles: meld.tiles.map(tileTypeToString),
      isKang: meld.isKang,
      kangType: meld.kangType
    }));
    result.strings.winningTile = tileTypeToString(result.winningTile);
    
    return result;
  }
  
  /**
   * Generates a random winning hand with specified number of pairs and melds
   * @param {number} numPairs Number of pairs to generate (default: 1)
   * @param {number} numMelds Number of melds to generate (default: 5)
   * @returns {{
   *   indices: number[],
   *   strings: string[],
   *   structure: {
   *     pairs: number[][],
   *     melds: number[][]
   *   }
   * }} Object containing the hand in different formats
   */
  function generateWinningHand(numPairs = 1, numMelds = 5) {
    while (true) {
      const tileCounts = freshTilePool();
      const structure = {
        pairs: [],
        melds: []
      };
      
      // Pick the pairs
      for (let i = 0; i < numPairs; i++) {
      const pair = pickRandomPair(tileCounts);
      if (!pair) {
        continue;
      }
        structure.pairs.push(pair);
      for (let t of pair) {
        tileCounts[t] -= 1;
        }
      }
      
      if (structure.pairs.length < numPairs) {
        continue;
      }
      
      // Pick melds
      let meldSuccess = true;
      for (let i = 0; i < numMelds; i++) {
        const meld = pickRandomMeld(tileCounts);
        if (!meld) {
          meldSuccess = false;
          break;
        }
        // Remove meld tiles from counts
        for (let t of meld) {
          tileCounts[t] -= 1;
          if (tileCounts[t] < 0) {
            meldSuccess = false;
          }
        }
        if (!meldSuccess) break;
        structure.melds.push(meld);
      }
      
      if (!meldSuccess) {
        continue;
      }
      
      // Flatten the hand
      const indices = [];
      structure.pairs.forEach(pair => indices.push(...pair));
      structure.melds.forEach(meld => indices.push(...meld));
      
      // Convert to strings
      const strings = indices.map(tileTypeToString);

      console.log({
        indices,
        strings,
        structure
      });
      
      return {
        indices,
        strings,
        structure
      };
    }
  }
  
  /**
   * Generates a random table situation
   * @returns {{
   *   dealer: "me" | "next" | "prev" | "opp",
   *   dealerStreak: number,
   *   flowerPlacement: "me" | "next" | "prev" | "opp",
   *   prevailingWind: "east" | "south" | "west" | "north"
   * }} The table situation
   */
  function generateTableSituation() {
    // Randomly select dealer
    const positions = ["me", "next", "prev", "opp"];
    const dealer = positions[Math.floor(Math.random() * 4)];
    
    // Generate dealer's winning streak using exponential distribution
    // Using lambda = 0.5 (average streak of 2)
    const lambda = 0.5;
    const dealerStreak = Math.min(6, Math.floor(-Math.log(1 - Math.random()) / lambda));
    
    // Randomly select where to add flower
    const flowerPlacement = positions[Math.floor(Math.random() * 4)];

    // Randomly select prevailing wind
    const winds = ["east", "south", "west", "north"];
    const prevailingWind = winds[Math.floor(Math.random() * 4)];
    
    return {
        dealer,
        dealerStreak,
        flowerPlacement,
        prevailingWind
    };
  }
  
  // Export the public interface
  export {
    generateWinningHand,
    tileTypeToString,
    organizeHand,
    generateTableSituation
  };