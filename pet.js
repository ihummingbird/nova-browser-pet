// At the top of your pet.js, or inside the main guard if preferred
let currentSeed = 0; // Will be updated based on time

// Simple LCG (Linear Congruential Generator) PRNG
function seededRandom() {
    // Parameters for a common LCG (glibc's, but simpler)
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7FFFFFFF; // Keep it positive
    return currentSeed / 0x7FFFFFFF; // Return a value between 0 (inclusive) and 1 (exclusive)
}

function reseedPrng(baseSeed) {
    currentSeed = baseSeed & 0x7FFFFFFF; // Ensure seed is a positive 31-bit integer
    // console.log("V7.4 PRNG Reseeded with:", currentSeed);
}

// pet.js
console.log("Animated Browser Pet Script V7.4 (Synced Randomness) Loaded!");

if (window.myBrowserPetInitializedV7_4) { // New flag
    console.warn("My Browser Pet V7.4: Already initialized. Aborting this instance.");
} else {
    window.myBrowserPetInitializedV7_4 = true;

    const SPRITE_SHEET_FILENAME = 'sprites.png'; // Your filename
    // 'animations' is expected from animation_data.js

    if (typeof animations === 'undefined' || animations === null) {
        console.error("CRITICAL V7.4: Animation data is not defined or null!");
    } else {
        console.log("V7.4 Animation data found.");
    }

    const DISPLAY_SCALE_FACTOR = 4;
    const ORIGINAL_SPRITE_SHEET_WIDTH = 512;
    const ORIGINAL_SPRITE_SHEET_HEIGHT = 512;

    let petContainer;
    let petSpriteEl;
    let currentAnimationName = 'idle';
    let currentFrameIndex = 0;
    let animationInterval = null;
    let behaviorTimeout = null;
    let isCurrentlyAtEdge = false;
    let currentDirection = 'right';
    let petPositionX;

    // --- Seeded PRNG ---
    let currentSeedValue = 0;
    const TIME_SLICE_MS = 10000; // Sync randomness every 10 seconds

    function getGlobalSeed() {
        // Derive a seed from the current time, quantized to TIME_SLICE_MS intervals
        const now = Date.now();
        return Math.floor(now / TIME_SLICE_MS);
    }

    function seededRandom() {
        currentSeedValue = (currentSeedValue * 1103515245 + 12345) & 0x7FFFFFFF;
        return currentSeedValue / 0x7FFFFFFF;
    }

    function reseedPrngWithGlobalTime() {
        currentSeedValue = getGlobalSeed();
        // console.log("V7.4 Reseeded with global time seed:", currentSeedValue);
    }
    // --- End Seeded PRNG ---


    function clearAnimationInterval() { /* ... same ... */ if (animationInterval !== null) { clearInterval(animationInterval); animationInterval = null; } }
    function clearBehaviorTimeout() { /* ... same ... */ if (behaviorTimeout !== null) { clearTimeout(behaviorTimeout); behaviorTimeout = null; } }

    function decideNextAction() {
      clearBehaviorTimeout();
      reseedPrngWithGlobalTime(); // Reseed PRNG at the start of each major decision

      if (typeof animations === 'undefined' || !animations) { return; }
      isCurrentlyAtEdge = false;

      const availableActions = ['run', 'idle'];
      let nextAction;
      // Use seededRandom() instead of Math.random()
      if (currentAnimationName === 'idle' && (petPositionX <= 10 || petPositionX >= window.innerWidth - ((animations.run?.frameWidth || 20) * DISPLAY_SCALE_FACTOR) - 10) ) {
          nextAction = 'run';
      } else if (currentAnimationName === 'run') {
          nextAction = seededRandom() < 0.4 ? 'idle' : 'run';
      } else {
          nextAction = seededRandom() < 0.6 ? 'run' : 'idle';
      }
      // Ensure nextAction is valid
      let validActionFound = false;
      for(const act of availableActions){ if(act === nextAction) validActionFound = true; }
      if(!validActionFound){ nextAction = availableActions[Math.floor(seededRandom() * availableActions.length)];}

      if (!animations[nextAction]) { nextAction = 'idle'; console.error("V7.4 Invalid nextAction, defaulting to idle"); }

      let actionDuration;
      if (nextAction === 'run') {
        actionDuration = (seededRandom() * 4000) + 3000; // Random duration
        // Determine direction for the new run
        if (petPositionX <= 10) {
            currentDirection = 'right';
        } else if (petPositionX >= window.innerWidth - ((animations.run?.frameWidth || 20) * DISPLAY_SCALE_FACTOR) - 10) {
            currentDirection = 'left';
        } else if (currentAnimationName !== 'run') { // Only randomize if starting a new run from middle
            currentDirection = seededRandom() < 0.5 ? 'left' : 'right';
        } else if (seededRandom() < 0.1) { // Small chance to switch mid-run
            currentDirection = (currentDirection === 'left' ? 'right' : 'left');
        }
        // If direction didn't change and it's a run, ensure it flips if at an edge
        // This part is tricky, the above logic should handle it by forcing dir at edge.
      } else { // idle
        actionDuration = (seededRandom() * 3000) + 2000;
      }
      
      // console.log(`V7.4 Decide: ${nextAction} for ${Math.round(actionDuration/1000)}s, Dir: ${currentDirection}, Seed base: ${getGlobalSeed()}`);
      setAnimation(nextAction);
      behaviorTimeout = setTimeout(decideNextAction, actionDuration);
    }

    function createPetElements() {
      reseedPrngWithGlobalTime(); // Reseed for initial position calculation

      if (typeof animations === 'undefined' || !animations) { return false; }
      if (document.getElementById('browser-pet-container')) { return true; }
      petContainer = document.createElement('div'); petContainer.id = 'browser-pet-container';
      petSpriteEl = document.createElement('div'); petSpriteEl.id = 'browser-pet-sprite';
      try { const spriteURL = chrome.runtime.getURL(SPRITE_SHEET_FILENAME); petSpriteEl.style.backgroundImage = `url(${spriteURL})`; }
      catch (e) { console.error("V7.4 Sprite sheet URL error:", e); petSpriteEl.innerText = "Err"; return false; }
      petContainer.appendChild(petSpriteEl);
      if (document.body) { document.body.appendChild(petContainer); }
      else { console.error("V7.4 No document.body for pet container."); return false; }
      
      const animDataForWidth = animations.idle || animations.run;
      if (!animDataForWidth || typeof animDataForWidth.frameWidth !== 'number') { return false; }
      const petDisplayWidth = animDataForWidth.frameWidth * DISPLAY_SCALE_FACTOR;
      const maxPosX = window.innerWidth - petDisplayWidth - 10;
      const minPosX = 10;
      
      // Use seededRandom for initial position
      const randomFactor = seededRandom(); // Get one random number based on current seed
      petPositionX = Math.floor(randomFactor * (Math.max(0, maxPosX - minPosX) + 1)) + minPosX;

      if (petPositionX > maxPosX) petPositionX = maxPosX;
      if (petPositionX < minPosX) petPositionX = minPosX;
      petContainer.style.left = `${petPositionX}px`;
      petContainer.style.right = 'auto';
      petContainer.style.bottom = '-5px';
      // console.log(`V7.4 Initial X: ${petPositionX} (randomFactor: ${randomFactor}, seed base: ${getGlobalSeed()})`);
      return true;
    }

    function handleEdgeHit() {
        if (isCurrentlyAtEdge) { return; }
        isCurrentlyAtEdge = true;
        clearBehaviorTimeout();
        
        currentAnimationName = 'idle';
        setAnimation('idle');

        reseedPrngWithGlobalTime(); // Reseed for pause duration
        const pauseAtEdgeDuration = 700 + seededRandom() * 800;
        behaviorTimeout = setTimeout(decideNextAction, pauseAtEdgeDuration);
    }

    function updatePetPosition() {
      if (typeof animations === 'undefined' || !animations || currentAnimationName !== 'run' || isCurrentlyAtEdge) {
          return;
      }
      const screenWidth = window.innerWidth; const animData = animations[currentAnimationName];
      if (!animData) { return; }
      const petDisplayWidth = (animData.frameWidth || 20) * DISPLAY_SCALE_FACTOR;
      const moveSpeed = 12; // Your desired move speed

      if (currentDirection === 'right') {
        petPositionX += moveSpeed;
        if (petPositionX >= screenWidth - petDisplayWidth - 10) {
            petPositionX = screenWidth - petDisplayWidth - 10;
            handleEdgeHit(); return; 
        }
      } else {
        petPositionX -= moveSpeed;
        if (petPositionX <= 10) {
            petPositionX = 10;
            handleEdgeHit(); return; 
        }
      }
      if (petContainer) { petContainer.style.left = `${petPositionX}px`; }
    }

    function setAnimation(animationName) {
      clearAnimationInterval();
      if (typeof animations === 'undefined' || !animations) { return; }
      let newAnimData = animations[animationName];
      if (!newAnimData) { currentAnimationName = 'idle'; newAnimData = animations.idle; }
      else { currentAnimationName = animationName; }
      currentFrameIndex = 0;
      if (!petSpriteEl) { return; }

      const calculatedWidth = newAnimData.frameWidth * DISPLAY_SCALE_FACTOR;
      const calculatedHeight = newAnimData.frameHeight * DISPLAY_SCALE_FACTOR;
      petSpriteEl.style.width = `${calculatedWidth}px`;
      petSpriteEl.style.height = `${calculatedHeight}px`;
      const scaledSheetWidth = ORIGINAL_SPRITE_SHEET_WIDTH * DISPLAY_SCALE_FACTOR;
      const scaledSheetHeight = ORIGINAL_SPRITE_SHEET_HEIGHT * DISPLAY_SCALE_FACTOR;
      petSpriteEl.style.backgroundSize = `${scaledSheetWidth}px ${scaledSheetHeight}px`;
      if (currentDirection === 'left') { petSpriteEl.style.transform = 'scaleX(-1)'; }
      else { petSpriteEl.style.transform = 'scaleX(1)'; }

      function animateFrame() {
        if (typeof animations === 'undefined' || !animations) { clearAnimationInterval(); return; }
        const animDataForFrame = animations[currentAnimationName];
        if (!animDataForFrame || !animDataForFrame.frames || animDataForFrame.frames.length === 0) {
            clearAnimationInterval(); return;
        }
        const frame = animDataForFrame.frames[currentFrameIndex];
        if (frame && petSpriteEl) {
          const backgroundPosX = frame.x * DISPLAY_SCALE_FACTOR;
          const backgroundPosY = frame.y * DISPLAY_SCALE_FACTOR;
          petSpriteEl.style.backgroundPosition = `-${backgroundPosX}px -${backgroundPosY}px`;
        }
        currentFrameIndex = (currentFrameIndex + 1) % animDataForFrame.frames.length;
        if (currentAnimationName === 'run' && !isCurrentlyAtEdge) {
             updatePetPosition();
        }
      }
      animateFrame();
      const frameSpeed = Number(newAnimData.speed);
      let effectiveSpeed = 150;
      if (newAnimData.speed && !isNaN(frameSpeed) && frameSpeed > 0) {
          effectiveSpeed = frameSpeed;
      } else { console.error("V7.4 Invalid speed for", currentAnimationName); }
      animationInterval = setInterval(animateFrame, effectiveSpeed);
    }

    function mainPetLogic() {
        if (typeof animations === 'undefined' || !animations) {
            window.myBrowserPetInitializedV7_4 = false; return;
        }
        if (createPetElements()) { // This will use the global seed for initial X
            if (petSpriteEl) {
                currentAnimationName = 'idle';
                setAnimation(currentAnimationName); // Set initial visual
                
                reseedPrngWithGlobalTime(); // Reseed for initial delay calculation
                const initialDelay = 700 + seededRandom() * 1000;
                clearBehaviorTimeout();
                behaviorTimeout = setTimeout(decideNextAction, initialDelay); // decideNextAction will use global seed
            } else { window.myBrowserPetInitializedV7_4 = false; }
        } else { if (!document.getElementById('browser-pet-container')) { window.myBrowserPetInitializedV7_4 = false; } }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mainPetLogic);
    } else {
        mainPetLogic();
    }
}