import { Component, OnInit }    from "@angular/core";
import { Subject }              from "rxjs/Subject";

import { OrgUnitSearchService } from "../../services/org-unit-search.service";
import { OrgUnit }              from "../../core/org-unit";

import { OrgUnitService }       from "../../services/org-unit.service";

@Component({
    selector: "org-unit-search",
    template: require<any>("./org-unit-search.component.html"),
    styles: [ require<any>("./org-unit-search.component.less") ],
    providers: [ OrgUnitSearchService ]
})

export class OrgUnitSearchComponent {
    private searchTerms = new Subject<string>();
    private orgUnit: OrgUnit;

    constructor(private orgUnitService: OrgUnitService) {}

    printOrgUnits(orgUnits: OrgUnit[]): void {
        for (var i = 0; i < orgUnits.length; i++) {
            console.log("ID: " + orgUnits[i].id);
            console.log("displayName: " + orgUnits[i].displayName);
        }
        this.orgUnit = orgUnits[0];
    }

    search(term: string): void {
        this.searchTerms.next(term);

        this.orgUnitService.getOrgUnits().subscribe(res => this.printOrgUnits(res.organisationUnits));
    }

  
}