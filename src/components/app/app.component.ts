	import { Component } from "@angular/core";
	import { OrganisationUnit } from "../../services/organisationUnit";
	import { OrgUnitService }       from "../../services/org-unit.service";


	@Component({
	    selector : "app",
	    template: require<any>("./app.component.html"),
	    styles: [ require<any>("./app.component.less") ]
	})

	export class AppComponent { 

	public organisationUnit = [];
	     private organisationUnits;
	 
	     model = new OrganisationUnit('', '', '');
	 
	 
	    constructor(
	       private orgUnitService : OrgUnitService ,
	    ) { this.loadList() }
	 
	    loadList(): void {
	        this.orgUnitService.getOrgUnits("")
	            .subscribe( res => this.updateList(res.organisationUnits) );
	    }
	 
	     updateList( organisationUnits ): void {
	        console.log(organisationUnits);
	        console.log(organisationUnits.length);
	        this.organisationUnit = [];
	        for(let i = 0; i < organisationUnits.length; i++){
	            console.log(organisationUnits[i]);
	            this.organisationUnit.push(organisationUnits[i]);
	         }

	        console.log(this.organisationUnit);
	 	}
	    newUnit(): void {
	        console.log(this.model);
	        this.orgUnitService.saveOrgUnits(this.model)
	            .subscribe(this.loadList())
	            .then(this.loadList());
	    }


	}
