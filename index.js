const cheerio = require("cheerio");
const { error } = require("console");
const fs = require("fs");

class Rona {
  static base_url = "https://www.rona.ca/en";
  static allproducts_url = "https://www.rona.ca/en/all-products";
  static timer = (ms) => new Promise((res) => setTimeout(res, ms));
  ///////////////////helpers //////////////////////
  static async resolve(url) {
    let response = await fetch(url);
    let html = await response.text();
    let $ = cheerio.load(html);
    return $;
  }
  static timer = (ms) => new Promise((res) => setTimeout(res, ms));
  ///////////////// Static Methods//////////
  static async get_departments() {
    let response = await fetch(this.base_url);
    let html = await response.text();
    let $ = cheerio.load(html);
    let department_tags = $("a.menu__link.col-sm-3");
    let departments = [];
    // the first 21 items are of interest
    department_tags.slice(0, 21).each((index, element) => {
      let item = $(element);
      let department = {
        name: item.text().trim(),
        url: element.attribs.href,
        children: [],
        info: null,
      };
      departments.push(department);
    });
    return departments;
  }
  ///////////////////////////////////////////
  static async get_dapartment_members(stop) {
    let departments = await this.get_departments();
    let members = [];
    let search = [];
    for (let department of departments) {
      let response = await fetch(department.url);
      let sub_department = await response.text();
      let $ = cheerio.load(sub_department);
      let families = [];
      let carts = $("div.page-department__category");
      let scripts = $("script");
      scripts.each((index, element) => {
        let script = $(element);
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
          search.push(search_params);
        }
      });
      carts.each((index, element) => {
        let family = { title: null };
        let card = $(element);
        family.title = card.find("a.page-department__category__title").text().trim();
        family.url = `${department.url}/${family.title
          .toLowerCase()
          .replaceAll(",", "")
          .replace(/\s/g, "-")}`;
        families.push(family);
      });
      members.push(families);
      await this.timer(stop);
    }
    for (let i = 0; i < departments.length; i++) {
      departments[i].children = members[i];
      departments[i].info = search[i];
    }

    return departments;
  }
  ///////////////////////////////////////////
  static async fetch_store_ids() {
    let $ = await this.resolve(
      "https://www.rona.ca/webapp/wcs/stores/servlet/RonaStoreListDisplay?storeLocAddress=toronto&storeId=10151&catalogId=10051&langId=-1&latitude=43.653226&longitude=-79.3831843"
    );
    let scripts = $("script");
    let output = [];
    scripts.each((idx, el) => {
      let script = $(el).text();
      if (script.includes("storeMapdetailsJSON") && script.includes("var flyerURL")) {
        let content = script;
        let interest = "storeMarkers =";
        let start = content.indexOf(interest);
        let data = content.slice(start + interest.length, content.length);
        let cleaned = data.replace(/\n|\t/g, "");
        let final = cleaned.replaceAll(";", "").trim();
        /* prettier-ignore */
        let final1 = final.replaceAll("'", '\"');
        output.push(JSON.parse(final1));
      }
    });
    return output[0];
  }

  ////////////////////////////////////////////
  static read_data_from_disk() {
    try {
      let data = fs.readFileSync("./data/data.json", "utf-8");
      return JSON.parse(data);
    } catch (error) {
      error ? console.log(error) : "";
    }
  }
  //////////////////////////////////////////
  static async get_subdepartments(department, stop) {
    let data = this.read_data_from_disk();
    let departments = data.departments;
    console.log(departments.length);
    let members = [];
    let filtered_departmet = departments.filter((x) => x.name == department);
    for (let child of filtered_departmet[0].children) {
      let response = await fetch(child.url);
      let html = await response.text();
      let $ = cheerio.load(html);
      let subcategories = [];
      let interest = $("div.category_suggestion_links");
      try {
        let children_tags = interest.children();
        children_tags.each((index, element) => {
          let subcategory = {};
          // let item = $(element);
          subcategory.parent = child.title;
          subcategory.name = $(element).text();
          subcategory.url = `${this.base_url}` + $(element).find("a").attr("href");
          console.log(subcategory);
          subcategories.push(subcategory);
        });
        members.push(subcategories);
        console.log(members.length, " is now ");
        await this.timer(stop);
      } catch (error) {
        members.push(null);
      }
    }
    return members;
  }
  //////////////////////////////////////////
  static async fetch_sitemap() {
    // return a set on unique urls containing product data
    let response = await fetch(this.allproducts_url);
    let html = await response.text();
    let $ = cheerio.load(html);
    let tags = $("div.page-allproduct a");
    let ttags = [];
    let unique_set = new Set();
    tags.each((index, element) => {
      ttags.push($(element).attr("href"));
      unique_set.add($(element).attr("href"));
    });
    console.table(unique_set);
    return unique_set;
  }
  ///////////////////////////////////////////////////////
  static async create_clean_producpages(stop) {
    let results = await this.fetch_sitemap();
    let output = [];
    for (let element of results) {
      console.log(`checking url for presence of products ${element}`);
      if (element.split("/").length > 5) {
        let $ = await this.resolve(element);
        let suggests = $("div.category_suggestion_links");
        suggests.length > 0 ? console.log("not interested") : output.push(element);
        // specifics = $("div.filter-select");
        // title = $("h1.sidebar__title");
        //console.log(suggests.length, specifics.length, title.text());
        await this.timer(stop);
      } else {
        console.log(`this page does not contain products :  ${element}`);
      }
    }
    return output;
  }
  //////////////////////////////////////////////////////////
  static async fetch_api_info(link) {
    let api_query_params = [];
    let $ = await this.resolve(link);
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
      return api_query_params[0];
    });
  }
  /////////////////////////////////////////////////////////////////
  static async create_api_calls(link, store_id = "") {
    let info = await fetch_api_info(link);
    console.log(info);
    urls = [];
    for (let i = 0; i < Math.ceil(parseInt(info.total_products) / 96); i++) {
      let url = `https://rona.ca${info.base_url}
      =&catalogId=${info.catalogId}&storeId=${info.storeId}&langId=-1&categoryId=${
        info.categoryId
      }&productCategory=${info.productCategory}&pageSize=96&content=Products&page=${
        i + 1
      }`;
      urls.push(url);
    }
    return urls;
  }
  //////////////////////////////////////////////////////////////////
  static async get_product_data(url, stop) {
    let reslts = [];
    let links = await create_api_calls(url);
    for (let url of links) {
      let $ = await resolve(url);
      let scripts = $("script[type='application/json']");
      scripts.each((i, el) => {
        let data = $(el).text();
        let obj = JSON.parse(data);
        reslts.push(onj);
        console.log(obj["name"]);
      });
      await timer(stop);
    }
    return reslts;
  }
}

module.exports = Rona;
