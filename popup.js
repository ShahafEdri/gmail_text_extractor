document.getElementById("extract").addEventListener("click", () => {
    document.getElementById("status").innerText = "Extracting reviews...";
    let iterate = document.getElementById("iterate").checked;
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["content.js"]
      }, () => {
        // Send a message to the content script with the iterate flag
        chrome.tabs.sendMessage(tabs[0].id, { action: "extractReviews", iterate: iterate }, (response) => {
          if (response && response.data) {
            downloadCSV(response.data);
            document.getElementById("status").innerText = `Extracted ${response.data.length} reviews!`;
          } else {
            document.getElementById("status").innerText = "No reviews found!";
          }
        });
      });
    });
  });
  
  // Download the extracted data as a CSV file
  function downloadCSV(data) {
    let csvContent = "Title,Rating,Author,Date,Content\n";
    data.forEach(review => {
      let row = `"${review.title}","${review.rating}","${review.author}","${review.date}","${review.content}"`;
      csvContent += row + "\n";
    });
    
    let blob = new Blob([csvContent], { type: "text/csv" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "amazon_reviews.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  