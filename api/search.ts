export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const q = String(req.query?.q || '').trim();
  if (!q) {
    res.status(200).json({ query: '', results: [] });
    return;
  }

  try {
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_redirect=1&no_html=1`;
    const response = await fetch(ddgUrl);
    if (response.ok) {
      const data: any = await response.json();
      const results: Array<{ title: string; snippet: string; url: string; source: string }> = [];

      if (data.AbstractText && data.AbstractURL) {
        results.push({
          title: data.Heading || q,
          snippet: data.AbstractText,
          url: data.AbstractURL,
          source: data.AbstractSource || 'DuckDuckGo Instant Answer',
        });
      }

      if (Array.isArray(data.RelatedTopics)) {
        data.RelatedTopics.slice(0, 5).forEach((topic: any) => {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.slice(0, 60),
              snippet: topic.Text,
              url: topic.FirstURL,
              source: 'DuckDuckGo Web',
            });
          }
        });
      }

      res.status(200).json({ query: q, results });
      return;
    }

    res.status(200).json({ query: q, results: [] });
  } catch (err: any) {
    res.status(200).json({ query: q, results: [] });
  }
}
