var colourscheme = ["#FFF","#1C1","#FF0","#44D","#F92","#E33"];		//U F D B L R
									//W G Y B O R
class LSECube
{
	constructor(scramble, state, puface, pmslice)
	{
		this.movesdone = "";
		this.csc = colourscheme.slice();
		this.lmu = -1;
		if(state===undefined)
		{
			this.sta = "LRABCD";
			this.puf = 0;
			this.pms = 0;
			if(scramble!==undefined) this.doMoves(scramble, false);
			this.movesdone = "";
		}
		else
		{
			this.sta = state;
			this.puf = puface;
			this.pms = pmslice;
		}
	}

	clone()
	{
		var ret = new LSECube(undefined, this.sta, this.puf, this.pms);
		ret.csc = this.csc.slice();
		ret.movesdone = this.movesdone;
		return ret;
	}

	rotate(m)
	{
		var pc = this.csc.slice();
		switch(m)
		{
			case "x":
				this.csc = [pc[1],pc[2],pc[3],pc[0],pc[4],pc[5]];
				break;
			case "x'":
				this.csc = [pc[3],pc[0],pc[1],pc[2],pc[4],pc[5]];
				break;
			case "x2":
				this.csc = [pc[2],pc[3],pc[0],pc[1],pc[4],pc[5]];
				break;

			case "y":
				this.csc = [pc[0],pc[5],pc[2],pc[4],pc[1],pc[3]];
				break;
			case "y'":
				this.csc = [pc[0],pc[4],pc[2],pc[5],pc[3],pc[1]];
				break;
			case "y2":
				this.csc = [pc[0],pc[3],pc[2],pc[1],pc[5],pc[4]];
				break;

			case "z":
				this.csc = [pc[4],pc[1],pc[5],pc[3],pc[2],pc[0]];
				break;
			case "z'":
				this.csc = [pc[5],pc[1],pc[4],pc[3],pc[0],pc[2]];
				break;
			case "z2":
				this.csc = [pc[2],pc[1],pc[0],pc[3],pc[5],pc[4]];
				break;
		}
	}

	doMove(m, clone)
	{
		var ret;
		if(clone)
		{
			ret = this.clone();
		}
		else
		{
			ret = this;
		}

		switch(m)
		{
			case "U":
				ret.sta = this.sta.charAt(3) + this.sta.charAt(2) + this.sta.substr(0,2) + this.sta.substr(4,2);
				ret.puf = this.mod(this.puf + 1, 4);
				ret.lmu = 1;
				break;
			case "U'":
				ret.sta = this.sta.substr(2,2) + this.sta.charAt(1) + this.sta.charAt(0) + this.sta.substr(4,2);
				ret.puf = this.mod(this.puf - 1, 4);
				ret.lmu = 1;
				break;
			case "U2":
				ret.sta = this.sta.charAt(1) + this.sta.charAt(0) + this.sta.charAt(3) + this.sta.charAt(2) + this.sta.substr(4,2);
				ret.puf = this.mod(this.puf + 2, 4);
				ret.lmu = 1;
				break;
			case "M":
				ret.sta = this.sta.substr(0,2) + this.swapcase(this.sta.charAt(5) + this.sta.substr(2,3));
				ret.pms = this.mod(this.pms + 1, 4);
				ret.lmu = 0;
				break;
			case "M'":
				ret.sta = this.sta.substr(0,2) + this.swapcase(this.sta.substr(3,3) + this.sta.charAt(2));
				ret.pms = this.mod(this.pms - 1, 4);
				ret.lmu = 0;
				break;
			case "M2":
				ret.sta = this.sta.substr(0,2) + this.sta.substr(4,2) + this.sta.substr(2,2);
				ret.pms = this.mod(this.pms + 2, 4);
				ret.lmu = 0;
				break;
			default:
				//not valid move; could be empty(or someone trying to do E2 M2 E2 M2, hehe)
				return ret;
		}

		ret.movesdone += m + " ";

		return ret;
	}

	doMoves(ms, clone)
	{
		var ret;
		if(clone)
		{
			ret = this.clone();
		}
		else
		{
			ret = this;
		}

		var mss = ms.split(" ")

		for(var i = 0; i < mss.length; i++)
		{
			ret.doMove(mss[i], false);
		}

		return ret;
	}

	//P is position in state (LRABCD). N is 1 if side color, 0 if top/bottom
	col(p,n)
	{
		var v = this.sta.charAt(p);
		var b = (v == v.toUpperCase()) ^ (n == 1);
		switch(v.toUpperCase())
		{
			case "L":
				return b ? this.colF(4) : this.colF(0);
			case "R":
				return b ? this.colF(5) : this.colF(0);
			case "A":
				return b ? this.colF(3) : this.colF(0);
			case "B":
				return b ? this.colF(1) : this.colF(0);
			case "C":
				return b ? this.colF(1) : this.colF(2);
			case "D":
				return b ? this.colF(3) : this.colF(2);
			default:
				return "#000";
		}
	}

	mod(x, m)
	{
		return (x % m + m) % m;
	}

	//012345
	//UFDBLR
	colF(i)
	{
		return this.csc[i];
	}

	colM(i)
	{
		return this.colF(this.mod(i - this.pms, 4));
	}

	//0123
	//LBRF
	colC(i)
	{
		return this.colF([4,3,5,1][this.mod(i - this.puf, 4)]);
	}

	swapcase(s)
	{
		var ret = "";
		for(var i = 0; i < s.length; i++)
		{
			if(s[i] === s[i].toLowerCase())
				ret += s[i].toUpperCase();
			else
				ret += s[i].toLowerCase();
		}
		return ret;
	}

	//Solve states
	static ss_solved(cube)
	{
		return (cube.sta == "LRABCD") && (cube.puf == 0) && (cube.pms == 0);
	}

	static ss_EO(cube)
	{
		var mc_ret = true;
		for(var i = 0; i < cube.sta.length; i++)
		{
			var c = cube.sta[i];
			if(cube.pms % 2 == 1)
			{
				if(!allowmc) return false;
				if(!("LRabcdXz".indexOf(c) > -1)) mc_ret = false;
			}
			else
			{
				if(c === c.toLowerCase()) return false;
			}
		}
		if(allowufub && allowmc)
		{
			if(!mc_ret)
			{
				for(var i = 0; i < cube.sta.length; i++)
				{
					var c = cube.sta[i];
					if(!("lrABcdXz".indexOf(c) > -1)) return false;
				}
			}
		}
		else return mc_ret;
		return true;
	}

	static paired(s)
	{
		if(allowufub)
			return s == "LR" || s == "RL" || s == "AB" || s == "BA" || s == "XX";
		else
			return s == "LR" || s == "RL" || s == "XX";
	}

	static LRorFB(cube, solved)
	{
		if(!LSECube.ss_EO(cube)) return false;
		if(!solved)
		{
			for(var i = 0; i < 6; i+=2)
			{
				if(LSECube.paired(cube.sta.substr(i,2))) return true;
			}
			return false;
		}
		else
		{
			var s1 = cube.sta.substr(0,2);
			var s2 = cube.sta.substr(2,2);
			switch(cube.puf)
			{
				case 0:
					return s1 == "XX" || s1 == "LR" || (s2 == "AB" && allowufub);
				case 1:
					return s2 == "XX" || s2 == "LR" || (s1 == "BA" && allowufub);
				case 2:
					return s1 == "XX" || s1 == "RL" || (s2 == "BA" && allowufub);
				case 3:
					return s2 == "XX" || s2 == "RL" || (s1 == "AB" && allowufub);
				default:
					console.log("uhhhh");
					return false;
			}
		}
	}

	static ss_EOLR(cube)
	{
		return LSECube.LRorFB(cube, false);
	}

	static ss_EOLRb(cube)
	{
		return LSECube.LRorFB(cube, true);
	}
}
