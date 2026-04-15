
(function(){
  function shouldShowTutorialOverlay(){
    try {
      return !!(tutorialStep > 0 && totalGames < 1 && best < 4);
    } catch (e) {
      return false;
    }
  }

  function shouldShowHybridAssistGuides(){
    try {
      return !!(best < 8 && totalGames < 3);
    } catch (e) {
      return false;
    }
  }

  window.shouldShowTutorialOverlay = shouldShowTutorialOverlay;
  window.shouldShowHybridAssistGuides = shouldShowHybridAssistGuides;

  // Keep compatibility with current render.js, which already calls shouldShowAssistGuides()
  window.shouldShowAssistGuides = shouldShowHybridAssistGuides;

  // Only show the heavy tutorial flow on the first game.
  if (typeof reset === 'function') {
    const _origReset = reset;
    window.reset = function(){
      const result = _origReset.apply(this, arguments);
      try {
        tutorialStep = totalGames < 1 ? 1 : 0;
      } catch (e) {}
      return result;
    };
  }

  // Hide tutorial text/overlay outside the first-run window.
  if (typeof drawTutorial === 'function') {
    const _origDrawTutorial = drawTutorial;
    window.drawTutorial = function(){
      if (!shouldShowTutorialOverlay()) return;
      return _origDrawTutorial.apply(this, arguments);
    };
  }
})();
