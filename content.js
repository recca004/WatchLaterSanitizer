/**
 * WatchLaterSanitizer Content Script
 * This script provides the functionality to remove videos from a YouTube playlist.
 */

// Capture the action type from background.js
var actionType = window.actionType || "runScriptAll"; // Default to "runScriptAll"

// Create and inject a progress indicator into the YouTube page
const progressIndicator = document.createElement("div");
progressIndicator.style.position = "fixed";
progressIndicator.style.bottom = "0";
progressIndicator.style.right = "0";
progressIndicator.style.background = "#000";
progressIndicator.style.color = "#fff";
progressIndicator.style.padding = "10px";
progressIndicator.style.zIndex = "9999";
document.body.appendChild(progressIndicator);

(async function() {
  // Try to determine the playlist name
  const playlistName = document.querySelector('.metadata-wrapper #container #text')?.textContent || document.querySelector('#text')?.textContent;
  
  // Alert user and exit if playlist name can't be determined
  if (!playlistName) {
    alert("We couldn't determine the playlist name. Please make sure you're on a YouTube playlist page and try again.");
    return;
  }

  // Set limit based on action type
  const limit = (actionType === "runScriptTen") ? 10 : Infinity;
  
  // Confirm with user before proceeding
  const confirmationMessage = (actionType === "runScriptTen") ? `Are you sure to delete the FIRST 10 videos from ${playlistName}?` : `Are you sure to delete ALL videos from ${playlistName}?`;
  if (!confirm(confirmationMessage)) {
    return;
  }
  
  console.info("Starting to remove videos...");

  let counter = 0;  // Initialize counter for videos removed
  while (true) {
    // Select all video elements
    const videos = document.querySelectorAll('#primary ytd-playlist-video-renderer');
    
    // Break loop if no more videos or limit reached
    if (videos.length === 0 || counter >= limit) break;

    for (let videoElement of videos) {
      // Increment counter and update progress indicator
      counter++;
      progressIndicator.innerText = `Deleted: ${counter}`;

      // Log video details
      const videoTitle = videoElement.querySelector('a#video-title');
      console.info(`Removing Video\nTitle: ${videoTitle.innerText}\nURL: ${videoTitle.href}`);

      // Click action menu button
      const actionMenuButton = videoElement.querySelector('#menu #button');
      actionMenuButton.click();

      // Click remove button
      const removeButton = await untilDefined(() => document.evaluate(
          `//tp-yt-paper-listbox/ytd-menu-service-item-renderer[./tp-yt-paper-item/yt-formatted-string/span[text() = '${playlistName}']]`,
          document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue);
      removeButton.click();
      
      // Wait for a brief moment before proceeding
      await sleep(200);

      // Break loop if limit reached and refresh the page
      if (counter >= limit) {
        location.reload();
        break;
      }
    }
  }
  

  console.info("Done removing videos!");

  /**
   * Sleeps for the given amount of time.
   * @param {number} timeout - Time in milliseconds.
   */
  async function sleep(timeout) { 
    return new Promise(res => setTimeout(res, timeout));
  }

  /**
   * Waits until a condition is met.
   * @param {Function} factory - Function that returns the condition.
   * @param {number} checkInterval - Time interval for checking the condition.
   * @returns {Promise} Resolves when the condition is met.
   */
  async function untilDefined(factory, checkInterval = 100) {
    while (true) {
      const value = factory();
      if (value != null) return value;
      await sleep(checkInterval);
    }
  }
})();
