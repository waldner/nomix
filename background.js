const regex = /^https:\/\/www.youtube.com\/watch/;

var listener;
var callbacks;

// Function to process the link (modify as needed)
function processLink(link) {
  // Example processing: convert to uppercase
  // remove fucking yt playlist
  //https://www.youtube.com/watch?v=dQYjJC4L69M&list=RDdQYjJC4L69M&start_radio=1&pp=oAcB
  //https://www.youtube.com/shorts/TU9s1eNVF-A

  const rwatch = /^(https:\/\/www.youtube.com)\/.*v=([^&]*).*/;
  const rshort = /^(https:\/\/www.youtube.com)\/shorts\/([^&]*)/;

  if (rwatch.test(link)) {  
      newLink = link.replace(rwatch, '$1/watch?v=$2');
  } else {
      newLink = link.replace(rshort, '$1/watch?v=$2');
  }
  return newLink;
}

// Function to copy text to clipboard
function copyToClipboard(link) {
  navigator.clipboard.writeText(link).then(() => {
    console.log("Copied to clipboard: " + link);
  }).catch(err => {
    console.error("Could not copy text: ", err);
  });
}

// Function to open the processed link in the current tab
function openLinkInCurrentTab(link) {
  browser.tabs.update({ url: link }).then(() => {
    console.log("Opened in current tab: " + link);
  }).catch(err => {
    console.error("Could not open link in current tab: ", err);
  });
}

// Function to open the processed link in a new tab
function openLinkInNewTab(link) {
  browser.tabs.create({ url: link }).then(() => {
    console.log("Opened in new tab: " + link);
  }).catch(err => {
    console.error("Could not open link in new tab: ", err);
  });
}

async function addMenusAndListener(){

  callbacks = {};
  var id = "copyProcessedLink";
  var m = browser.menus.create({
    id: id,
    title: "Copy Processed Link",
    contexts: ["link"],
    targetUrlPatterns: ["*://www.youtube.com/watch*", "*://www.youtube.com/shorts*"]
  });
  callbacks[id] = copyToClipboard;

  id = "openProcessedLinkCurrentTab";
  m = browser.menus.create({
    id: id,
    title: "Open Processed Link in Current Tab",
    contexts: ["link"],
    targetUrlPatterns: ["*://www.youtube.com/watch*", "*://www.youtube.com/shorts*"]
  });

  callbacks[id] = openLinkInCurrentTab;

  id = "openProcessedLinkNewTab";
  m = browser.menus.create({
    id: id,
    title: "Open Processed Link in New Tab",
    contexts: ["link"],
    targetUrlPatterns: ["*://www.youtube.com/watch*", "*://www.youtube.com/shorts*"]
  });
 
  callbacks[id] = openLinkInNewTab;

  listener = function(info, tab) {
    if (callbacks[info.menuItemId]) {
      link = processLink(info.linkUrl);
      callbacks[info.menuItemId](link);
    }
  }
  await browser.menus.onClicked.addListener(listener);
}

async function removeMenuItems(){
  return browser.menus.removeAll();
}

async function removeListener(){ 
  if (listener){
    return browser.menus.onClicked.removeListener(listener);
  } else {
    return 0;
  }
}

async function setUp(){
  const p1 = removeMenuItems();
  const p2 = removeListener();
  await p1; await p2;
  await addMenusAndListener();
  return 0;
}

async function applyConfig(){
  try {
    const result = await setUp();
    console.log("Everything set up, result is: " + await result);
  } catch (error) {
    console.log('Setup failed', error);
  }
}

applyConfig();
