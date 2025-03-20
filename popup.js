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
                  
                  // Now extract full content for each email
                  let promises = emailList.map(email => {
                      return new Promise(resolve => {
                          chrome.tabs.sendMessage(tabs[0].id, { action: "extractFullEmail" }, fullResponse => {
                              email.body = fullResponse?.data?.body || "No Body";
                              resolve(email);
                          });
                      });
                  });

                  Promise.all(promises).then(finalEmails => {
                      downloadCSV(finalEmails);
                      document.getElementById("status").innerText = `Extracted ${finalEmails.length} emails!`;
                  });
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
      let row = `"${email.sender}","${email.subject}","${email.date}","${email.body}"`;
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
