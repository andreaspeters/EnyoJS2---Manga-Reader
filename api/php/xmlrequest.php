<?php
	require_once class.sudoedit.inc.php;
	require_once confic.inc.php;

	$sedit = new OOSudoEdit();

	$sedit->setDBUsername($config['dbusername']);
	$sedit->setDBPassword($config['dbpassword']);
	$sedit->setDBHost($config['dbhost']);

?>
