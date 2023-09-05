<?php
/**
 * Interface SettingsContainerInterface
 *
 * @filesource   SettingsContainerInterface.php
 * @created      28.08.2018
 * @package      chillerlan\Settings
 * @author       Smiley <smiley@chillerlan.net>
 * @copyright    2018 Smiley
 * @license      MIT
 */

namespace chillerlan\Settings;

use JsonSerializable;

/**
 * a generic container with magic getter and setter
 */
interface SettingsContainerInterface extends JsonSerializable{

	/**
	 * Retrieve the value of $property
	 *
	 * @param string $property
	 *
	 * @return mixed
	 */
	public function __get(string $property);

	/**
	 * Set $property to $value while avoiding private and non-existing properties
	 *
	 * @param string $property
	 * @param mixed  $value
	 *
	 * @return void
	 */
	public function __set(string $property, $value):void;

	/**
	 * Checks if $property is set (aka. not null), excluding private properties
	 *
	 * @param string $property
	 *
	 * @return bool
	 */
	public function __isset(string $property):bool;

	/**
	 * Unsets $property while avoiding private and non-existing properties
	 *
	 * @param string $property
	 *
	 * @return void
	 */
	public function __unset(string $property):void;

	/**
	 * @see SettingsContainerInterface::toJSON()
	 *
	 * @return string
	 */
	public function __toString():string;

	/**
	 * Returns an array representation of the settings object
	 *
	 * @return array
	 */
	public function toArray():array;

	/**
	 * Sets properties from a given iterable
	 *
	 * @param iterable $properties
	 *
	 * @return \chillerlan\Settings\SettingsContainerInterface
	 */
	public function fromIterable(iterable $properties):SettingsContainerInterface;

	/**
	 * Returns a JSON representation of the settings object
	 * @see \json_encode()
	 *
	 * @param int|null $jsonOptions
	 *
	 * @return string
	 */
	public function toJSON(int $jsonOptions = null):string;

	/**
	 * Sets properties from a given JSON string
	 *
	 * @param string $json
	 *
	 * @return \chillerlan\Settings\SettingsContainerInterface
	 *
	 * @throws \Exception
	 * @throws \JsonException
	 */
	public function fromJSON(string $json):SettingsContainerInterface;

}
