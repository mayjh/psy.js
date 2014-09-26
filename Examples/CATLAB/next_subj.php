<?php
$file_name = 'next_subj.txt';
$file = fopen($file_name,"r");
$old_subj_num = fread($file,filesize($file_name));
fclose($file); 
$new_subj_num = $old_subj_num + 1;
file_put_contents($file_name,$new_subj_num);
echo $new_subj_num;
?>