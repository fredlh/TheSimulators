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
	 


	}
