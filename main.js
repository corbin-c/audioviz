function Svg(min_x,min_y,max_x,max_y)
{
	this.min_x = min_x;
	this.min_y = min_y;
	this.max_x = max_x;
	this.max_y = max_y;
	this.delta_x = max_x-min_x;
	this.delta_y = max_y-min_y;
	this.id = "svg"+new Date().valueOf();
	this.svg = document.createElementNS(svgns, "svg");
	this.svg.setAttribute("style","transform: scale(1,-1);")
	this.svg.setAttribute("id", this.id)
	this.svg.setAttribute("xmlns", svgns)	
	this.svg.setAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink")
	this.svg.setAttributeNS(null, 'viewBox', min_x+" "+min_y+" "+this.delta_x+" "+this.delta_y);
	document.querySelector("body").append(this.svg);
}
Svg.prototype.axis = function(step)
{
	this.step = step;
	x = document.createElementNS(svgns, "line");
	y = document.createElementNS(svgns, "line");
	x.setAttributeNS(null,"x2",this.max_x);
	x.setAttributeNS(null,"x1",this.min_x);
	x.setAttributeNS(null,"stroke","black");
	y.setAttributeNS(null,"y2",this.max_y);
	y.setAttributeNS(null,"y1",this.min_y);
	y.setAttributeNS(null,"stroke","black");
	arrow_x = document.createElementNS(svgns, "polyline");
	arrow_x.setAttributeNS(null,"stroke","black");
	arrow_x.setAttributeNS(null,"fill","black");
	arrow_y = document.createElementNS(svgns, "polyline");
	arrow_y.setAttributeNS(null,"stroke","black");
	arrow_y.setAttributeNS(null,"fill","black");

	arrow_x.setAttributeNS(null,"points",(this.max_x-this.delta_x/100)+","+(-this.delta_y/200)+" "+(this.max_x-this.delta_x/100)+","+(this.delta_y/200)+" "+(this.max_x)+",0");
	arrow_y.setAttributeNS(null,"points",(-this.delta_x/200)+","+(this.max_y-this.delta_y/100)+" "+(this.delta_x/200)+","+(this.max_y-this.delta_y/100)+" 0,"+(this.max_y));
	//svg = document.getElementById(this.id);
	this.svg.append(x)
	this.svg.append(y)
	this.svg.append(arrow_x)
	this.svg.append(arrow_y)
	var i = this.min_x;
	for (i=this.min_x;i<this.max_x;i=i+step)
	{
		vstep = document.createElementNS(svgns, "line");
		vstep.setAttributeNS(null,"y2",(-this.delta_y/200));
		vstep.setAttributeNS(null,"y1",(this.delta_y/200));
		vstep.setAttributeNS(null,"x1",i);
		vstep.setAttributeNS(null,"x2",i);
		vstep.setAttributeNS(null,"stroke","black");
		this.svg.append(vstep)
	}
	var i = this.min_y;
	for (i=this.min_y;i<this.max_y;i=i+step)
	{
		vstep = document.createElementNS(svgns, "line");
		vstep.setAttributeNS(null,"x2",(-this.delta_x/200));
		vstep.setAttributeNS(null,"x1",(this.delta_x/200));
		vstep.setAttributeNS(null,"y1",i);
		vstep.setAttributeNS(null,"y2",i);
		vstep.setAttributeNS(null,"stroke","black");
		this.svg.append(vstep)
	}
}

Svg.prototype.draw = async function(limits_x,limits_y,step)
{
	var x = limits_x[0];
	for (x=limits_x[0];x<limits_x[1];x=x+step)
	{
		y = Math.sin(Math.sqrt(x));
		point = document.createElementNS(svgns, "circle");
		point.setAttributeNS(null,"cx",x*(this.max_x/limits_x[1]));
		point.setAttributeNS(null,"cy",y*(this.max_y/limits_y[1]));
		point.setAttributeNS(null,"r",2);
		point.setAttributeNS(null,"fill","#d17");
		this.svg.append(point)
		await incr_wait(0,0)
	}
}
Svg.prototype.fourier = async function(data,time)
{
	for (x in data)
	{
		var com_x = x;
		var com_y = data[x];
	//	com_x = (2*Math.PI*com_x);
		com_y = data[x]*Math.sin(com_x)*1.5;
		com_x = data[x]*Math.cos(com_x)*1.5;
		point = document.getElementById("p_"+x)
		point.setAttributeNS(null,"cx",com_x);
		point.setAttributeNS(null,"cy",com_y);
		//this.svg.append(point)
	//	await incr_wait(0,0)
	}
}
Svg.prototype.init_graph = function(items)
{
	group = document.createElementNS(svgns, "g");
	this.svg.append(group)
	var i = 0;
	for (i=0;i<items;i++)
	{
		point = document.createElementNS(svgns, "circle");
		point.setAttributeNS(null,"id","p_"+i);
		point.setAttributeNS(null,"cx",0);
		point.setAttributeNS(null,"cy",0);
		point.setAttributeNS(null,"r",1);
		point.setAttributeNS(null,"fill","#d17");
		group.append(point)
	}
}
Svg.prototype.osc = async function(data,time)
{
	for (x in data)
	{
		point = document.getElementById("p_"+x)
		point.setAttributeNS(null,"cx",x*(this.delta_x/data.length)-this.max_x);
		point.setAttributeNS(null,"cy",((this.delta_y/256)*data[x]-this.max_y)*0.8);
	}
}
var svg = new Svg(-500,-500,500,500);
function incr_wait(i,t,rand=false)
{
	t = (rand) ? Math.floor(t+2*t*Math.random()):t;
	return new Promise(function(resolve,reject){
		setTimeout(function(){
			resolve(i+1);
		},t)
	})
}
