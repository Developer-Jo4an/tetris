import {URL} from "../window/url";

export function getShareLinks(link, social, text) {
  if (text === false) {
    text = "";
  } else if (!text) {
    const $title = document.querySelector(`meta[property="og:title"]`)?.content || "";
    const $desc = document.querySelector(`meta[property="og:description"]`)?.content || "";
    const $twitter = document.querySelector(`meta[name="twitter_text"]`)?.content || "";
    switch (social) {
      case "tg":
      case "wa":
        text = `${$title} ${$desc}` + "\r\n";
        break;
      case "tw":
        text = $twitter || `${$title} ${$desc}`;
        break;
      default:
        text = "";
        break;
    }
  }

  const url = new URL(location.href);
  if (link)
    url.extend(link);

  link = url.toString();
  return initLink(link, social, text || "");
}

function initLink(link, social, text) {
  const origLink = extendLink(link, social);
  link = encodeURIComponent(origLink);
  text = encodeURIComponent(text);

  const links = {
    "direct-link": origLink,
    vk: `http://vk.com/share.php?url=${link}`,
    fb: `http://www.facebook.com/sharer.php?u=${link}`,
    ok: `https://connect.ok.ru/offer?url=${link}`,
    tw: `https://twitter.com/intent/tweet?text=${text}&url=${link}`,
    whatsapp: `whatsapp://send?text=${text} ${link}`,
    wa: `https://wa.me?text=${text} ${link}`,
    viber: `viber://forward?text=${text} ${link}`,
    tg: `https://telegram.me/share/url?url=${link}&text=${text}`
  };

  return social
    ? links.hasOwnProperty(social)
      ? links[social]
      : links
    : links;
}

function extendLink(link, social) {
  return link.replace(/^([^?]+)(\?[^#]+)?/, ($0, $1, $2) => {
    let query = "?";
    if ($2) {
      query += `${$2
        .substr(1)
        .split("&")
        .filter(itm => itm.split("=").shift() !== "utm_source")
        .join("&")}&`;
    }
    return `${$1}${query}utm_source=${social}_share`;
  });
}
