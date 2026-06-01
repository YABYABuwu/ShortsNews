const testImg = async () => {
  const url = "https://thestandard.co/wp-content/uploads/2026/06/thai-chuay-thai-plus-3.jpg?x31125";
  console.log(`Fetching image from: ${url}`);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    console.log(`Response Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    console.log(`Content-Length: ${response.headers.get('content-length')}`);
  } catch (err) {
    console.error("Error fetching image:", err.message);
  }
};
testImg();
