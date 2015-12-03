chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request && request.method == 'getText') {
    sendResponse({ data: document.body.innerText, method: 'getText' });
  }
});
