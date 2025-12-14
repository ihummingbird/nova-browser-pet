// UPDATE const ORIGINAL_SPRITE_SHEET_HEIGHT = 512; IF YOU WANTED TO INCREASE SPRITE PNG FURTHER

    
        
// animation_data.js

// This object holds all animation configurations for the browser pet.
// Make sure frameWidth and frameHeight match the actual pixel dimensions
// of a single frame on your sprite sheet *before* scaling.
// 'x' and 'y' are the top-left coordinates of the frame on the sprite sheet.
// 'speed' is milliseconds per frame.

const animations = {
  run: {
    frameWidth: 20,  // Original width of a single run frame
    frameHeight: 20, // Original height of a single run frame
    frames: [
      // Order these frames as they should appear in the animation sequence
      { "x": 414, "y": 469 },  //1
      { "x": 405, "y": 276 }, //3
      { "x": 80, "y": 113 }, //4
      
      { "x": 468, "y": 490 },  //2
      
      
    ],
    speed: 150, // User's speed for running
  },

  idle: {
    frameWidth: 20, // Original width of a single idle frame
    frameHeight: 20, // Original height of a single idle frame
    frames: [
      { "x": 403, "y": 310 }, //3
      { "x": 276, "y": 300 }, //1
      { "x": 349, "y": 276 }, //2
      { "x": 452, "y": 403 }, //4
        // The numbering and positionning is finalized and correct x2
    ],
    speed: 150, // User's speed for idling
  }
  // You can add more animations here, e.g., jump, sleep
};

// To make this available to other scripts if not using manifest ordering,
// you could do:
// if (typeof window !== 'undefined') {
//   window.myPetAnimationData = animations;
// }
// But with manifest ordering, just 'const animations' is fine.

    