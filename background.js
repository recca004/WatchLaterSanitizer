chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "runScriptAll" || request.action === "runScriptTen") {
    chrome.tabs.executeScript({
      code: `var actionType = "${request.action}";`
    }, () => {
      chrome.tabs.executeScript({ file: "content.js" });
    });
  }
});
