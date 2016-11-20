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

/*
 * The Org Unit Search component is the search bar in the upper left, including
 * the search and advanced search buttons
 * 
 * It's a simple component which animates the advanced search options box.
 * Other than that, it forwards the search to orgUnitService or geoCodeService,
 * depending on the option under advanced search
 */


// For jQuery
declare var $: any;


// Represents the advanced search options
// Used in a ngModel in the HTML page
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

    private advancedSearchVisible = false;
    private searchOptions = new SearchOptions();

    // Used in the advances search form, so the user can filter on levels
    private orgUnitLevels = [];


    constructor(private orgUnitService: OrgUnitService,
                private geocoder: GeocodingService,
                private mapService: MapService) {}


    // Register that it wants notification on orgUnitLevels update
    ngOnInit(): void {
        this.orgUnitService.registerOrgUnitLevelsListener(this);
    }


    // Called when the orgUnitLevels have been updated
    onOrgUnitLevelsUpdate(): void {
        this.orgUnitLevels = Globals.organisationUnitLevels;
    }


    // Gets called when the adanced search button is clicked
    // It pushes the sideBar down during the animation
    toggleAdvancedSearch(): void {
        this.advancedSearchVisible = !this.advancedSearchVisible;

        // Check which top value to assign
        let contentTop = this.advancedSearchVisible ? "240px" : "105px";
        let buttonsTop = this.advancedSearchVisible ? "205px" : "70px";
        let animateSpeed = 200;

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

    // Gets called when the user clicks on the search bar
    // Calls either mapService og geoCodeService depending on the searchType
    search(): void {
        if (this.searchOptions.searchType === "Organisation units") {
            this.orgUnitService.search(this.searchOptions.term, this.searchOptions.level, this.searchOptions.maxLevel);
        } else {
            this.searchLocation(this.searchOptions.term);
        }
    }

    // Calls the geocoder to get the location
    // When the locations is retrived, it zooms to the location and displays it in the search bar
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

}

