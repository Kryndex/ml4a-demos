
// ellipsis settings
// dont save invisible neurons into memory
// inside label: draw value + bias
// draw connection info (w1, or value)


var overwriteObject = function(obj, overwrite){
	Object.keys(overwrite).forEach(function(key,index) {
		if (key in obj) {
			obj[key] = overwrite[key];
		}
	});
};

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
};

function NetworkVisualization(settings) 
{	
	var defaultNeuronStyle = {
		color: 'rgba(0,0,0,0.95)',
		thickness: 6,
		radius: 30,
		labelFont: 'Arial',
		labelSize: 40,
		labelText: '',
		biasLabelFont: 'Arial',
		biasLabelSize: 30,
		biasLabelText: '',
		leftLabelFont: 'Arial',
		leftLabelSize: 28,
		leftLabelText: '',
		leftLabelCounter: false,
		leftLabelMargin: 0,
		ellipsisRadius: 3,
		ellipsisMargin: 10
	};

	var defaultConnectionStyle = {
		color: 'rgba(0,0,0,1)',
        arrowLen: 10,
        arrowWidth: 4.5,
        thickness: 3,
        labelFont: 'Arial',
        labelSize: 24,
        labelText: '',
        labelLerp: 0.5
	};

	var setDefaultNeuronStyle = function(overwrite){
		overwriteObject(defaultNeuronStyle, overwrite);
	};

	var setDefaultConnectionStyle = function(overwrite){
		overwriteObject(defaultConnectionStyle, overwrite);
	};

	var Neuron = function() {
		this.setStyle = function(overwrite){
			overwriteObject(self.style, overwrite);
		};

		this.setup = function(x, y, nIndex, isVisible) {
			this.x = x;
			this.y = y;
			this.nIndex = nIndex;
			this.isVisible = isVisible;
		};

		this.draw = function() {
			if (!this.isVisible) {
				return;
			}
			var s = this.style;

			// neuron
			if (s.radius > 0) {
		        ctx.save();
		        ctx.beginPath();
		        ctx.arc(this.x, this.y, s.radius, 0, 2*Math.PI, false);
		        ctx.strokeStyle = s.color;
		        ctx.lineJoin = ctx.lineCap = 'round';
		        ctx.lineWidth = s.thickness;
		        ctx.stroke();
		        ctx.closePath();
		        ctx.restore();
		    }

	        // neuron text
	        ctx.save();
	        ctx.translate(this.x, this.y);
	        ctx.font = s.labelSize+'px '+s.labelFont;
	        ctx.textAlign = 'center';   
	        ctx.textBaseline = 'middle';        
	        ctx.fillText(s.labelText, 0, 0);
	        ctx.restore();

	        // bias label text
			ctx.save();
	        ctx.translate(this.x, this.y - 0.6*s.radius);
	        ctx.font = s.biasLabelSize+'px '+s.biasLabelFont;
	        ctx.textAlign = 'center';   
	        ctx.textBaseline = 'middle';        
	        ctx.fillText(s.biasLabelText, 0, 0);
	        ctx.restore();

	        // left label
	        ctx.save();
	        ctx.translate(this.x - s.radius - s.leftLabelMargin, this.y);
	        ctx.font = s.leftLabelSize+'px '+s.leftLabelFont;
	        ctx.textAlign = 'right';   
	        ctx.textBaseline = 'middle';
	        ctx.fillText(s.leftLabelText+(s.leftLabelCounter?' '+this.nIndex:''), -3, 0);
	        
	        // left label arrow
	        if (s.leftLabelMargin>0) {
	        	var angH = Math.PI/10.0;
	        	ctx.beginPath();
		    	ctx.moveTo(0, 0);
		    	ctx.lineTo(s.leftLabelMargin-5.0, 0);
		    	ctx.lineTo(s.leftLabelMargin-10.0*Math.cos(-angH),-10.0*Math.sin(-angH));
		    	ctx.moveTo(s.leftLabelMargin-5.0, 0);
		    	ctx.lineTo(s.leftLabelMargin-10.0*Math.cos(+angH),-10.0*Math.sin(+angH));
		    	ctx.stroke();
		    	ctx.closePath();
	        }

	        ctx.restore();
		};

		this.style = clone(defaultNeuronStyle);
		var self = this;
	};

	var Connection = function(neuron1_, neuron2_)
	{
		this.setStyle = function(overwrite){
			overwriteObject(self.style, overwrite);
		};

		this.draw = function()
		{
			if (!neuron1.isVisible || !neuron2.isVisible) {
				return;
			}

			var s = this.style;

			var x1 = neuron1.x;
			var y1 = neuron1.y;
			var x2 = neuron2.x;
			var y2 = neuron2.y;
			
			var offset1 = neuron1.style.radius + neuron1.style.thickness/2.0;
			var offset2 = neuron2.style.radius + neuron2.style.thickness/2.0;

		    var angH = Math.PI/s.arrowWidth;
		    var ang = Math.atan2(y2-y1,x2-x1);
		    var ax1 = x1 + offset1 * Math.cos(ang);
		    var ay1 = y1 + offset1 * Math.sin(ang);
		    var ax2 = x2 - offset2 * Math.cos(ang);
		    var ay2 = y2 - offset2 * Math.sin(ang);        

			var dist = Math.sqrt((ax2-ax1)*(ax2-ax1) + (ay2-ay1)*(ay2-ay1));
			
		    ctx.strokeStyle = s.color;
		    ctx.lineWidth = s.thickness;
		    ctx.lineJoin = ctx.lineCap = 'round';

		    ctx.beginPath();
		    ctx.moveTo(ax1, ay1);
		    ctx.lineTo(ax2, ay2);
		    ctx.lineTo(ax2-s.arrowLen*Math.cos(ang-angH),ay2-s.arrowLen*Math.sin(ang-angH));
		    ctx.moveTo(ax2, ay2);
		    ctx.lineTo(ax2-s.arrowLen*Math.cos(ang+angH),ay2-s.arrowLen*Math.sin(ang+angH));
		    ctx.stroke();
		    ctx.closePath();
		    
		    ctx.save();
		    ctx.translate(ax1, ay1);
		    ctx.rotate(ang);
		    ctx.textAlign = 'center';   
	        ctx.textBaseline = 'bottom';        
	        ctx.font = s.labelSize+'px '+s.labelFont;
		    ctx.fillText(s.labelText, s.labelLerp * dist, -1);
		    ctx.restore();
		};

		var self = this;
		var neuron1 = neuron1_;
		var neuron2 = neuron2_;
		this.style = clone(defaultConnectionStyle);
	};

	this.setup = function() {
    	var s = neurons[0][0].style;
    	ctx.font = s.leftLabelSize+'px '+s.leftLabelFont;
    	var txt = s.leftLabelText+(s.leftLabelCounter?' '+net[0]:'');
    	var leftMargin = ctx.measureText(txt).width + s.leftLabelMargin + 4;
    	var numLayers = net.length;

	    var x0 = leftMargin + rect.x + neurons[0][0].style.radius + 0.5*neurons[0][0].style.thickness;
	    var x1 = rect.x + rect.w - neurons[net.length-1][0].style.radius - 0.5*neurons[net.length-1][0].style.thickness;

	    // setup position
	    ellipsis = [];
	    for (var l=0; l<numLayers; l++) {
	    	var y0 = rect.y + heightBounds[l][0]*rect.h + neurons[l][0].style.radius + 0.5*neurons[l][0].style.thickness;
	    	var y1 = rect.y + heightBounds[l][1]*rect.h - neurons[l][neurons[l].length-1].style.radius - 0.5*neurons[l][neurons[l].length-1].style.thickness;
		    var x = x0 + (x1-x0)*l/(numLayers-1);
	        var numNeurons = net[l];
	        var numVisible = Math.min(visible[l], numNeurons);
	        for (var n=0; n<numNeurons; n++) {
	        	var isVisible = (n < numVisible-1) || (n == numNeurons-1);
	        	var y = (numNeurons == 1) ? y0 + 0.5*(y1-y0) : y0 + (y1-y0)*n/(numVisible-1);
	        	if (numVisible < numNeurons){
	        		y = (n < numVisible-1) ? y0 + (y1-y0) * ((numVisible-1.0)/numVisible) * n / (numVisible-1) : y1;
	        	}
			    neurons[l][n].setup(x, y, n+1, isVisible);
            }
            if (numVisible < numNeurons) {
            	y = y0 + (y1-y0) * (numVisible-1.0) / numVisible;
            	ellipsis.push({x:x, y:y, 
            		radius: neurons[0][0].style.ellipsisRadius, 
            		margin: neurons[0][0].style.ellipsisMargin
            	});
            }
	    }
    };

    this.setHeightBounds = function(hb, layer) {
    	if (layer === undefined) {
    		for (var l=0; l<net.length; l++){
    			heightBounds[l] = hb;
    		}
    	} else {
    		heightBounds[layer] = hb;
    	}
    	this.setup();
    };

    this.setNeuronStyle = function(neuronStyle_, layer, index) {
		if (layer === undefined) {
			neurons.forEach(function(layer){
				layer.forEach(function(n){
					n.setStyle(neuronStyle_);
				});
			});
		} else if (index === undefined) {
			neurons[layer].forEach(function(n){
				n.setStyle(neuronStyle_);
			});
		} else {
			neurons[layer][index].setStyle(neuronStyle_);
		}
		this.setup();
	};

	this.setConnectionStyle = function(connectionStyle_, layer, idxL, idxR) {
		if (layer === undefined) {
			connections.forEach(function(layer){
				layer.forEach(function(neuronLeft){
					neuronLeft.forEach(function(neuronRight){
						neuronRight.setStyle(connectionStyle_);
					});
				});
			});
		} else if (idxL === undefined && idxR === undefined) {
			connections[layer].forEach(function(neuronLeft){
				neuronLeft.forEach(function(neuronRight){
					neuronRight.setStyle(connectionStyle_);
				});
			});
		} else if (idxR === undefined) {
			connections[layer][idxL].forEach(function(neuronRight){
				neuronRight.setStyle(connectionStyle_);
			});
		} else if (idxL === undefined) {
			connections[layer].forEach(function(neuronLeft){
				neuronLeft[idxR].setStyle(connectionStyle_);
			});
		} else {
			connections[layer][idxL][idxR].setStyle(connectionStyle_);
		}
		this.setup();
	};

	var drawEllipsis = function() {
		ellipsis.forEach(function(e){
			ctx.beginPath();
			ctx.arc(e.x, e.y-e.margin, e.radius, 0, 2*Math.PI, false);
			ctx.arc(e.x, e.y,    e.radius, 0, 2*Math.PI, false);
			ctx.arc(e.x, e.y+e.margin, e.radius, 0, 2*Math.PI, false);
			ctx.closePath();
			ctx.fill();
		});
	}

	this.draw = function() {
	    for (var l=0; l<net.length; l++) {
	        for (var n=0; n<net[l]; n++) {
            	neurons[l][n].draw();
            }
	    }
	    drawEllipsis();
	    for (var l=0; l<net.length-1; l++) {
	        for (var j=0; j<net[l]; j++) {
	            for (var k=0; k<net[l+1]; k++) {
	        		connections[l][j][k].draw();        
	            }
	        }        
	    }
	};

	// initialize
	var self = this;
	var ctx = settings.context;
	var rect = settings.rect;
	var visible = settings.visible;
	var net = settings.architecture;

	// overwrite settings
	if (settings.neuronStyle !== undefined) {
		setDefaultNeuronStyle(settings.neuronStyle);
	}
	if (settings.connectionStyle !== undefined) {
		setDefaultConnectionStyle(settings.connectionStyle);
	}

	// create neurons and connectiso
	var neurons = [...Array(net.length).keys()].map(i => [...Array(net[i]).keys()].map(k => new Neuron()));
	var connections = [...Array(net.length-1).keys()].map(i => [...Array(net[i]).keys()].map(j => [...Array(net[i+1]).keys()].map(k => new Connection(neurons[i][j], neurons[i+1][k]))));
	var heightBounds = (settings.heightBounds === undefined) ? [...Array(net.length).keys()].map(i => [0.0, 1.0]) : settings.heightBounds;
	var ellipsis = [];

	// setup positions
	this.setup();
}
