import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import fs from "fs/promises";

const baseUrl = "https://news.ycombinator.com/";
const favUrl = (user) => `https://news.ycombinator.com/favorites?id=${user}`;

function timeout() {
  return new Promise((resolve) => setTimeout(resolve, 750));
}

async function getFavorites(url, obj = {}) {
  const response = await fetch(url);
  const text = await response.text();
  const dom = new JSDOM(text);
  const document = dom.window.document;
  const nodes = document.querySelectorAll("tr.athing");
  let favorites = { ...obj };
  nodes.forEach((node) => {
    const id = node.getAttribute("id");
    const url = `${baseUrl}item?id=${id}`;
    const link = node.querySelector("a.titlelink");
    const href = link.getAttribute("href");
    const title = link.textContent;
    favorites[id] = { id: id, url: url, title: title, href: href };
  });
  const subNodes = document.querySelectorAll("td.subtext");
  subNodes.forEach((node) => {
    const id = node
      .querySelector("span.score")
      .getAttribute("id")
      .replace("score_", "");
    const score = node
      .querySelector("span.score")
      .textContent.replace(" points", "");
    const user = node.querySelector("a.hnuser").textContent;
    const date = node.querySelector("span.age").getAttribute("title");
    favorites[id]["score"] = parseInt(score);
    favorites[id]["user"] = user;
    favorites[id]["date"] = date;
    if (node.querySelectorAll("a")[2]) {
      const commentsText = node.querySelectorAll("a")[2].textContent;
      const comments = commentsText.replace("comments", "");
      favorites[id]["comments"] = parseInt(comments);
    } else {
      favorites[id]["comments"] = 0;
    }
  });
  if (document.querySelector("a.morelink")) {
    const link = `${baseUrl}${document
      .querySelector("a.morelink")
      .getAttribute("href")}`;
    await timeout(750);
    console.log("fetching next page...");
    return await getFavorites(link, favorites);
  } else {
    return favorites;
  }
}
