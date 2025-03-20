function extractEmails() {
  let emails = [];
  document.querySelectorAll(".zA").forEach(email => {
      let sender = email.querySelector(".yX .yW span")?.innerText.trim() || "No Sender";
      let subject = email.querySelector(".bog span")?.innerText.trim() || "No Subject";
      let date = email.querySelector(".xW .xWc")?.innerText.trim() || "No Date";
      
      // Open email link
      let emailLink = email.querySelector("a")?.href;
      emails.push({ sender, subject, date, emailLink });
  });
  return emails;
}

function extractFullEmail() {
  let sender = document.querySelector(".gD")?.innerText.trim() || "No Sender";
  let subject = document.querySelector(".hP")?.innerText.trim() || "No Subject";
  let date = document.querySelector(".g3")?.innerText.trim() || "No Date";
  
  // Attempt to extract full email body
  let bodyElement = document.querySelector(".ii.gt") || document.querySelector(".a3s.aXjCH");
  let body = bodyElement ? bodyElement.innerText.trim() : "No Body";

  return { sender, subject, date, body };
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractEmails") {
      sendResponse({ data: extractEmails() });
  } else if (message.action === "extractFullEmail") {
      sendResponse({ data: extractFullEmail() });
  }
});
