<?php

class OOSudoEdit { 

	private static $instance; 
	private $DBUsername;
	private $DBPassword;
	private $DBHost;
	private $dbh;

  	private function OOSudoEdit() { 
	}

	public function setDBUsername($user) {
		$this->DBUsername = $user;
	}

	public function setDBPassword($passwd) {
		$this->DBPassword = $passwd;
	}

	public function setDBHost($host) {
		$this->DBHost = $hostr;
	}

	public function connectDB($db) {
		if (!$this->dbh) {
			$this->dbh = mysql_connect($this->DBHost, $this->DBUser, $this->DBPassword) or return ($array['error'] = mysql_error());
		}
		mysql_select_db($db) or return($array['error'] = "Auswahl der Datenbank fehlgeschlagen");
	}

	public function closeDB() {
		mysql_close($dbh);
	}

 	public function freeDB($res) {
		mysql_free_result($res);
	}

	public function getAllServer() {
		$sql = "SELECT * FROM server";
		$res = mysql_query($sql) or return ($array['error'] = mysql_error());
		return ($array['data'] = mysql_fetch_array($res, MYSQL_ASSOC));
	}	
}

?>
