<?php
define("mortalsoft", "");

spl_autoload_register(function ($className) {
    $classPath = $_SERVER["DOCUMENT_ROOT"]. '/core/classes/' . $className . '.class.php';
    
    if (file_exists($classPath)) {
        require_once($classPath);
    }
});?>