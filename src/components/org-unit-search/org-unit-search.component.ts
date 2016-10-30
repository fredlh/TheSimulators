import { Component, OnInit, ViewChild, AfterViewInit }    from "@angular/core";
import { FormControl }          from "@angular/forms";
import { Subject }              from "rxjs/Subject";
import { Observable }           from "rxjs/Observable";

import { OrgUnit }              from "../../core/org-unit";

import { OrgUnitService }       from "../../services/org-unit.service";

import { Constants }            from "../../constants/constants";

declare var $: any;

@Component({
    selector: "org-unit-search",
    template: require<any>("./org-unit-search.component.html"),
    styles: [ require<any>("./org-unit-search.component.less") ]
})

export class OrgUnitSearchComponent implements OnInit {
    private searchTerms = new Subject<string>();
    private orgUnits: OrgUnit[];
    private advancedSearchVisible = false;
    private levelToNameMap: String[] = Constants.nameToLevelMapping;
    private constants = Constants;

    constructor(private orgUnitService: OrgUnitService) {}

    advancedSearch(): void {
        this.advancedSearchVisible = !this.advancedSearchVisible;
        let top = this.advancedSearchVisible ? "255px" : "120px";
        let animateSpeed = 200;

        $("#sideBar")
        .animate({
            top: top,
        }, animateSpeed);

        $("#toggleSideBar")
        .animate({
            top: top
        }, animateSpeed);

        $("#advancedSearchDiv").slideToggle("fast");
    }

    search(term: string, level: string, maxLevel): void {
        this.orgUnitService.search(term, level, maxLevel);
    }

    ngOnInit(): void {
        // TODO: Auto search on key-press, rather than a button?
    }

    getAllOrgUnits(): void {
        this.orgUnitService.getAllOrgUnits();
    }

    /*
    getMaxLevel(maxLevel): void {
        if (maxLevel === "Country"){
        maxLevel = "1";

        }
        else if (maxLevel === "Provence"){
        maxLevel = "2";

        }
        if (maxLevel === "District"){
        maxLevel = "3";

        }
        else if (maxLevel === "Unit"){
        maxLevel = "4";
        }
    }
    */
}
// git commit -a -m "en eller annen beskjed"
// git push -u origin map_version
