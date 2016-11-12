import { Component, OnInit }              from "@angular/core";
import { FormControl }                    from "@angular/forms";
import { Subject }                        from "rxjs/Subject";
import { Observable }                     from "rxjs/Observable";

import { OrgUnit }                        from "../../core/org-unit.class";

import { OrgUnitService }                 from "../../services/org-unit.service";
import { GeocodingService }               from "../../services/geocoding.service";
import { MapService }                     from "../../services/map.service";
import { SideBarService }                 from "../../services/side-bar.service";

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
                private mapService: MapService,
                private sideBarService: SideBarService) {}

    ngOnInit(): void {
        this.orgUnitService.registerOrgUnitLevelsListener(this);
    }

    onOrgUnitLevelsUpdate(): void {
        this.orgUnitLevels = Globals.organisationUnitLevels;
    }

    advancedSearch(): void {
        this.advancedSearchVisible = !this.advancedSearchVisible;

        // Check which top value to assign
        let contentTop = this.advancedSearchVisible ? "240px" : "105px";
        let buttonsTop = this.advancedSearchVisible ? "205px" : "70px";
        let animateSpeed = 200;

        // If the prevStack button is visible, it needs to be 33 pixels further down
        if (this.sideBarService.isLastFrameStackVisible()) {
            contentTop = (+contentTop.split("p")[0] + 33).toString() + "px";
        }

        // Animate the new values
        $("#sideBarContent").animate({
            top: contentTop,
        }, animateSpeed);

        $("#filterArea").animate({
            top: contentTop,
        }, animateSpeed);

        $("#sideBarButtons").animate({
            top: buttonsTop,
        }, animateSpeed);

        $("#toggleSideBar").animate({
            top: buttonsTop
        }, animateSpeed);

        $("#advancedSearchDiv").slideToggle("fast");
    }

    search(): void {
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

