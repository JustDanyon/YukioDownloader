import fs from 'fs';

const kaiData = JSON.parse(fs.readFileSync('./public/generated/kai.json'));

function transform(n, t) {
  var s = [], j = 0, x, res = '';
  for (var i = 0; i < 256; i++) {
    s[i] = i;
  }
  for (i = 0; i < 256; i++) {
    j = (j + s[i] + n.charCodeAt(i % n.length)) % 256;
    x = s[i];
    s[i] = s[j];
    s[j] = x;
  }
  i = 0;
  j = 0;
  for (var y = 0; y < t.length; y++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    x = s[i];
    s[i] = s[j];
    s[j] = x;
    res += String.fromCharCode(t.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
  }
  return res;
}

function substitute(n, t, i) {
  for (var r = t.length, u = {}; r-- && (u[t[r]] = i[r] || ""););
  return n.split("").map(function(n) {
    return u[n] || n;
  }).join("");
}

function base64_url_encode(n) {
  return (n = (n = btoa(n)).replace(/\+/g, "-").replace(/\//g, "_")).replace(/=+$/, "");
}

function base64_url_decode(n) {
  var t = n;
  n = 4 - n.length % 4;
  if (n < 4) {
    t += "=".repeat(n);
  }
  t = t.replace(/-/g, "+").replace(/_/g, "/");
  return atob(t);
}

function reverse_it(n) {
  return n.split("").reverse().join("");
}

export async function searchAnime(query) {
  const url = `https://animekai.to/search?keyword=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const html = await res.text();
  
  const animeList = [];
  const regex = /data-id="([^"]+)"[^>]+>\s*<img[^>]+src="([^"]+)"[^>]+alt="([^"]+)"/g;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    animeList.push({
      id: match[1],
      image: match[2],
      title: match[3]
    });
  }
  
  return animeList;
}

export async function getEpisodes(ani_id) {
  function evaluate(n) {
    return eval(kaiData.generate_token);
  }
  
  const url = new URL('https://animekai.to/ajax/episodes/list');
  url.searchParams.append('ani_id', ani_id);
  url.searchParams.append('_', evaluate(ani_id));
  
  const res = await fetch(url);
  const data = await res.json();
  
  const episodes = [];
  const regex = /data-id="([^"]+)"[^>]+>([^<]+)</g;
  let match;
  
  while ((match = regex.exec(data.result)) !== null) {
    episodes.push({
      id: match[1],
      title: match[2].trim()
    });
  }
  
  return {
    episodes,
    token: data.result.match(/token="([^"]+)"/)[1]
  };
}

export async function getDownloadLink(token, episodeId) {
  function enc_evaluate(n) {
    return eval(kaiData.generate_token);
  }
  
  function dec_evaluate(n) {
    return eval(kaiData.decode_iframe_data);
  }
  
  // First request to get the episode server
  let url = new URL('https://animekai.to/ajax/links/list');
  url.searchParams.append('token', token);
  url.searchParams.append('_', enc_evaluate(token));
  
  let res = await fetch(url);
  let data = await res.json();
  
  // Second request to get the download link
  url = new URL('https://animekai.to/ajax/links/view');
  url.searchParams.append('id', episodeId);
  url.searchParams.append('_', enc_evaluate(episodeId));
  
  res = await fetch(url);
  data = await res.json();
  
  return JSON.parse(decodeURIComponent(dec_evaluate(data.result))).url;
}