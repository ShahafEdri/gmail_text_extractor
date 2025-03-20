async function extractEmails() {
  let emails = [];
  let emailElements = document.querySelectorAll(".zA"); // List of emails in Gmail
  for (let i = 0; i < emailElements.length; i++) {
    // Click the email element to open it
    emailElements[i].click();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for the email to load

    // Re-extract email details from the opened email view
    let sender = document.querySelector(".gD")?.innerText.trim() || "No Sender";
    let subject = document.querySelector(".hP")?.innerText.trim() || "No Subject";
    let date = document.querySelector(".g3")?.innerText.trim() || "No Date";
    let bodyElement = document.querySelector(".ii.gt") || document.querySelector(".a3s.aXjCH");
    let body = bodyElement ? bodyElement.innerText.trim() : "No Body";
    emails.push({ sender, subject, date, body });

    window.history.back();

    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for the inbox to reload
    // Re-query the email elements since the DOM might have refreshed
    emailElements = document.querySelectorAll(".zA");
  }
  return emails;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractEmails") {
    extractEmails().then(result => {
      sendResponse({ data: result });
    });
    return true; // Keeps the messaging channel open for async response.
  }
});