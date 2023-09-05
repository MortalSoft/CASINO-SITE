languages.js
============

A basic and lightweight replacement for Globalize. Stores ISO 639-1 language database in a JSON object, accesible as node module or by browser javascript interpret. Without any dependencies.

Features
--------

1.  The same file can be use from the server side in nodejs to the client side in javascript browser interpret.
2.  Also includes the json file for using in other languages, for example PHP.
3.  Supports 138 languages
4.  Very lightweight, only 6.7K or 3.7K gzipped.
5.  Very basic too, but enough for a lot of projects: only return the ISO 639-1 language codes of supported languages, the English name, the nativeName and his own direction.

Use
---

From javascript the JSON object is not accesible directly. You must use this public functions:

*  **languages.isValid(langcode)**: *Return boolean value, true if langcode is supported.*
*  **languages.getAllLanguageCode()**: *Return an array with all the language codes supported.*
*  **languages.getLanguageInfo(langcode)**: *Return object {"name": name of the language in English, "nativeName", "direction"}.
If langcode isn't supported return {}.*

See the test folder for use examples:

### From nodejs

```js
// From node the module is accesible with a simple require
var languages = require ('../languages.min.js');
var num_languages = 0;

// languages.getAllLanguageCode() return an array of all ISO 639-1 language code supported
var langscodes = languages.getAllLanguageCode();
// iterate this array
for (num_languages=0; num_languages<langscodes.length; num_languages++) {
  // show a string representation of the object return by languages.getLanguageInfo(langcode)
	console.log(langscodes[num_languages]);
	console.log("   "+JSON.stringify(languages.getLanguageInfo(langscodes[num_languages])));
}
// show the number of languages supported
console.log("Languages supported: "+num_languages);
// test languages.isValid(langcode) function
console.log("¿isValid 'kaka' language code? "+languages.isValid('kaka'));
console.log("¿isValid 'es' language code? "+languages.isValid('es'));
```

### From browser

```html
<!doctype html>
<html>
<head>
    <title>Test languages module</title>
    <meta charset="utf-8"> 
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
    <script src="../languages.min.js"></script>
    <style>
    body {
        background-color: #eee;
    }
    .centrador {
        width:700px;
        margin:10px auto;
        border:1px solid #ccc;
        padding:20px;
        background-color:#fff;
    }
    </style>
</head>
<body>
    <div class="centrador">
        <h1>Test languages module (Browser client side)</h1>
        <hr />
        <div id="test"></div>
    </div> <!-- .centrador-->
    <script>
        var num_languages = 0,
        text = '';

        // languages.getAllLanguageCode() return an array of all ISO 639-1 language code supported
        var langscodes = languages.getAllLanguageCode();
        // iterate this array
        for (num_languages=0; num_languages<langscodes.length; num_languages++) {
            // save in text variable a string representation of the object return by languages.getLanguageInfo(langcode)
            var langcode = langscodes[num_languages];
            text+='<b>'+langcode+'</b> '+JSON.stringify(languages.getLanguageInfo(langcode))+'<br />';
        }
        // save the number of languages supported
        text = '<h2>Languages supported: '+num_languages+'</h2>'+text;
        // write the test result in DOM element with id='test'
        document.getElementById('test').innerHTML = text;
    </script>
</body>
</html>
```