/**
 * @author Nic
 */

echiquier = new Array (
	["RN","NN","BN","QN","KN","BN","NN","RN"],
	["PN","PN","PN","PN","PN","PN","PN","PN"],
	["**","**","**","**","**","**","**","**"],	
	["**","**","**","**","**","**","**","**"],
	["**","**","**","**","**","**","**","**"],
	["**","**","**","**","**","**","**","**"],
	["PB","PB","PB","PB","PB","PB","PB","PB"],
	["RB","NB","BB","QB","KB","BB","NB","RB"]	
);

var chessBoard;
tour = 'B';
var tabCoord = new Array();	/* contient les coups --> exple : tabCoord[0]= e4 c5 */
var tabCoups = new Array(); /* contient les coups separement */
var tabStrGameState = new Array(); /* contient l'état d'une partie après chaque coups sous forme de String */

var nouvPion = false; /* lorsqu'on va ajouter un pion arrive en bout de l echiquier */

var indCoupCourant = 0;
var score;

function test()
{
	$('#setStrBtn').on('click', function() {
	  chessBoard.position('q1qqqqqq/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R');	  
	});	
}

/* Transforme l echiquier en string reconnaissable par board (position) */
function boardToString()
{
	// les blancs en lettres majuscules	
	// nbr case vide --> represente par un nbre	
	var strPos="";
	var espace=0;
	
	for(var i =0; i<8; i++){
		for(var j=0; j<8; j++){
			switch(echiquier[i][j]){								
				case "PB": strPos += 'P'; break;
				case "PN": strPos += 'p'; break;
				
				case "RB": strPos += 'R'; break;
				case "RN": strPos += 'r'; break;
				
				case "NB": strPos += 'N'; break;
				case "NN": strPos += 'n'; break;
				
				case "BB": strPos += 'B'; break;
				case "BN": strPos += 'b'; break;
				
				case "QB": strPos += 'Q'; break;
				case "QN": strPos += 'q'; break;
				
				case "KB": strPos += 'K'; break;
				case "KN": strPos += 'k'; break;						
			}
					
			if(echiquier[i][j]=="**"){				
				do{
					espace++;
					j++;
				}while(echiquier[i][j]=="**");
				strPos += ""+espace; 
				espace=0; 
				j--;
			}					
		}		
		
		if(i<7){
			strPos += "/";			
		}
	}
	
	return strPos;
}

/* Sauvegarde tous les differents etats de la partie dans "tabStrGameState" */
function fillGameState()
{
	for(var i=0; i<tabCoups.length; i++){			
		pawnMoves(tabCoups[i]);		
		inverserTour();
		var str = boardToString(); // etat de la partie sous forme de string		
		tabStrGameState.push(str);		
	}
}

function showFileReader()
{	
	// il faut verifier l extension du fichier --> PGN ?!
	
	var fileInput = document.getElementById('fileInput');
	var fileDisplayArea = document.getElementById('fileDisplayArea');

	fileInput.addEventListener('change', function(e) {					
		var file = fileInput.files[0];		
		var allowedType = 'pgn';	
		var fileType = file.name.split('.');
				
		if (fileType[fileType.length-1].toLowerCase() == allowedType) {
			var reader = new FileReader();			
			reader.onload = function(e) {											
				fileDisplayArea.innerText = reader.result;								
				analysePgn(); /* PGN ANALYSING */									
				formatPgn(); /* FORMATTING PGN */
				/* on stocke l etat du jeu après chaque coup */
				fillGameState();												
			}
			reader.readAsText(file);				
		} else {
			fileDisplayArea.innerHTML = "<b>File not supported!</b>";
		}						
	});	
}

function formatPgn()
{		
	var texte='';
	var cpt = 0;
	var ind = 0;
		
	for(var i=0; i < tabCoups.length; i++){	
		if(i%10 == 0){
			texte += "<br>";
			cpt ++;
		}	
		if(i%2 == 0){
			ind++;
			texte += "</b><span id="+i+" class=\"unCoup\" onclick=\"coupPrecis(this.id)\"><b>"+ind+".</b>"+ tabCoups[i] +" </span>";			
		}else{		
			texte += "<span id="+i+" class=\"unCoup\" onclick=\"coupPrecis(this.id)\">"+ tabCoups[i] +" </span>";			
		}
		if(cpt == 10){
			texte += "</br>";
			cpt = 0;
		}		
	}
	
	texte += "</br><b>Score : "+ score +"</b>";
	
	document.getElementById('fileDisplayArea').innerHTML = texte;	
}

function initChessBoard() 
{					
	var config = {	
		position: 'start',	
		draggable : false,
		dropOffBoard : 'trash',
		sparePieces : false,
		showNotation: true,
		snapSpeed : 'fast',
		trashSpeed : 'fast',
		snapbackSpeed : 'fast',
		appearSpeed : 'fast',
		moveSpeed : 'fast'		
	}
	var container = document.getElementById('chessBoardContainer');	
	
	chessBoard = new ChessBoard(container, config);			
				
	$('#flipOrientationBtn').on('click', chessBoard.flip);
	
	tour = 'B';
}

function inverserTour()
{
	if(tour == 'B'){
		tour = 'N';
	}else{
		tour = 'B';
	}
}

/* Effectue tous les mvt entre le mvt courant et celui selectionne a l ecran (dans le pgn) */ 
function coupPrecis(id)
{
	clearFocus();
	indCoupCourant = id;
	move();
}

/* Mise en evidence du coup courant */ 
function setFocus()
{	
	if(indCoupCourant != -1){
		var elemFocus = document.getElementById(''+indCoupCourant);
		elemFocus.style.backgroundColor="#3BBD1B";
	}	
}

function clearFocus()
{		
	if(indCoupCourant >= 0){ 
		var elemFocus = document.getElementById(''+indCoupCourant);
		elemFocus.style.backgroundColor="#FFFFFF";
	}	
}

/* effectue le mouvement a un indice donne */
function move()
{					
	setFocus();	
	chessBoard.position(tabStrGameState[indCoupCourant], false);
}

/* click sur "previous" ou bouton left */
function previousMove()
{
	if(indCoupCourant >= 0){				
		clearFocus();
		indCoupCourant--;
				
		if(indCoupCourant >= 0){				
			move();
		}else if(indCoupCourant == -1){				
			chessBoard.position('start');
		}
	}		
}

/* click sur "next" ou bouton right */
function nextMove()
{
	if(indCoupCourant < tabStrGameState.length-1){
		clearFocus();
		indCoupCourant++;
		move();
	}
}

/* Bouton "debut" */
function beginGamePlay()
{
	clearFocus();	
	indCoupCourant = 0;
	move();
}	

/* Bouton "fin" */
function endGamePlay()
{
	clearFocus();
	indCoupCourant = tabCoups.length-1;
	move();
}

function analysePgn()
{	
	//var fileDisplayArea = document.getElementById('lesCoups');		
	var fileDisplayArea = document.getElementById('fileDisplayArea');
	var texte = fileDisplayArea.innerText;								
	var reg = new RegExp("[0-9]{1,2}[.]{1}", "g");
	var regDecoupe = new RegExp("\n"); /* separer l entete de la partie contenant les coups */
	var fullPgnText = texte.split(regDecoupe);	
	var coordonnees ="";
	var indice;
	var stop = false;															
						
	for(var i = 0; i<fullPgnText.length && !(Boolean(stop)); i++){			
		if(fullPgnText[i].trim() == 0){ /* pour passer outre les espaces et tabulations -> different de chaine vide */
			indice = i;
			stop = true;				
		}
	}					
			
	/* On demarre a partir des coups des joueurs (on saute les commentaires et infos du tournoi) */	
	for(var i = indice+1; i<fullPgnText.length; i++){
		var coordonnees = coordonnees + fullPgnText[i]+' ';						
	}		
		
	tabCoord = coordonnees.split(reg);
	tabCoord.shift();	/* enlever le premier element qui est vide */
		
	for (var i=0; i<tabCoord.length; i++) {
		tabCoord[i] = tabCoord[i].trim();
		tabCoups = tabCoups.concat(tabCoord[i].split(" "));
	}
	
	/* DEBUG */
	console.log("Les coodonnees de depart : "+ tabCoord);	 
	console.log("Les coups separes : "+ tabCoups);	
	score = tabCoups[tabCoups.length-1];
	tabCoups.pop(); tabCoups.pop(); // enlever les deux derniers elem du tab
	console.log("Tabcoups.length = "+tabCoups.length);	
}

function roque(couleur, petit)
{
	var roque;
	
	if(couleur == "B"){
		if(Boolean(petit)){						
			// mvt sur echiquier
			echiquier[7][5] = echiquier[7][7]; // mvt de la tour
			echiquier[7][7] = "**";
			echiquier[7][6] = echiquier[7][4]; // mvt de roi
			echiquier[7][4] = "**";
		}
		else{	// grand roque						
			// mvt sur echiquier
			echiquier[7][3] = echiquier[7][0]; // mvt de la tour
			echiquier[7][0] = "**";
			echiquier[7][2] = echiquier[7][4]; // mvt de roi
			echiquier[7][4] = "**";
		}		
	}else{	// joueur NOIR
		if(Boolean(petit)){			
			// mvt sur echiquier
			echiquier[0][5] = echiquier[0][7]; // mvt de la tour
			echiquier[0][7] = "**";
			echiquier[0][6] = echiquier[0][4]; // mvt de roi
			echiquier[0][4] = "**";			
		}
		else{	// grand roque						
			// mvt sur echiquier
			echiquier[0][2] = echiquier[0][0]; // mvt de la tour
			echiquier[0][0] = "**";
			echiquier[0][1] = echiquier[0][4]; // mvt de roi
			echiquier[0][4] = "**";			
		}
	}	
	return roque;
}

/*
 	A partir de la case d'arrivee et du type de pièce
 	on determine quelle est la case de depart
 	param  : sous forme Ra5...
 	return : case_de_depart sous forme a4
 * */
function caseDepart(piece, ligne, colonne, coordArrivee)
{	
	// il faut rechercher les pieces qui correspondent a la "piece"
	// et correspondant a la bonne couleur
	var i=0, j=0, maxLig=8, maxCol=8;	
	var regExp;
	var coordDepart = new Array(); /* y stocker les indices de la piece avant le deplacement */
	var initCol = false;
		
	piece = piece+tour; /* pour avoir par exple QN ou QB */	
		
	regExp = new RegExp(piece);
	ligne = 8-ligne;		
	
	if(ligne > -1){		
		i = ligne;
		maxLig = i+1; 
	}
	
	if(colonne != 'i' ){
			colonne = Number(translateColToInt(colonne));			
			j = colonne;
			maxCol = j+1;			
			initCol = true;
	}else if(colonne == 'i' && piece.charAt(0) == "P"){		
		colonne = Number(translateColToInt(coordArrivee[0]));
		if(piece.charAt(0) == "P"){
			j = colonne;
			maxCol = j+1;
			initCol = true;
		}
	}	
			
	/* Coordonnees en chiffre */				
	var ligneArr = 8-Number(coordArrivee[1]);				
	var colArr = Number(translateColToInt(coordArrivee[0]));	
										
	for( ; i<maxLig; i++){		
		if(initCol){ j = Number(colonne); }
		else{j=0;}	// changer --> mettre dans boucle
		for( ; j<maxCol; j++){						
			if(echiquier[i][j].match(regExp) ){				
				if(piece.charAt(0) == 'N'){		/* choix du cheval */			
					if(Math.abs(i-ligneArr) <= 2 &&  Math.abs(j-colArr) <= 2){						
						coordDepart[0] = i;
						coordDepart[1] = j;						
					}
				}else if(piece.charAt(0) == 'R'){	/* choix de la tour */										
					if( i == ligneArr || j == colArr ){						
						coordDepart[0] = i;
						coordDepart[1] = j;																		
					}
				}else if(piece.charAt(0) == 'B'){	/* choix du fou */										
					if(Math.abs(i-ligneArr) == Math.abs(j-colArr)){						
						coordDepart[0] = i;
						coordDepart[1] = j;
					}
				}else if(piece.charAt(0) == 'Q'){
					if( i == ligneArr || j == colArr || (Math.abs(i-ligneArr) == Math.abs(j-colArr)) ){						
						coordDepart[0] = i;
						coordDepart[1] = j;																		
					}
				}				
				else{
					coordDepart[0] = i;
					coordDepart[1] = j;	
				}				
			}			
		}
	}			

	return translateCoordToChar(coordDepart);	/* a part de (2,5) renvoie par exple 'f6' */		
}

/* @param : le coup a jouer --> Qa5xd2 */
function pawnMoves(coup)
{						
	/*
	 * 1) analyse du coup 
	 * 2) appel à la fonction moves de ChessBoard : moves(case-depart, case-arrivee)
	 * */
	var piece = "P"; // pion par defaut	
	var regExp = new RegExp("[a-h]");
	var regExpChiffre = new RegExp("[1-8]");
	var colonne = "i"; // lettre bidon
	var ligne = "9"; // chiffre	bidon
	var coordRoque;	
		
	if(coup.charAt(0) == "O"){	/* roque */			
		if(coup.length==3){	/* O-O */
			coordRoque = roque(tour, true); /* true --> petit roque */
		}else{
			coordRoque = roque(tour, false);
		}							
	}
	else{ 
		if(coup.charAt(0) == 'K' || coup.charAt(0) == 'Q' || coup.charAt(0) == 'B'
			|| coup.charAt(0) == 'N' || coup.charAt(0) == 'R'){ //si la première lettre est K, Q, B, N ou R
		
			piece = coup.charAt(0);	
			coup = coup.substring(1);
		}												
		/* Exple : Rhxe4 ou Rhe4 --> il reste ici hxe4 ou he4 */
		if( coup.charAt(0).match(regExp) && (coup.charAt(1) == 'x' || coup.charAt(1).match(regExp) ) ){
			/* la pièce doit être dans la colonne désignée par cette lettre */
			colonne = coup.charAt(0); 
			coup = coup.substring(1);	
		}
		/* Exple : R3xe4 ou R3e4 --> il reste ici 3xe4 ou 3e4 */
		else if( coup.charAt(0).match(regExpChiffre) && (coup.charAt(1) == 'x' || coup.charAt(1).match(regExp) ) ){
			/* la pièce doit être dans la ligne désignée par ce chiffre */
			ligne = coup.charAt(0);
			coup = coup.substring(1);
		}
		/* Exple : Qe5xc3 ou Qe5c3 --> il reste ici e5xc3 ou e5c3 */
		else if( coup.charAt(0).match(regExp) && coup.charAt(1).match(regExpChiffre) 
				&& (coup.charAt(2) == 'x' || coup.charAt(2).match(regExp)) ){
			/* la pièce doit être dans la case désignée par la lettre et le chiffre */
			colonne = coup.charAt(0);
			ligne = coup.charAt(1);
			coup = coup.substring(2);
		}													
					
		/*
		 * Cas d'une attaque : on enleve le 'x'
		 * */	
		if(coup.charAt(0) == 'x'){
			coup = coup.substring(1);
		}	
		 
		/*
	 	* Coordonnees du deplacement
	 	*/
		// coordonnes du deplacement lettre,chiffre --> a7
		var coordDest = coup;
		coup = coup.substring(2); //--> moves('??-caseDest')
	
		/* récupérer coordonnées de la case de depart --> type de piece - ligne - colonne - coordDest (exple d4) */	 				
		var coordDep = caseDepart(piece, ligne, colonne, coordDest);		
			 
		/*
	 	* Transformation d'un pion
	 	*/
		// exple : ab=D+ --> pion en "a" prend en "b" et demande une Dame et met en échec le roi 
		if(coup.charAt(0) == '='){
			coup = coup.substring(1); // on enleve le =
			pionDem = coup.charAt(coup.length-1);					
			
			coup = coup.substring(1); // on enleve la seconde lettre qui indique Q, B, N ou R
			nouvPion = true; 
		}
		
		/*
	 	* Mise en échec du roi
	 	*/
		if(coup.charAt(0) == '+' || coup.charAt(0) == '#'){
			coup = coup.substring(1);
		}			
		
		// effectuer mvt sur "echiquier[][]"
		var coordDebut = new Array(); var coordArrivee = new Array();		
		coordDebut = translateCoordToInt(coordDep);		
		coordArrivee = 	translateCoordToInt(coordDest);	
		if(nouvPion == true){
			console.log("Ajoute pion !!!!");
			console.log("Le pion ajoute : "+newPawn(pionDem));
			echiquier[coordArrivee[0]][coordArrivee[1]] = newPawn(pionDem)+tour;
			nouvPion = false;
			affichage();
		}else{
			echiquier[coordArrivee[0]][coordArrivee[1]] = echiquier[coordDebut[0]][coordDebut[1]];
		}
		echiquier[coordDebut[0]][coordDebut[1]] = "**";
	} 
}

function newPawn(pionDem)
{
	if(tour == 'B'){
		return pionDem;
	}else{
		return pionDem.toLowerCase();
	}
}

/* Intercepte les touches clavier droite et gauche */ 
function keyEvent()
{
	document.addEventListener('keydown',function(event){		
		if(event.keyCode == 39){
			nextMove();						
		}else if(event.keyCode == 37){	
			previousMove();						
		}		
	});
}

/* exple : f6 --> (2,5) */
function translateCoordToInt(coord)
{			
	var col = coord.charAt(0);
	var lig = coord.charAt(1);		
	
	// traitement colonne
	switch (col) {
	    case 'a':
	        col = 0;
	        break;
	    case 'b':
	        col = 1;
	        break;
	    case 'c':
	        col = 2;
	        break;
	    case 'd':
	        col = 3;
	        break;
	    case 'e':
	        col = 4;
	        break;
	    case 'f':
	        col = 5;
	        break;
	    case 'g':
	        col = 6;
	        break;
	    case 'h':
	        col = 7;
	        break;
	}
	
	// traitement ligne
	lig = 8-lig;
	
	var coordinates = new Array();
	coordinates[0] = lig;
	coordinates[1] = col;
	
	return coordinates;
}

/* a --> 0, b --> 1, ... */
function translateColToInt(col)
{
	switch (col) {
	    case 'a':
	        col = 0;
	        break;
	    case 'b':
	        col = 1;
	        break;
	    case 'c':
	        col = 2;
	        break;
	    case 'd':
	        col = 3;
	        break;
	    case 'e':
	        col = 4;
	        break;
	    case 'f':
	        col = 5;
	        break;
	    case 'g':
	        col = 6;
	        break;
	    case 'h':
	        col = 7;
	        break;
	}
	
	return col;
}

/* exple : (2,5) --> f6 */
function translateCoordToChar(coord)
{
	var numLig = coord[0];
	var lettre = coord[1];				

	switch(lettre){
		case 0 :
		    lettre = 'a';
	        break;
	    case 1 :
	        lettre = 'b';
	        break;
	    case 2 :
	        lettre = 'c';
	        break;
	    case 3 :
	        lettre = 'd';
	        break;
	    case 4 :
	        lettre = 'e';
	        break;
	    case 5 :
	        lettre = 'f';
	        break;
	    case 6 :
	        lettre = 'g';
	        break;
	    case 7 :
	        lettre = 'h';
	        break;
	}
	
	numLig = 8-numLig;
	
	return (lettre+numLig);
}
