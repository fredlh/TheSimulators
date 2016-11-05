import { Component, OnInit, ViewChild, AfterViewInit }    from "@angular/core";
import { FormControl }          from "@angular/forms";
import { Subject }              from "rxjs/Subject";
import { Observable }           from "rxjs/Observable";

import { OrgUnit }              from "../../core/org-unit";

import { OrgUnitService }       from "../../services/org-unit.service";

import { Globals }            from "../../globals/globals";

import { GlobalsUpdateInterface} from "../../core/globals-update.interface";


declare var $: any;

@Component({
    selector: "org-unit-search",
    template: require<any>("./org-unit-search.component.html"),
    styles: [ require<any>("./org-unit-search.component.less") ]
})

export class OrgUnitSearchComponent implements GlobalsUpdateInterface, OnInit {
    private searchTerms = new Subject<string>();
    private orgUnits: OrgUnit[];
    private advancedSearchVisible = false;
    private orgUnitLevels = [];

    constructor(private orgUnitService: OrgUnitService) {}

    onOrganisationUnitLevelsUpdate(): void {
        this.orgUnitLevels = Globals.organisationUnitLevels;
    }

    ngOnInit(): void {
        this.orgUnitService.registerGlobalsUpdateListener(this);
    }


    advancedSearch(): void {
        this.advancedSearchVisible = !this.advancedSearchVisible;
        let top = this.advancedSearchVisible ? "255px" : "120px";
        let animateSpeed = 200;

        $("#sideBar").animate({
            top: top,
        }, animateSpeed);

        $("#toggleSideBar").animate({
            top: top
        }, animateSpeed);

        $("#advancedSearchDiv").slideToggle("fast");
    }

    search(term: string, level: string, maxLevel): void {
        this.orgUnitService.search(term, level, maxLevel);
    }

    getAllOrgUnits(): void {
        this.orgUnitService.getAllOrgUnits();
    }

}

