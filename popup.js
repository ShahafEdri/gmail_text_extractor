document.getElementById("extract").addEventListener("click", () => {
  document.getElementById("status").innerText = "Extracting emails...";
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ["content.js"]
      }, () => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "extractEmails" }, (response) => {
              if (response && response.data) {
                  downloadCSV(response.data);
                  document.getElementById("status").innerText = `Extracted ${response.data.length} emails!`;
              } else {
                  document.getElementById("status").innerText = "No emails found!";
              }
          });
      });
  });
});

function downloadCSV(data) {
  let csvContent = "Sender,Subject,Body,Date\n"; // Add Date column
  data.forEach(email => {
      let row = `"${email.sender}","${email.subject}","${email.body}","${email.date}"`;
      csvContent += row + "\n";
  });
  
  let blob = new Blob([csvContent], { type: "text/csv" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = "gmail_emails.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}