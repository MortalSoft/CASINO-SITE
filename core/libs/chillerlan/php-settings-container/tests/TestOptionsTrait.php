<?php
/**
 * Trait TestOptionsTrait
 *
 * @filesource   TestOptionsTrait.php
 * @created      28.08.2018
 * @package      chillerlan\SettingsTest
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2018 smiley
 * @license      MIT
 */

namespace chillerlan\SettingsTest;

trait TestOptionsTrait{

	protected $test1 = 'foo';

	protected $test2;

	protected $testConstruct;

	protected $test4;

	protected $test5;

	protected $test6;

	protected function TestOptionsTrait(){
		$this->testConstruct = 'success';
	}

	protected function set_test5($value){
		$this->test5 = $value.'_test5';
	}

	protected function get_test6(){
		return $this->test6 === null
			? 'null'
			: sha1($this->test6);
	}
}
