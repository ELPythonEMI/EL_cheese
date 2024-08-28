chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: startCaptureProcess
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureScreenshot') {
    chrome.tabs.captureVisibleTab(null, {format: 'png'}, (dataUrl) => {
      chrome.downloads.download({
        url: dataUrl,
        filename: 'elcheese_screenshot.png',
        saveAs: true
      });
    });
  }
});

function startCaptureProcess() {
  let controlPanel;

  function createControlPanel() {
    controlPanel = document.createElement('div');
    controlPanel.style.position = 'fixed';
    controlPanel.style.top = '10px';
    controlPanel.style.right = '10px';
    controlPanel.style.padding = '10px';
    controlPanel.style.background = 'white';
    controlPanel.style.border = '1px solid black';
    controlPanel.style.zIndex = '10000';
    controlPanel.style.display = 'flex';
    controlPanel.style.flexDirection = 'column';
    controlPanel.style.alignItems = 'center';

    const captureButton = document.createElement('button');
    captureButton.textContent = 'Scatta Foto';
    captureButton.style.marginBottom = '5px';
    captureButton.onclick = captureScreenshot;
    controlPanel.appendChild(captureButton);

    const signatureText = document.createElement('div');
    signatureText.textContent = 'Creato da ELpythonEMI';
    signatureText.style.fontSize = '12px';
    controlPanel.appendChild(signatureText);

    document.body.appendChild(controlPanel);
  }

  function captureScreenshot() {
    
    controlPanel.style.display = 'none';

    setTimeout(() => {
      chrome.runtime.sendMessage({action: 'captureScreenshot'});
      
     
      setTimeout(() => {
        controlPanel.style.display = 'flex';
      }, 100);
    }, 100);
  }

  createControlPanel();
}
