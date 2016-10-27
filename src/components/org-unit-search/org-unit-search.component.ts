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
    private advancedSearchVisible = false;

    constructor(private orgUnitService: OrgUnitService) {}

    printOrgUnits(orgUnits: OrgUnit[]): void {
        for (let i = 0; i < orgUnits.length; i++) {
            console.log("ID: " + orgUnits[i].id);
            console.log("displayName: " + orgUnits[i].displayName);
        }
    }

    advancedSearch(): void {
        this.advancedSearchVisible = !this.advancedSearchVisible;
        let top = this.advancedSearchVisible ? "255px" : "120px";
        let height = this.advancedSearchVisible ? "685px" : "820px";
        let animateSpeed = 200;

        $("#sideBar").animate({
            top: top,
            height: height
        }, animateSpeed);
        $("#toggleSideBar").animate({
            top: top
        }, animateSpeed);
        
        $("#advancedSearchDiv").slideToggle("fast");
    }

    search(term: string, level: string, maxLevel): void {
        let prvns = "Provence";
        let dist = "District";
        let country = "Country";
        let unit = "Unit";

        if (level === country) {
        level = "1";
        let lvl = level === "All" ? "" : level;
        let maxLvl = maxLevel === "None" ? "" : maxLevel;
        this.orgUnitService.search(term, lvl, maxLvl);
        }
        else if (level === prvns) {
        level = "2";
        maxLevel = this.getMaxLevel(maxLevel);
        let lvl = level === "All" ? "" : level;
        let maxLvl = maxLevel === "None" ? "" : maxLevel;
        this.orgUnitService.search(term, lvl, maxLvl);
        }
        else if (level === dist) {
        level = "3";
        let lvl = level === "All" ? "" : level;
        let maxLvl = maxLevel === "None" ? "" : maxLevel;
        this.orgUnitService.search(term, lvl, maxLvl);
        }
        else if (level === unit) 
        {
        level = "4";
        maxLevel = this.getMaxLevel(maxLevel);
        let lvl = level === "All" ? "" : level;
        let maxLvl = maxLevel === "None" ? "" : maxLevel;
        this.orgUnitService.search(term, lvl, maxLvl);
        }

    }

    ngOnInit(): void {
        // TODO: Auto search on key-press, rather than a button?
    }

    getAllOrgUnits(): void {
        this.orgUnitService.getAllOrgUnits();
    }
    getMaxLevel(maxLevel): void {
        if (maxLevel === "Provence"){
        maxLevel = "2";

        }
        else if (maxLevel === "Unit"){
        maxLevel = "4";
        }
    }
}
// git commit -a -m "en eller annen beskjed"
// git push -u origin map_version