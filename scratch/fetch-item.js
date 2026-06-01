const fetchItem = async () => {
  const response = await fetch("https://thestandard.co/category/news/thailand/feed/");
  const xml = await response.text();
  const itemRegex = /<item>([\s\S]*?)<\/item>/;
  const match = xml.match(itemRegex);
  if (match) {
    console.log(match[1]);
  } else {
    console.log("No item found");
  }
};
fetchItem();
