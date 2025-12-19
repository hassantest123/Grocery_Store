/**
 * We are storing different global configurations here for ease of access and modification.
 * All variables starts with gc_ to indicate that they are global configurations.
 * 
 */


//Consumer app endpoint port
var gc_consumer_endpoint_port 		= "50XX";


//Admin app endpoint port
var gc_admin_endpoint_port 			= "50XX";


//App local machine IP, on which the app is running.
var gc_local_machine_ip 			= "172.18.0.35";


module.exports = 
{
    gc_consumer_endpoint_port,
    gc_admin_endpoint_port,
    gc_local_machine_ip
}