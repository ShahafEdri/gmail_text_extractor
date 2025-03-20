document.getElementById("extract").addEventListener("click", () => {
  document.getElementById("status").innerText = "Extracting emails...";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ["content.js"]
    }, () => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "extractEmails" }, (response) => {
        if (response && response.data) {
          let emailList = response.data;

          downloadCSV(emailList);
          document.getElementById("status").innerText = `Extracted ${emailList.length} emails!`;
        } else {
          document.getElementById("status").innerText = "No emails found!";
        }
      });
    });
  });
});


function downloadCSV(data) {
  let csvContent = "Sender,Subject,Date,Body\n";

  data.forEach(email => {
    let row = [
      `"${email.sender.replace(/"/g, '""')}"`,
      `"${email.subject.replace(/"/g, '""')}"`,
      `"${email.date.replace(/"/g, '""')}"`,
      `"${email.body.replace(/"/g, '""').replace(/\n/g, ' ')}"` // Remove newlines from body
    ].join(",");
    csvContent += row + "\n";
  });

  let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = "gmail_emails.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}