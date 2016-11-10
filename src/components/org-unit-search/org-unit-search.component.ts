import { Component, OnInit }              from "@angular/core";
import { FormControl }                    from "@angular/forms";
import { Subject }                        from "rxjs/Subject";
import { Observable }                     from "rxjs/Observable";

import { OrgUnit }                        from "../../core/org-unit.class";

import { OrgUnitService }                 from "../../services/org-unit.service";
import { GeocodingService }               from "../../services/geocoding.service";
import { MapService }                     from "../../services/map.service";

import { Globals }                        from "../../globals/globals.class";

import { OrgUnitLevelsUpdateInterface}    from "../../core/org-unit-levels-update.interface";

import {Map} from "leaflet";


declare var $: any;

class SearchOptions {
    term: string = "";
    level: string = "All";
    maxLevel: string = "None";
    searchType: string = "Organisation units";
}

@Component({
    selector: "org-unit-search",
    template: require<any>("./org-unit-search.component.html"),
    styles: [ require<any>("./org-unit-search.component.less") ]
})

export class OrgUnitSearchComponent implements OnInit, OrgUnitLevelsUpdateInterface {
    private searchTerms = new Subject<string>();
    private orgUnits: OrgUnit[];
    private advancedSearchVisible = false;
    private orgUnitLevels = [];

    private searchOptions = new SearchOptions();

    constructor(private orgUnitService: OrgUnitService,
                private geocoder: GeocodingService,
                private mapService: MapService) {}

    ngOnInit(): void {
        this.orgUnitService.registerOrgUnitLevelsListener(this);
    }

    onOrgUnitLevelsUpdate(): void {
        this.orgUnitLevels = Globals.organisationUnitLevels;
    }

    advancedSearch(): void {
        this.advancedSearchVisible = !this.advancedSearchVisible;
        let top = this.advancedSearchVisible ? "205px" : "70px";
        let animateSpeed = 200;

        $("#sideBar").animate({
            top: top,
        }, animateSpeed);

        $("#toggleSideBar").animate({
            top: top
        }, animateSpeed);

        $("#advancedSearchDiv").slideToggle("fast");
    }

    search(): void {
        console.log(this.searchOptions);
        
        if (this.searchOptions.searchType === "Organisation units") {
            this.orgUnitService.search(this.searchOptions.term, this.searchOptions.level, this.searchOptions.maxLevel);
        } else {
            this.searchLocation(this.searchOptions.term);
        }
        
    }

    searchLocation(location: string) {
        this.geocoder.geocode(location).subscribe(
            location => {
                this.mapService.map.fitBounds(location.viewBounds, {});
                this.searchOptions.term = location.address;
            },
            error => {
                console.error(error);
            }
        );
    }

    getAllOrgUnits(): void {
        this.orgUnitService.getAllOrgUnits();
    }

}

