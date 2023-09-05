<?php
/**
 * Class SettingsContainerAbstract
 *
 * @filesource   SettingsContainerAbstract.php
 * @created      28.08.2018
 * @package      chillerlan\Settings
 * @author       Smiley <smiley@chillerlan.net>
 * @copyright    2018 Smiley
 * @license      MIT
 */

namespace chillerlan\Settings;

use Exception, ReflectionClass, ReflectionProperty;

use function call_user_func, call_user_func_array, get_object_vars, json_decode, json_encode, method_exists, property_exists;

abstract class SettingsContainerAbstract implements SettingsContainerInterface{

	/**
	 * SettingsContainerAbstract constructor.
	 *
	 * @param iterable|null $properties
	 */
	public function __construct(iterable $properties = null){

		if(!empty($properties)){
			$this->fromIterable($properties);
		}

		$this->construct();
	}

	/**
	 * calls a method with trait name as replacement constructor for each used trait
	 * (remember pre-php5 classname constructors? yeah, basically this.)
	 *
	 * @return void
	 */
	protected function construct():void{
		$traits = (new ReflectionClass($this))->getTraits();

		foreach($traits as $trait){
			$method = $trait->getShortName();

			if(method_exists($this, $method)){
				call_user_func([$this, $method]);
			}
		}

	}

	/**
	 * @inheritdoc
	 */
	public function __get(string $property){

		if(property_exists($this, $property) && !$this->isPrivate($property)){

			if(method_exists($this, 'get_'.$property)){
				return call_user_func([$this, 'get_'.$property]);
			}

			return $this->{$property};
		}

		return null;
	}

	/**
	 * @inheritdoc
	 */
	public function __set(string $property, $value):void{

		if(!property_exists($this, $property) || $this->isPrivate($property)){
			return;
		}

		if(method_exists($this, 'set_'.$property)){
			call_user_func_array([$this, 'set_'.$property], [$value]);

			return;
		}

		$this->{$property} = $value;
	}

	/**
	 * @inheritdoc
	 */
	public function __isset(string $property):bool{
		return isset($this->{$property}) && !$this->isPrivate($property);
	}

	/**
	 * @internal Checks if a property is private
	 *
	 * @param string $property
	 *
	 * @return bool
	 */
	protected function isPrivate(string $property):bool{
		return (new ReflectionProperty($this, $property))->isPrivate();
	}

	/**
	 * @inheritdoc
	 */
	public function __unset(string $property):void{

		if($this->__isset($property)){
			unset($this->{$property});
		}

	}

	/**
	 * @inheritdoc
	 */
	public function __toString():string{
		return $this->toJSON();
	}

	/**
	 * @inheritdoc
	 */
	public function toArray():array{
		return get_object_vars($this);
	}

	/**
	 * @inheritdoc
	 */
	public function fromIterable(iterable $properties):SettingsContainerInterface{

		foreach($properties as $key => $value){
			$this->__set($key, $value);
		}

		return $this;
	}

	/**
	 * @inheritdoc
	 */
	public function toJSON(int $jsonOptions = null):string{
		return json_encode($this, $jsonOptions ?? 0);
	}

	/**
	 * @inheritdoc
	 */
	public function fromJSON(string $json):SettingsContainerInterface{

		$data = json_decode($json, true); // as of PHP 7.3: JSON_THROW_ON_ERROR

		if($data === false || $data === null){
			throw new Exception('error while decoding JSON');
		}

		return $this->fromIterable($data);
	}

	/**
	 * @inheritdoc
	 */
	public function jsonSerialize(){
		return $this->toArray();
	}

}
