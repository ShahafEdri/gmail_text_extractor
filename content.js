// content.js - Extract emails from Gmail's filtered view

function extractEmails() {
  let emails = [];
  document.querySelectorAll(".zA").forEach(email => {
      let sender = email.querySelector(".yX .yW span")?.innerText.trim() || "No Sender";
      let subject = email.querySelector(".bog span")?.innerText.trim() || "No Subject";
      let body = email.querySelector(".y2")?.innerText.trim() || "No Content";
      let date = email.querySelector(".xW .xWc")?.innerText.trim() || "No Date"; // Extract date

      emails.push({ sender, subject, body, date });
  });
  return emails;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractEmails") {
      let data = extractEmails();
      sendResponse({ data: data });
  }
});
