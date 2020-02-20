function stm_(m)
{
	switch(m)
	{
		case "M":
			return "M";
		case "m":
			return "M'";
		case "N":
			return "M2";
		case "U":
			return "U";
		case "u":
			return "U'";
		case "V":
			return "U2";
 		default:
			return "####";
	}
}

function invertmove(m)
{
	switch(m)
	{
		case "M":
			return "M'";
		case "M'":
			return "M";
		case "M2":
			return "M2";
		case "U":
			return "U'";
		case "U'":
			return "U";
		case "U2":
			return "U2";

 		default:
			return "####";
	}
}

function stm(s, i)
{
	var ret = "";
	for(var j = s.length-1; j>=0; j--) ret += invertmove(stm_(s[j])) + " ";
	return ret;
}

function FromDict(cube)
{
	var stt = cube.sta + cube.puf + cube.pms;
	if(stt in sdict)
		return sdict[stt];
	else
		return null;
}

function mlen(cube)
{
	return cube.movesdone.split(" ").length;
}

function solve(cube)
{
	var sol = solve_(cube);
	var md = sol.movesdone.split(" ");
	var ret = "";
	for(var i = md.length - 1; i >= 0; i--)
	{
		if(md[i] != "")
		{
			ret += " " + invertmove(md[i]);
		}
	}
	return ret;
}

function solve_(cube)
{
	var solved = false;
	if(LSECube.ss_solved(cube))
	{
		return cube;
	}
	fd = FromDict(cube);
	if(fd !== null)
	{
		for(ff of fd)
		{
			return cube.doMoves(stm(ff), false);
		}
	}

	var ms = ["M'", "M", "M2"];
	var us = ["U", "U'", "U2"];
	var initial = ["U", "M'", "M", "U'", "U2", "M2"];
	var depth = 1;
	var p = [];

	for(var d = 0; d < initial.length; d++)
	{
		var newcube = cube.doMove(initial[d], true);
		p.push(newcube);
		if(LSECube.ss_solved(newcube))
		{
			return newcube;
		}
	}
	while(!solved)
	{
		var sc = 0;
		var pc = p.length;
		depth += 4;
		var mcbest = 99999;
		for(var i = pc - 1; i >= 0; i--)
		{
			var mms = [];
			var omms = [];
			if(p[i].lmu)
			{
				mms = ms;
				omms = us;
			}
			else
			{
				mms = us;
				omms = ms;
			}

			for(m1 of mms)
			{
				for(m2 of omms)
				{
					for(m3 of mms)
					{
						for(m4 of omms)
						{
							var cmv = [m1,m2,m3,m4].join(" ");
							var nwcube = p[i].doMoves(cmv, true);
							p.push(nwcube);
							fd = FromDict(nwcube);
							if(fd !== null)
							{
								for(ff of fd)
								{
									var mvs = stm(ff);
									if(mvs.charAt(0) == m4.charAt(0)) continue;
									return nwcube.doMoves(mvs, true);
								}
							}
						}
					}
				}
			}
		}
	}
}
