
{
  "manifest_version": 2,
  "name": "ELcheese",
  "version": "1.0",
  "description": "Cattura screenshot della finestra del browser e salva in PNG",
  "permissions": ["activeTab", "downloads"],
  "browser_action": {
    "default_icon": "icon.png",
    "default_title": "ELcheese Screenshot"
  },
  "background": {
    "scripts": ["background.js"],
    "persistent": false
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ]
}


chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, {action: "startSelection"});
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'captureArea') {
    chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(dataUrl) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = request.area.width;
        canvas.height = request.area.height;
        ctx.drawImage(img, request.area.x, request.area.y, request.area.width, request.area.height, 0, 0, request.area.width, request.area.height);
        
        const croppedDataUrl = canvas.toDataURL('image/png');
        chrome.downloads.download({
          url: croppedDataUrl,
          filename: 'elcheese_screenshot.png',
          saveAs: true
        });
      };
      img.src = dataUrl;
    });
  }
});


let isSelecting = false;
let startX, startY, endX, endY;
let selectionBox;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "startSelection") {
    startSelectionProcess();
  }
});

function startSelectionProcess() {
  document.body.style.cursor = 'crosshair';
  document.addEventListener('mousedown', startSelection);
  document.addEventListener('mousemove', updateSelection);
  document.addEventListener('mouseup', endSelection);
}

function startSelection(e) {
  isSelecting = true;
  startX = e.clientX;
  startY = e.clientY;

  selectionBox = document.createElement('div');
  selectionBox.style.position = 'fixed';
  selectionBox.style.border = '2px dashed red';
  selectionBox.style.pointerEvents = 'none';
  selectionBox.style.background = 'rgba(255, 0, 0, 0.1)';
  document.body.appendChild(selectionBox);
}

function updateSelection(e) {
  if (!isSelecting) return;

  endX = e.clientX;
  endY = e.clientY;

  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  selectionBox.style.left = left + 'px';
  selectionBox.style.top = top + 'px';
  selectionBox.style.width = width + 'px';
  selectionBox.style.height = height + 'px';
}

function endSelection(e) {
  isSelecting = false;
  document.body.removeChild(selectionBox);
  document.body.style.cursor = 'default';

  document.removeEventListener('mousedown', startSelection);
  document.removeEventListener('mousemove', updateSelection);
  document.removeEventListener('mouseup', endSelection);

  const area = {
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY)
  };

  chrome.runtime.sendMessage({action: 'captureArea', area: area});
}


