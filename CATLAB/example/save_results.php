<?php
	//write the data to file

require_once '../../../wp-config.php';
global $wpdb;
global $current_user;
get_currentuserinfo();
$user_ID=$current_user->ID;


try{
	if(isset($_POST['filelocation']) && isset($_POST['partial']) && isset($_POST['exp_data'])){
	   
	   $ip='123';//$_SERVER['REMOTE_ADDR'];    //get the ip address
	   $useragent=$_SERVER['HTTP_USER_AGENT']; //get the browser information
	   $ran=date("ymd_His");				   //get the date
	   //make a file name with relevant info
	   $filename=$_POST['filelocation']."recog"."_".$ran."_".$ip."_".$user_ID.".json"; 
	   $exppart_id = $_POST['exppart_id'];		//get the participant id
	   $partsession_id = $_POST['partsession_id'];//get the session
	   $session = $_POST['session'];
	   $exp_data = $_POST['exp_data'];			//get the experimental data
	   $exp_data = stripslashes($exp_data);
	   
	   //write the data to file
	   $file = fopen($filename,'w+');
	   fwrite($file, $exp_data);
	   fclose($file);
	   
	   //save to database
	   if( $exppart_id!=0 ){
				
				if (!isset($session)) { 
					$session = 0;
				}
				$data = array('xmldata'=>$exp_data,'exppart_id'=>$exppart_id,'partsession_id'=>$partsession_id,
					'session'=>$session,'filename'=>$filename,'IP'=>$ip,'user_agent'=>$useragent);
				$results = $wpdb->insert('exp_result',$data,array('%s','%s','%s'));
	   
	   
			// update session to finished
			if ($current_user->user_login != 'participant') {
				$results = $wpdb->update('exp_partsession', array('finished' => 'yes'), 
					array('partsession_id' => $partsession_id), array('%s'), array('%d'));
				$results = $wpdb->update('exp_partsession', array('session_run' => $session), 
					array('partsession_id' => $partsession_id), array('%d'), array('%d'));
				$results = $wpdb->update('exp_expparticipant', array('cur_session' => $session+1), 
					array('exppart_id' => $exppart_id), array('%d'), array('%d'));
				if(check_finished($exppart_id)){
					$results = $wpdb->update('exp_expparticipant', array('finished' => 1), array('exppart_id' => $exppart_id), array('%d'), array('%d'));
				}
			}
		}
	
	}
}catch(Exception $e) {
	echo "error";
}
?>