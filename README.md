# Rona Tracker

<!-- <p></p> -->

- [Rona Tracker](#rona-tracker)
  - [Warning](#warning)
  - [How to Get Started](#how-to-get-started)
  - [Naure of the Code](#naure-of-the-code)
- [Application Programming Interface](#application-programming-interface)
  - [Rona.resolve()](#ronaresolve)
    - [example:](#example)
  - [Rona.timer()](#ronatimer)

## Warning

This package is designed for educational purposes for web developers. Use of the code without proper knwoledge of programming or deploying this package for any form of abusive or unauthorized scripting activities may lead to severe legal consequences. Data scraping, when done improperly or without permission, can violate retailers' terms of service, privacy policies, and even local laws governing data protection and intellectual property rights. Engaging in such activities can result in lawsuits, financial penalties, and damage to your reputation. Therefore, it is strongly advised to exercise caution, obtain proper permissions, and ensure compliance with all applicable laws and regulations before utilizing any data scraping tools or techniques. Familiarze yourself with the core concepts and use this code ethically.

## How to Get Started

1. Make sure you have nodejs and npm installed on your system.

2. From the terminal in your project directory run the following:

```bash
npm init -y
npm install rona-tracker
```

---

## Naure of the Code

At the moment this package containes a Javascript Class with a few static methods which you can call and observe the functionality.To get started `require` the package and name it as you wish. In this example we will name it `Rona` for clarity:

```javascript
const Rona = require("rona-tracker");
```

To use the functions, you dont have to create an instance of the class as in most object-oriented languages. This means that the follwing just works:

```javascript
console.log(Rona.base_url);
// "https://www.rona.ca/en"
```

or

```javascript
Rona.allproducts_url;
//"https://www.rona.ca/en/all-products"
```

Remember to refresh your knwoledge on [asynchronous javascript](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous) and [async await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) syntax as the majority of functions in this package are written with those in mind. This means that uppon calling the functions, you will get a promise object not the data you expect. As this package summerizes data from a web source, functions need to wait for the data to come through the network, nessicatiting your functions to be prefixed with async. look at the follwoing block introducing the first function which retrives all urls containing product information from the sitemap:

```javascript
async function get_urls() {
  let urls = await Rona.fetch_sitemap();
  console.table(urls);
}
get_urls();
```

Or you can use the `.then()` syntax if you are mor confortable with:

```javascript
Rona.fetch_sitemap().then((results, error) => {
  let urls = results;
  console.table(urls);
});
```

# Application Programming Interface

---

## Rona.resolve()

The `resolve` function is an asynchronous function that takes a url as input. Its purpose is to fetch the content from the specified url and perform some operations on it using the Cheerio library.

- Input: url: A string representing the URL from which the content needs to be fetched.

- Return:A Cheerio object ($) representing the parsed HTML content. This object can be used to perform various operations on the HTML structure, such as querying elements, extracting data, or manipulating the content.

```javascript
async function resolve(url) {
  let response = await fetch(url);
  let html = await response.text();
  let $ = cheerio.load(html);
  return $;
}
```

1. It first uses the fetch function to make a network request to the specified url. The fetch function is responsible for retrieving the content from the given URL.

2. The response from the fetch function is then awaited, which means the function waits until the response is received before proceeding to the next step.

3. After the response is received, the text method is called on it. This method retrieves the textual content from the response.

4. The obtained HTML content is then assigned to the html variable.

5. The cheerio `.load` function is used to load the HTML content into a Cheerio object. Cheerio is a library that provides a convenient way to parse and manipulate HTML content using a familiar jQuery-like syntax.

6. The $ symbol is used to represent the Cheerio object, which now holds the parsed HTML.

7. Finally, the function returns the Cheerio object, $, which can be used to interact with and extract information from the HTML structure.

### example:

Finding all links in the main page

```javascript
async function get_all_links(mainPageUrl) {
  let $ = await resolve(mainPageUrl);
  links = $("a");
  links.each();
}

get_main_page(Rona.base_url);
```

---

## Rona.timer()

The timer function is a static function that creates a Promise-based timer. It allows you to introduce a delay or pause in the execution of your code for a specified number of milliseconds. As mentioned at the begining of the documentation, it is of crucial importance not to bombard an external server with an unmanagable load of requests. The timer function can be called at the end of `for` loops forinstance, to intoduce an arbitrary amount of delay.

- Input: `ms` A number representing the duration of the delay in milliseconds.
- Return: The function doesn't explicitly return a value. Instead, it returns a Promise object that will be resolved after the specified delay. You can use this Promise to chain further operations using .then() or await the completion of the timer.

```javascript
const timer = (ms) => new Promise((res) => setTimeout(res, ms));
```

1. The timer function takes a single parameter, ms, which represents the number of milliseconds for which the timer should delay the execution.

2. Inside the function, a new Promise is created using the Promise constructor. Promises are objects that represent the eventual completion (or failure) of an asynchronous operation and allow you to handle the result using the .then() and .catch() methods.

3. The Promise is constructed with an executor function that takes a single argument, conventionally named res, which is a function used to resolve the Promise. In this case, the executor function doesn't perform any specific operation but simply delays the resolution of the Promise for the specified number of milliseconds.

4. The setTimeout function is used to introduce the delay. It is a built-in JavaScript function that schedules a callback function to be executed after a specified delay (in this case, ms milliseconds).

5. The callback function passed to setTimeout is the res function, which is responsible for resolving the Promise. When the specified delay is over, the res function is called, and the Promise is considered fulfilled.
