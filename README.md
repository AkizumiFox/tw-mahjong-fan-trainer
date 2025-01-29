# 麻將算台訓練器 (Taiwanese Mahjong Fan Calculator Trainer)

A web-based tool to practice calculating fan (台數) in Taiwanese Mahjong. This tool helps players learn and practice fan calculation with randomly generated winning hands.

## How to Use

1. Click "開始" (Start) to begin practicing
2. Observe the generated winning hand and situation:
   - Tiles in hand
   - Revealed melds
   - Flowers
   - Table situation (dealer position, prevailing wind)
   - Win type (self-draw, discard)
3. Calculate the total fan points:
   - For regular wins: Enter the total fan points
   - For self-drawn wins by non-dealer: Enter both dealer and non-dealer payouts
4. Get instant feedback:
   - ⭕️ Correct: Shows detailed fan breakdown
   - ❌ Incorrect: Shows correct answer with explanation
5. Use "跳過" (Skip) to move to next hand without answering
6. Toggle between "測驗模式" (Quiz Mode) and "顯示答案模式" (Answer Display Mode)

## Features

- Randomly generated winning hands
- Comprehensive fan calculation
- Quiz mode with score tracking
- Detailed fan breakdowns
- Configurable hand generation parameters
- Support for special cases (self-drawn wins, kong-related wins)

## Local Development

1. Clone the repository
2. Open `index.html` in your browser
3. Start practicing!

## Technical Notes

- Pure vanilla JavaScript
- No external dependencies
- Modular code structure
- Responsive design

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2024 Akizumi 