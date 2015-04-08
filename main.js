/**
 * @author Nic
 */

// fonction anonyme appelée au chargement
window.onload = function() {
													
	/* CHESS */	
	initChessBoard();	
	
	/* FILE READER */									
	showFileReader();
		
	/* Event sur les touches */
	keyEvent();
	
	test();
}
