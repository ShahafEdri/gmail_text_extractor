// ---------------------
// Wait for reviews to appear
function waitForReviews(timeout = 10000) {
  return new Promise((resolve, reject) => {
    let reviews = document.querySelectorAll("[data-hook='review']");
    const noReviewsMessage = document.body.innerText.includes("Sorry, no reviews match your current selections.");
    if (reviews.length > 0 && !noReviewsMessage) {
      console.log("Reviews already loaded: " + reviews.length);
      resolve();
    } else if (noReviewsMessage) {
      console.warn("No reviews found on current page (selection message detected).");
      resolve();
    } else {
      let interval = setInterval(() => {
        reviews = document.querySelectorAll("[data-hook='review']");
        const noReviewsNow = document.body.innerText.includes("Sorry, no reviews match your current selections.");
        if (reviews.length > 0 && !noReviewsNow) {
          clearInterval(interval);
          clearTimeout(timeoutId);
          console.log("Reviews loaded after waiting: " + reviews.length);
          resolve();
        } else if (noReviewsNow) {
          clearInterval(interval);
          clearTimeout(timeoutId);
          console.warn("No reviews found (selection message detected) after waiting.");
          resolve();
        }
      }, 500);
      let timeoutId = setTimeout(() => {
        clearInterval(interval);
        console.error("Timeout waiting for reviews");
        reject(new Error("Timeout waiting for reviews"));
      }, timeout);
    }
  });
}

// ---------------------
// Extract reviews from current page
function extractCurrentReviews() {
  let reviews = [];
  document.querySelectorAll("[data-hook='review']").forEach(review => {
    let reviewId = review.getAttribute("id") || ""; // May be empty if not provided
    let title = review.querySelector("[data-hook='review-title']")?.innerText.trim() || "No Title";
    let rating = review.querySelector("[data-hook='review-star-rating']")?.innerText.trim() || "No Rating";
    let author = review.querySelector(".a-profile-name")?.innerText.trim() || "Anonymous";
    let date = review.querySelector("[data-hook='review-date']")?.innerText.trim() || "No Date";
    let content = review.querySelector("[data-hook='review-body'] span")?.innerText.trim() || "No Content";
    reviews.push({ id: reviewId, title, rating, author, date, content });
  });
  console.log("Extracted " + reviews.length + " reviews from current page.");
  return reviews;
}

// ---------------------
// Iteratively extract reviews across pages with state persistence
async function extractAllReviews() {
  let allReviews = [];
  let reviewIds = new Set();
  let pageCount = 0;
  const maxPages = 150; // Maximum pages to iterate over

  while (true) {
    pageCount++;
    console.log("Processing page: " + pageCount);
    
    try {
      await waitForReviews();
    } catch (error) {
      console.error("Error waiting for reviews on page " + pageCount + ": " + error.message);
      break;
    }
    
    let currentReviews = extractCurrentReviews();
    let newReviews = currentReviews.filter(review => {
      if (review.id && reviewIds.has(review.id)) {
        return false;
      } else {
        if (review.id) reviewIds.add(review.id);
        return true;
      }
    });
    console.log("Total reviews found on page " + pageCount + ": " + newReviews.length);
    
    allReviews = allReviews.concat(newReviews);
    
    // Check for the next page button container
    let liElement = document.querySelector("li.a-last");
    if (!liElement) {
      console.log("li.a-last element not found. Finishing extraction.");
      break;
    }
    
    // Check if the next page button is disabled
    if (liElement.classList.contains("a-disabled")) {
      console.log("Next page button is disabled. Finishing extraction.");
      break;
    }
    
    // Get the clickable next page button
    let nextButton = liElement.querySelector("a");
    if (!nextButton) {
      console.log("No clickable next page button found. Waiting 500ms and checking again...");
      await new Promise(r => setTimeout(r, 500));
      liElement = document.querySelector("li.a-last");
      nextButton = liElement ? liElement.querySelector("a") : null;
    }
    
    if (nextButton) {
      console.log("Next page button found, clicking...");
      nextButton.click();
      // Wait a bit after clicking to ensure the new page starts loading
      console.log("Waiting 2000ms after clicking next page...");
      await new Promise(r => setTimeout(r, 2000));
      
      try {
        await waitForReviews();
      } catch (error) {
        console.error("Error waiting for reviews on next page: " + error.message);
        break;
      }
    } else {
      console.log("No next page button found after re-check. Finishing extraction.");
      break;
    }
    
    if (pageCount >= maxPages) {
      console.warn("Maximum page limit reached (" + maxPages + "). Stopping extraction.");
      break;
    }
  }
  
  console.log("Extraction complete. Total unique reviews: " + allReviews.length);
  return allReviews;
}



// ---------------------
// Message listener from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractReviews") {
    if (message.iterate) {
      extractAllReviews()
        .then(data => sendResponse({ data: data }))
        .catch(err => {
          console.error("Error during extraction: " + err.message);
          sendResponse({ data: [] });
        });
    } else {
      waitForReviews()
        .then(() => {
          let data = extractCurrentReviews();
          sendResponse({ data: data });
        })
        .catch(err => {
          console.error("Error waiting for reviews: " + err.message);
          sendResponse({ data: [] });
        });
    }
    return true; // Keeps the messaging channel open for asynchronous response
  }
});
