document.getElementById("runScriptAll").addEventListener("click", () => {
  chrome.runtime.sendMessage({action: "runScriptAll"});
  window.close();
});

document.getElementById("runScriptTen").addEventListener("click", () => {
  chrome.runtime.sendMessage({action: "runScriptTen"});
  window.close();
});
