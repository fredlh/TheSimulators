import { Component, OnInit, ViewChild, AfterViewInit }    from "@angular/core";
import { FormControl }          from "@angular/forms";
import { Subject }              from "rxjs/Subject";
import { Observable }           from "rxjs/Observable";

import { OrgUnit }              from "../../core/org-unit";

import { OrgUnitService }       from "../../services/org-unit.service";

declare var $: any;

@Component({
    selector: "org-unit-search",
    template: require<any>("./org-unit-search.component.html"),
    styles: [ require<any>("./org-unit-search.component.less") ]
})

export class OrgUnitSearchComponent implements OnInit {
    private searchTerms = new Subject<string>();
    private orgUnits: OrgUnit[];

    constructor(private orgUnitService: OrgUnitService) {}

    printOrgUnits(orgUnits: OrgUnit[]): void {
        for (let i = 0; i < orgUnits.length; i++) {
            console.log("ID: " + orgUnits[i].id);
            console.log("displayName: " + orgUnits[i].displayName);
        }
    }

    advancedSearch(): void {
        $("#advancedSearchDiv").toggle("show");
    }

    search(term: string, level: string, maxLevel: string): void {
        let lvl = level === "All" ? "" : level;
        let maxLvl = maxLevel === "None" ? "" : maxLevel;
        // console.log("level: " + lvl + " | maxLevel: " + maxLvl);
        this.orgUnitService.search(term, lvl, maxLvl);
    }

    ngOnInit(): void {
        // TODO: Auto search on key-press, rather than a button?
    }

    gotoDetail(orgUnit: OrgUnit) {
        console.log("gotoDetail(): " + orgUnit);
    }
}