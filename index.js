const cheerio = require("cheerio");
const { error } = require("console");
const fs = require("fs");

class Rona {
  static base_url = "https://www.rona.ca/en";
  static test = "menu__item.menu__list";
  static timer = (ms) => new Promise((res) => setTimeout(res, ms));
  /////////////////////////////////////////
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
        family.title = card
          .find("a.page-department__category__title")
          .text()
          .trim();
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
}

async function run() {
  let mehrdad = await Rona.get_dapartment_members(1000);
  fs.writeFile(
    "data.json",
    JSON.stringify({ data: mehrdad }),
    "utf-8",
    (error) => {
      error ? console.log(error) : null;
    }
  );
}
run();
