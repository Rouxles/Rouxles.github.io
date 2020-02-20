var canv = document.getElementById("c");
var c = canv.getContext("2d");
var cube = new LSECube;
var scramble = "";
var mymoves = "";
var mytimes = [];

var key_m = 83;
var key_mp = 68;
var key_u = 75;
var key_up = 76;

var changing = false;
var solving = false;
var solved = true;
var cp = 0;

var ucol = 0;
var fcol = 2;

var cstate = "LRABCD"

//Scramble solver
function dSq(lset,p,s,x,y,w,h)
{
	c.fillStyle=lset.col(p, s);
	c.fillRect(x,y,w,h);
}
function drawPreview(lset,dBottom,dBack)
{
	var mul = canv.width / 10;
	canv.height = mul * 17;
	//reset canvas
	c.clearRect(0,0,canv.width,canv.height);

	//Top edges
	//UL
	dSq(lset,0,0,0,6*mul,2*mul,2*mul);
	dSq(lset,0,1,2*mul,6*mul,2*mul,2*mul);
	//UB
	//UR
	dSq(lset,1,0,8*mul,6*mul,2*mul,2*mul);
	dSq(lset,1,1,6*mul,6*mul,2*mul,2*mul);
	if(dBack) dSq(lset,2,0,4*mul,3*mul,2*mul,mul);
	dSq(lset,2,1,4*mul,4*mul,2*mul,2*mul);
	//UF
	dSq(lset,3,0,4*mul,10*mul,2*mul,2*mul);
	dSq(lset,3,1,4*mul,8*mul,2*mul,2*mul);


	//FD
	dSq(lset,4,0,4*mul,14*mul,2*mul,2*mul);
	if(dBottom) dSq(lset,4,1,4*mul,16*mul+2,2*mul,mul-2);

	//Center colours
	c.fillStyle=lset.colM(0); c.fillRect(4*mul,6*mul,2*mul,2*mul); //U
	c.fillStyle=lset.colM(1); c.fillRect(4*mul,12*mul,2*mul,2*mul); //F
	if(dBack)
	{
		c.fillStyle=lset.colM(3); c.fillRect(4*mul,2*mul,2*mul,mul); //B
	}
	

	//DB
	if(dBack)
	{
		dSq(lset,5,0,4*mul,mul,2*mul,mul);
		if(dBottom) dSq(lset,5,1,4*mul,0,2*mul,mul-2);
	}

	//Corner sides
	c.fillStyle=lset.colC(0); //L
	c.fillRect(0,4*mul,2*mul,2*mul);
	c.fillRect(0,8*mul,2*mul,2*mul);
	if(dBack)
	{
		c.fillStyle=lset.colC(1); //B
		c.fillRect(2*mul,3*mul,2*mul,1*mul);
		c.fillRect(6*mul,3*mul,2*mul,1*mul);
	}
	c.fillStyle=lset.colC(2); //R
	c.fillRect(8*mul,4*mul,2*mul,2*mul);
	c.fillRect(8*mul,8*mul,2*mul,2*mul);
	c.fillStyle=lset.colC(3); //F
	c.fillRect(2*mul,10*mul,2*mul,2*mul);
	c.fillRect(6*mul,10*mul,2*mul,2*mul);

	//Filling in the rest
	c.fillStyle=lset.colF(4); c.fillRect(0,10*mul,2*mul,6*mul); //L
	c.fillStyle=lset.colF(5); c.fillRect(8*mul,10*mul,2*mul,6*mul); //R
	//F
	c.fillStyle=lset.colF(1);
	c.fillRect(2*mul,12*mul,2*mul,4*mul);
	c.fillRect(6*mul,12*mul,2*mul,4*mul);
	//B
	if(dBack)
	{
		c.fillStyle=lset.colF(3);
		c.fillRect(2*mul,1*mul,2*mul,2*mul);
		c.fillRect(6*mul,1*mul,2*mul,2*mul);
	}
	//Corner tops
	c.fillStyle=lset.colF(0);
	c.fillRect(2*mul,4*mul,2*mul,2*mul);
	c.fillRect(6*mul,4*mul,2*mul,2*mul);
	c.fillRect(2*mul,8*mul,2*mul,2*mul);
	c.fillRect(6*mul,8*mul,2*mul,2*mul);

	//Rectangles around
	c.strokeStyle="#000";
	c.strokeRect(2*mul-0.5,4*mul-0.5,6*mul+1,6*mul+1);
	c.strokeRect(-0.5,4*mul-0.5,2*mul,6*mul+1);
	c.strokeRect(8*mul+0.5,4*mul-0.5,2*mul,6*mul+1);
	c.strokeRect(2*mul-0.5,10*mul+0.5,6*mul+1,2*mul);
	if(dBack) c.strokeRect(2*mul-0.5,3*mul-0.5,6*mul+1,mul);
}

function upd()
{
	var newcube = cube.doMoves(mymoves, true);
	drawPreview(newcube, gc("dBottom"), gc("dBack"));

	if(LSECube.ss_solved(newcube))
	{
		stop_timer();
		document.getElementById("moves").innerHTML = "<b>" + mymoves + "</b>" + (mymoves.split(" ").length - 1) + " STM";
	}
	else
	{
		document.getElementById("moves").innerHTML = mymoves;
	}
}
function gc(s)
{
	return document.getElementById(s).checked;
}

function check_controls()
{
	console.log(window.localStorage.getItem("controls"))
	var lsc = window.localStorage.getItem("controls");
	if(lsc !== null)
	{
		var cs = lsc.split("|");
		key_m = +cs[0];
		key_mp = +cs[1];
		key_u = +cs[2];
		key_up = +cs[3];
		key_mp2 = 79;
		key_up2 = 68;
	}
}

function startnew()
{
	if(solving) return;
	check_controls();

	document.getElementById("pt").innerHTML = "<br/>";
	document.getElementById("time").innerHTML = "0.000";
	mymoves = "";
	mytimes = [];
	cube = genstate();

	ucol = 0;
	fcol = 2;
	if(oris != "000000000000000000000000")
	{
		var ori = Math.floor(Math.random() * (oris.split("1").length-1.01));
		var k = 0;
		var l = 0;
		for(var i=0; i<6; i+=2)
		{
			for(var j=0; j<6; j++)
			{
				if(j==i||j==i+1) continue;
				if(oris[k++]=="1")
				{
					if(ori==l++)
					{
						ucol = i;
						fcol = j;
						i = 999;
						j = 999;
					}
				}
				if(oris[k++]=="1")
				{
					if(ori==l++)
					{
						ucol = i+1;
						fcol = j;
						i = 999;
						j = 999;
					}
				}
			}
		}
	}

	if(ucol == 0)
	{
		if(fcol == 3) cube.rotate("y2");
		if(fcol == 4) cube.rotate("y");
		if(fcol == 5) cube.rotate("y'");
	}
	else if(ucol == 1)
	{
		cube.rotate("x2");
		if(fcol == 2) cube.rotate("y2");
		if(fcol == 4) cube.rotate("y");
		if(fcol == 5) cube.rotate("y'");
	}
	else if(ucol == 2)
	{
		cube.rotate("x");
		if(fcol == 0) cube.rotate("y2");
		if(fcol == 4) cube.rotate("y");
		if(fcol == 5) cube.rotate("y'");
	}
	else if(ucol == 3)
	{
		cube.rotate("x'");
		if(fcol == 1) cube.rotate("y2");
		if(fcol == 4) cube.rotate("y");
		if(fcol == 5) cube.rotate("y'");
	}
	else if(ucol == 4)
	{
		cube.rotate("z'");
		if(fcol == 3) cube.rotate("y2");
		if(fcol == 1) cube.rotate("y");
		if(fcol == 0) cube.rotate("y'");
	}
	else if(ucol == 5)
	{
		cube.rotate("z");
		if(fcol == 3) cube.rotate("y2");
		if(fcol == 0) cube.rotate("y");
		if(fcol == 1) cube.rotate("y'");
	}
	solved = false;
	upd();
}

function do_move(m)
{
	if(solving)
	{
		mytimes.push(Date.now() - t_start);
		mymoves += m + " ";
		mymoves = mymoves.replace("M M ", "M2 ");
		mymoves = mymoves.replace("M' M' ", "M2 ");
		mymoves = mymoves.replace("U U ", "U2 ");
		mymoves = mymoves.replace("U' U' ", "U2 ");
		upd();
	}
}

function cControls()
{
	if(solving) return;

	document.getElementById("overlay").style = "";
	changing = true;
	cp = 0;

	document.getElementById("ctrl").innerHTML = "Press key for M";
}

var t_start = Date.now();
var t_delta = 0;
var t_list = []

function start_timer()
{
	if(!solving)
	{
		t_start = Date.now();
		solving = true;
		updtime();
	}
}
function stop_timer()
{
	if(solving)
	{
		solving = false;
		updtime();

		//solved after to stop the extra updtime() caused by timeout
		solved = true;

		t_list.push([t_delta, mytimes, mymoves, scramble]);
		updtimelist();
	}
}
function updtime()
{
	if(!solved)
	{
		t_delta = Date.now() - t_start;
		var th = (t_delta / 1000).toFixed(3);
		if(solving)
		{
			document.getElementById("time").innerHTML = th;
			setTimeout(updtime, 10);
		}
		else
		{
			document.getElementById("time").innerHTML = "<b>"+th+"</b>";
		}
	}
}
function updtimelist()
{
	var tl = "";
	for(var n of [5,12,50,100,200,1000])
	{
		var ao = get_aox(n);
		if(ao!==undefined) { tl+="Ao"+n+": "+(ao/1000).toFixed(3)+"<br/>"; }
	}
	for(var i = t_list.length - 1; i >= 0; i--)
	{
		var t = t_list[i];
		tl += "<p class='t' onclick='tshow("+i+")'>" + (i+1) + ".    <b>["+(t[0] / 1000).toFixed(3)+"]</b> " + t[3] + "</p>";
	}
	document.getElementById("times").innerHTML = tl;
}
function get_aox(n)
{
	if (n>t_list.length) return undefined;
	var lowest = 99999999;
	var highest = 0;
	var total = 0;
	for(var i = t_list.length - 1; i >= t_list.length - n; i--)
	{
		var t = t_list[i];
		total += t[0];
		if(t[0]>highest) highest = t[0];
		if(t[0]<lowest) lowest = t[0];
	}
	return (total-highest-lowest) / (n-2);
}
function tshow(n)
{
	if (!solved) return;
	drawPreview(new LSECube(t_list[n][3]), gc("dBottom"), gc("dBack"));
	document.getElementById("time").innerHTML = "<b>"+ (t_list[n][0]/1000).toFixed(3) +"</b>";
	document.getElementById("moves").innerHTML = "<b>" + t_list[n][2] + "</b>" + (t_list[n][2].split(" ").length - 1) + " STM";
	document.getElementById("pt").innerHTML = t_list[n][3];
}

function keydown(e)
{
	if(!changing)
	{
		if(!solved)
		{
			if(e.keyCode == key_m) { start_timer(); do_move("M");  }
			if(e.keyCode == key_mp) { start_timer(); do_move("M'"); }
			if(e.keyCode == key_mp2) { start_timer(); do_move("M'"); }
			if(e.keyCode == key_u) { start_timer(); do_move("U"); }
			if(e.keyCode == key_up) { start_timer(); do_move("U'"); }
			if(e.keyCode == key_up2) { start_timer(); do_move("U'"); }
		}
		else
		{
			if(e.keyCode == 13) startnew();		// enter
		}
		if(e.keyCode == 27) cControls();	// esc
	}
	else
	{
		switch(cp)
		{
			case 0:
				key_m = e.keyCode;
				cp++;
				document.getElementById("ctrl").innerHTML = "Press key for M'";
				break;
			case 1:
				key_mp = e.keyCode;
				cp++;
				document.getElementById("ctrl").innerHTML = "Press key for U";
				break;
			case 2:
				key_u = e.keyCode;
				cp++;
				document.getElementById("ctrl").innerHTML = "Press key for U'";
				break;
			case 3:
				key_up = e.keyCode;
				changing = false;
				window.localStorage.setItem("controls",key_m+"|"+key_mp+"|"+key_u+"|"+key_up);
				document.getElementById("overlay").style = "display:none";
				break;
		}
	}
}
function shuffleArray(array)
{
    for (var i = array.length - 1; i > 0; i--)
    {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function cso(c)
{
	if((c.puf%2 == 0) == (c.pms%2 == 0))
	{
		return (c.sta.toLowerCase() == "lrabcd");
	}
	else
	{
		var s = c.sta.toLowerCase();
		return (s == "rlabcd" ||
			s == "larbcd" ||
			s == "lrbacd" ||
			s == "lracbd" ||
			s == "lrabdc")
	}

}
function cso_swap(c)
{
	if((c.puf%2 == 0) != (c.pms%2 == 0))
	{
		return (c.sta.toLowerCase() == "lrabcd");
	}
	else
	{
		var s = c.sta.toLowerCase();
		return (s == "rlabcd" ||
			s == "larbcd" ||
			s == "lrbacd" ||
			s == "lracbd" ||
			s == "lrabdc")
	}
}

function solvable(c)
{
	//brute force to see if cubies can be put in the right spot (lazy way)
	if(cso(c))
	{
		return true;
	}
	if(cso_swap(c))
	{
		return false;
	}
	var ms = ["M'", "M", "M2"];
	var us = ["U", "U'", "U2"];
	var initial = ["U", "M'", "M", "U'", "U2", "M2"];
	var p = [];
	for(var d = 0; d < initial.length; d++)
	{
		var newcube = c.doMove(initial[d], true);
		p.push(newcube);
		if(cso(newcube))
		{
			return true;
		}
		if(cso_swap(newcube))
		{
			return false;
		}
	}
	while(true)
	{
		var sc = 0;
		var pc = p.length;
		for(var i = pc - 1; i >= 0; i--)
		{
			var mms = [];
			if(p[i].lmu)
				mms = ms;
			else
				mms = us;
			for(m of mms)
			{
				var newcube = p[i].doMove(m, true);
				p.push(newcube);
				if(cso(newcube))
				{
					return true;
				}
				if(cso_swap(newcube))
				{
					return false;
				}
			}
		}
	}
}

function genstate()
{
	var ret = "";
	var bad = [];
	var cc = 0;

	//randomize bad edges
	for(var i = 0; i < 5; i++)
	{
		bad[i] = Math.floor(Math.random()*1.9999) > 0;
		if(bad[i]) cc++;
	}
	bad[5] = ((cc % 2) == 1);
	
	do
	{
		//randomize piece positions
		var is = ["A","B","C","D","L","R"];
		shuffleArray(is);

		//bring them together
		for(var i = 0; i < 6; i++)
		{
			var c = is[i];
			if(bad[i]) c = c.toLowerCase();
			ret += c;
		}

		var ncube = new LSECube(undefined,ret,0,0);
		ncube.puf = Math.floor(Math.random() * 3.9999);
		if(gc("dFOC"))
		{
			ncube.pms = Math.floor(Math.random() * 1.9999) * 2;
		}
		else
		{
			ncube.pms = Math.floor(Math.random() * 3.9999);
		}
	} while(!solvable(ncube))
	//only give solvable positions (lazy way)
	
	cstate = ncube.sta;
	scramble = solve(ncube);
	return new LSECube(scramble);
}

function upd_ori() {
	window.localStorage.setItem("orientations","010000000000000000000000");
}

function o_menu()
{
	if(!menu_up)
	{
		o_arr.innerHTML="&#9660;";
		menu.style="";
	}
	else
	{
		o_arr.innerHTML="&#9658;";
		menu.style="display:none";
	}
	menu_up = !menu_up;
}

var menu_up = false;
var o_arr = document.getElementById("o_arr");
var menu = document.getElementById("o_menu");
var cols = ["white","yellow","green","blue","red","orange"];
var oris = window.localStorage.getItem("orientations");
if(oris === null) oris = "010000000000000000000000";

var k = 0;
for(var i=0; i<6; i+=2)
{
	var ta = "";
	for(var j=0; j<6; j++)
	{
		if(j==i||j==i+1) continue;
		menu.innerHTML+='<input type="checkbox" onclick="upd_ori()" id="cb'+i+'_'+j+'"'+(oris[k++]=="1"?' checked':'')+'>'+cols[i]+'/'+cols[j]+'<br/>';
		ta+='<input type="checkbox" onclick="upd_ori()" id="cb'+(i+1)+'_'+j+'"'+(oris[k++]=="1"?' checked':'')+'>'+cols[i+1]+'/'+cols[j]+'<br/>';
	}
	menu.innerHTML+=ta;
}


upd();
