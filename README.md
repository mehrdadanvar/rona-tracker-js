# Rona Tracker

<!-- <p></p> -->

- [Rona Tracker](#rona-tracker)
  - [Warning](#warning)
  - [How to Get Started](#how-to-get-started)
  - [Naure of the Code](#naure-of-the-code)

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

To use the functions, you dont have to create an instance of the class as in most object-oriented paradigms. This means that the follwing just works:

```javascript
console.log(Rona.base_url);
// "https://www.rona.ca/en"
```

or

```javascript
Rona.allproducts_url;
//"https://www.rona.ca/en/all-products"
```

Remember to refresh your knwoledge on [asynchronous javascript](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous) and [async await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) syntax as the majority of functions in this package are written with those in mind. This means that uppon calling the functions, you will get a promise object not the data you expect. As this package summerizes data from a web source, functions need to wait for the data to come through the network, nessicatiting your functions to be prefixed with async. lok at the follwoing block introducing the first function which retrives all urls containing product information from the sitemap:

```javascript

```
