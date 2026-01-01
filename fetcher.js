import fetch from "node-fetch";

const WORKER_URL = "https://gold-bot.gold-bot.workers.dev";
const API_URL = "https://BrsApi.ir/Api/Market/Gold_Currency.php?key=Bj6D5XWCiPLakBZ1YDeLS9DsHq8SlLHu";

/**
 * ارسال داده به Worker و مدیریت پاسخ غیر JSON
 */
async function sendDataToWorker(data) {
  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();

    if (contentType.includes("application/json")) {
      const json = JSON.parse(text);
      console.log("✅ Worker response:", json);
    } else {
      console.warn("⚠️ Worker returned non-JSON response. Saving raw text.");
      console.warn(text.slice(0, 500) + "..."); // فقط ۵۰۰ کاراکتر اول برای لاگ
      // اینجا میتونی متن رو به فایل ذخیره کنی اگر لازم بود
    }

  } catch (err) {
    console.error("❌ Error sending data to worker:", err);
  }
}

/**
 * دریافت داده از API و ارسال به Worker
 */
async function fetchDataAndSend() {
  try {
    const res = await fetch(API_URL);

    if (!res.ok) {
      console.error(`❌ API request failed with status ${res.status}`);
      const errorText = await res.text();
      console.error("Response text:", errorText);
      return;
    }

    const data = await res.json();
    console.log("✅ Fetched data:", data);

    await sendDataToWorker(data);

  } catch (err) {
    console.error("❌ Error fetching API data:", err);
  }
}

// اجرا اولیه و اجرای دوره‌ای هر 1 دقیقه
fetchDataAndSend();
setInterval(fetchDataAndSend, 60 * 1000);
