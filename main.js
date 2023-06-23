const cheerio = require("cheerio");

async function fetch_sitemap() {
  let response = await fetch("https://www.rona.ca/en/all-products");
  let html = await response.text();
  let $ = cheerio.load(html);
  let tags = $("div.page-allproduct a");
  let ttags = [];
  let myset = new Set();
  tags.each((index, element) => {
    ttags.push($(element).attr("href"));
    myset.add($(element).attr("href"));
  });

  console.log(tags.length, myset.size);
  console.log(myset);
  return myset;
}

async function resolve(url) {
  let response = await fetch(url);
  let html = await response.text();
  let $ = cheerio.load(html);
  return $;
}

let timer = (ms) => new Promise((res) => setTimeout(res, ms));
async function create_productpage_list(stop) {
  let results = await fetch_sitemap();
  let output = [];
  for (let element of results) {
    if (element.split("/").length > 5) {
      console.log(true);
      let $ = await resolve(element);
      sugestions = $("div.category_suggestion_links");
      sugestions.length > 0
        ? console.log("not interested")
        : output.push(element);
      // specifics = $("div.filter-select");
      // title = $("h1.sidebar__title");
      //console.log(sugestions.length, specifics.length, title.text());
      await timer(stop);
    } else {
      console.log(false);
    }
  }
  return output;
}

async function get_clean_pages(stop_time) {
  let cleaned = await create_productpage_list(stop_time);
  console.log(cleaned);
}

async function create_category(link) {
  let $ = await resolve(link);
  sidebar_cats = $("a.js-link-apply-filter.sidebar__link ");
  sidebar_cats.each((i, el) => {
    let item = $(el);
    console.log(item.text(), item.attr("href"));
  });
}

async function bust_api(link) {
  let api_query_params = [];
  let $ = await resolve(link);
  let scripts = $("script");
  scripts.each((i, el) => {
    let script = $(el);
    if (script.text().includes("CatalogSearchDisplayJS.urlString")) {
      let raw = script.text().trim();
      let cleaned = raw.replace("CatalogSearchDisplayJS.urlString = ", "");
      let cleaned1 = cleaned.replace(
        "CatalogSearchDisplayJS.content = 'Products';",
        ""
      );
      let final = cleaned1.replace(";", "");
      const searchParams = new URLSearchParams(final);
      let search_params = {};
      for (let [key, value] of searchParams.entries()) {
        search_params[key] = value.replace(/[\t\n\']/g, "");
      }
      let base_url = Object.keys(search_params)[0].replace("'", "");
      search_params["base_url"] = base_url;
      delete search_params[
        "'/webapp/wcs/stores/servlet/CategorySearchDisplay?navDescriptors"
      ];
      api_query_params.push(search_params);
    }
  });
  let h1 = $("h1.sidebar__title");
  let text = h1.text().trim();
  let clean = text
    .match(/\((\d+)\)/g)
    .map((match) => match.replace(/\(|\)/g, ""));
  console.log(clean);
  api_query_params[0]["total_products"] = clean[0];
  return api_query_params[0];
}

async function create_api_calls(link) {
  let api_object = await bust_api(link);
  console.log(api_object);
}

create_api_calls(
  "https://www.rona.ca/en/bathroom/bathtub-and-shower-accessories"
);
let test =
  "https://www.rona.ca/webapp/wcs/stores/servlet/CategorySearchDisplay?navDescriptors=&catalogId=10051&storeId=10151&langId=-1&categoryId=16605&productCategory=38879&pageSize=96&content=Products&page=1";
