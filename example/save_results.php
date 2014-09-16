<?php
	//write the data to file
	$file = fopen($_POST['filelocation'] . 'results.json','w+');
	fwrite($file, $_POST['exp_data']);
	fclose($file);
?>