# chillerlan/php-settings-container

A container class for immutable settings objects. Not a DI container. PHP 7.2+
- [`SettingsContainerInterface`](https://github.com/chillerlan/php-settings-container/blob/master/src/SettingsContainerInterface.php) provides immutable properties with magic getter & setter and some fancy

[![version][packagist-badge]][packagist]
[![license][license-badge]][license]
[![Travis][travis-badge]][travis]
[![Coverage][coverage-badge]][coverage]
[![Scrunitizer][scrutinizer-badge]][scrutinizer]
[![Packagist downloads][downloads-badge]][downloads]
[![PayPal donate][donate-badge]][donate]

[packagist-badge]: https://img.shields.io/packagist/v/chillerlan/php-settings-container.svg?style=flat-square
[packagist]: https://packagist.org/packages/chillerlan/php-settings-container
[license-badge]: https://img.shields.io/github/license/chillerlan/php-settings-container.svg?style=flat-square
[license]: https://github.com/chillerlan/php-settings-container/blob/master/LICENSE
[travis-badge]: https://img.shields.io/travis/chillerlan/php-settings-container.svg?style=flat-square
[travis]: https://travis-ci.org/chillerlan/php-settings-container
[coverage-badge]: https://img.shields.io/codecov/c/github/chillerlan/php-settings-container.svg?style=flat-square
[coverage]: https://codecov.io/github/chillerlan/php-settings-container
[scrutinizer-badge]: https://img.shields.io/scrutinizer/g/chillerlan/php-settings-container.svg?style=flat-square
[scrutinizer]: https://scrutinizer-ci.com/g/chillerlan/php-settings-container
[downloads-badge]: https://img.shields.io/packagist/dt/chillerlan/php-settings-container.svg?style=flat-square
[downloads]: https://packagist.org/packages/chillerlan/php-settings-container/stats
[donate-badge]: https://img.shields.io/badge/donate-paypal-ff33aa.svg?style=flat-square
[donate]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=WLYUNAT9ZTJZ4

## Documentation

### Installation
**requires [composer](https://getcomposer.org)**

*composer.json* (note: replace `dev-master` with a version boundary)
```json
{
	"require": {
		"php": "^7.2",
		"chillerlan/php-settings-container": "^1.0"
	}
}
```

### Manual installation
Download the desired version of the package from [master](https://github.com/chillerlan/php-settings-container/archive/master.zip) or 
[release](https://github.com/chillerlan/php-settings-container/releases) and extract the contents to your project folder.  After that:
- run `composer install` to install the required dependencies and generate `/vendor/autoload.php`.
- if you use a custom autoloader, point the namespace `chillerlan\Settings` to the folder `src` of the package 

Profit!

## Usage

The `SettingsContainerInterface` (wrapped in`SettingsContainerAbstract` ) provides plug-in functionality for immutable object properties and adds some fancy, like loading/saving JSON, arrays etc. 
It takes an `iterable` as the only constructor argument and calls a method with the trait's name on invocation (`MyTrait::MyTrait()`) for each used trait.

### Simple usage
```php
class MyContainer extends SettingsContainerAbstract{
	protected $foo;
	protected $bar;
}
```
Typed properties in PHP 7.4+:
```php
class MyContainer extends SettingsContainerAbstract{
	protected string $foo;
	protected string $bar;
}
```

```php
// use it just like a \stdClass
$container = new MyContainer;
$container->foo = 'what';
$container->bar = 'foo';

// which is equivalent to 
$container = new MyContainer(['bar' => 'foo', 'foo' => 'what']);
// ...or try
$container->fromJSON('{"foo": "what", "bar": "foo"}');


// fetch all properties as array
$container->toArray(); // -> ['foo' => 'what', 'bar' => 'foo']
// or JSON
$container->toJSON(); // -> {"foo": "what", "bar": "foo"}
// JSON via JsonSerializable
$json = json_encode($container); // -> {"foo": "what", "bar": "foo"}

//non-existing properties will be ignored:
$container->nope = 'what';

var_dump($container->nope); // -> null
```

### Advanced usage
```php
trait SomeOptions{
	protected $foo;
	protected $what;
	
	// this method will be called in SettingsContainerAbstract::construct()
	// after the properties have been set
	protected function SomeOptions(){
		// just some constructor stuff...
		$this->foo = strtoupper($this->foo);
	}
	
	// this method will be called from __set() when property $what is set
	protected function set_what(string $value){
		$this->what = md5($value);
	}
}

trait MoreOptions{
	protected $bar = 'whatever'; // provide default values
}
```

```php
$commonOptions = [
	// SomeOptions
	'foo' => 'whatever', 
	// MoreOptions
	'bar' => 'nothing',
];

// now plug the several library options together to a single object 
$container = new class ($commonOptions) extends SettingsContainerAbstract{
	use SomeOptions, MoreOptions;
};

var_dump($container->foo); // -> WHATEVER (constructor ran strtoupper on the value)
var_dump($container->bar); // -> nothing

$container->what = 'some value';
var_dump($container->what); // -> md5 hash of "some value"
```

### API

#### [`SettingsContainerAbstract`](https://github.com/chillerlan/php-settings-container/blob/master/src/SettingsContainerAbstract.php)

method | return  | info
-------- | ----  | -----------
`__construct(iterable $properties = null)` | - | calls `construct()` internally after the properties have been set
(protected) `construct()` | void | calls a method with trait name as replacement constructor for each used trait
`__get(string $property)` | mixed | calls `$this->{'get_'.$property}()` if such a method exists
`__set(string $property, $value)` | void | calls `$this->{'set_'.$property}($value)` if such a method exists
`__isset(string $property)` | bool | 
`__unset(string $property)` | void | 
`__toString()` | string | a JSON string
`toArray()` | array | 
`fromIterable(iterable $properties)` | `SettingsContainerInterface` | 
`toJSON(int $jsonOptions = null)` | string | accepts [JSON options constants](http://php.net/manual/json.constants.php)
`fromJSON(string $json)` | `SettingsContainerInterface` | 
`jsonSerialize()` | mixed | implements the [`JsonSerializable`](https://www.php.net/manual/en/jsonserializable.jsonserialize.php) interface

## Disclaimer
This might be either an utterly genius or completely stupid idea - you decide. However, i like it and it works.
Also, this is not a dependency injection container. Stop using DI containers FFS.
