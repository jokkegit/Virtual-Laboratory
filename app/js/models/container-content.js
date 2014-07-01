/**
 * Model that defines content for a container.
 * @author: Chris Hjorth, www.chrishjorth.com
 */
 
define([
	'underscore',
	'lab-math'
], function(_, LabMath) {

	var defaults = {
		other: null, //Array of strings describing other reagents added
		genes: null,
		microorganisms: null,
		totalLogConcentration: 0
	};
	
	function ContainerContent(options) {
		var i;
		defaults.other = [];
		defaults.genes = [];
		defaults.microorganisms = [];
		_.extend(this, defaults, options);
		for(i = 0; i < this.microorganisms.length; i++) {
			this.totalLogConcentration += this.microorganisms[i].logConcentration;
		}
	}

	ContainerContent.prototype = {
		addContent: addContent,
		hasGene: hasGene,
		hasOther: hasOther,
		findMicroorganism: findMicroorganism,
		isEmpty: isEmpty,
		decreaseConcentration: decreaseConcentration,
		getTotalBiomass: getTotalBiomass,
		updateTotalLogConcentration: updateTotalLogConcentration,
		clone: clone,
		killMicroorganisms: killMicroorganisms
	};
	
	return ContainerContent;

	/**
	 * @param content: {
	 *		genes: [],
	 *		microorganisms: []
	 * }
	 */
	function addContent(content) {
		var i, index;

		//Add genes
		for(i = 0; i < content.genes.length; i++) {
			if(!this.hasGene(content.genes[i])) {
				this.genes.push(content.genes[i]);
			}
		}

		//Add microorganisms
		for(i = 0; i < content.microorganisms.length; i++) {
			index = this.findMicroorganism(content.microorganisms[i]);
			if(index < 0) {
				this.microorganisms.push(content.microorganisms[i]);
			}
			else {
				this.microorganisms[index].logConcentration += content.microorganisms[i].logConcentration;
			}
		}

		//Add other
		for(i = 0; i < content.other.length; i++) {
			this.other.push(content.other[i]);
		}

		//Check if antibiotics are present
		for(i = 0; i < this.other.length; i++) {
			if(this.other[i] === 'antibiotic') {
				this.killMicroorganisms();
			}
		}

		this.updateTotalLogConcentration();

		console.log('Added content to container');
		console.log(this);
	}

	function hasGene(gene) {
		var hasIt = false,
			i = 0;
		while(hasIt === false && i < this.genes.length) {
			if(this.genes[i].equals(gene)) {
				hasIt = true;
			}
			i++;
		}
		return hasIt;
	}

	function hasOther(other) {
		var i = 0;
		while(i < this.other.length) {
			if(this.other[i] === other) {
				return true;
			}
			i++;
		}
		return false;
	}

	function findMicroorganism(microorganism) {
		var i = 0,
			index = -1;
		while(index < 0 && i < this.microorganisms.length) {
			if(this.microorganisms[i].equals(microorganism)) {
				index = i;
			}
			i++;
		}
		return index;
	}

	function isEmpty() {
		return (this.genes.length <= 0 && this.microorganisms.length <= 0 && this.other.length <= 0);
	}

	function decreaseConcentration(amount) {
		var singleMicroorganismAmount = amount / this.microorganisms.length,
			tempLogConcentration;
		for(i = 0; i < this.microorganisms.length; i++) {
			tempLogConcentration = this.microorganisms[i].logConcentration - singleMicroorganismAmount;
			if(tempLogConcentration <= 0) {
				this.totalLogConcentration -= this.microorganisms[i].logConcentration;
				this.microorganisms.splice(i, 1);
			}
			else {
				this.microorganisms[i].logConcentration = tempLogConcentration;
				this.totalLogConcentration -= singleMicroorganismAmount;
			}
		}
	}

	function getTotalBiomass() {
		var totalBiomass = 0,
			i;
		for(i = 0; i < this.microorganisms.length; i++) {
			totalBiomass += LabMath.getBiomassFromLogConcentration(this.microorganisms[i].logConcentration);
		}
		return totalBiomass;
	}

	function updateTotalLogConcentration() {
		var i;
		this.totalLogConcentration = 0;
		for(i = 0; i < this.microorganisms.length; i++) {
			this.totalLogConcentration += this.microorganisms[i].logConcentration;
		}
	}

	function clone() {
		var genes = [],
			microorganisms = [],
			other = [],
			cloned, i;

		for(i = 0; i < this.genes.length; i++) {
			genes.push(this.genes[i].clone());
		}

		for(i = 0; i < this.microorganisms.length; i++) {
			microorganisms.push(this.microorganisms[i].clone());
		}

		for(i = 0; i < this.other.length; i++) {
			other.push(this.other[i]);
		}

		cloned = new ContainerContent({
			genes: genes,
			microorganisms: microorganisms,
			other: other
		});

		return cloned;
	}

	function killMicroorganisms() {
		var i;
		for(i = 0; i < this.microorganisms.length; i++) {
			this.microorganisms[i].die();
		}
		console.log('Killed all microorganisms in container content.');
	}
});
