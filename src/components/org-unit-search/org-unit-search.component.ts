import { Component, OnInit, ViewChild, AfterViewInit }    from "@angular/core";
import { FormControl }          from "@angular/forms";
import { Subject }              from "rxjs/Subject";
import { Observable }           from "rxjs/Observable";

import { OrgUnit }              from "../../core/org-unit";

import { OrgUnitService }       from "../../services/org-unit.service";

declare var $:any;

@Component({
    selector: "org-unit-search",
    template: require<any>("./org-unit-search.component.html"),
    styles: [ require<any>("./org-unit-search.component.less") ]
})

export class OrgUnitSearchComponent implements OnInit, AfterViewInit {
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
        console.log("yo");


        $.fn.togglepanels = function(){
            return this.each(function(){
                $(this).addClass("ui-accordion ui-accordion-icons ui-widget ui-helper-reset")
            .find("h5")
                .addClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-top ui-corner-bottom")
                .hover(function() { $(this).toggleClass("ui-state-hover"); })
                .prepend('<span class="ui-icon ui-icon-triangle-1-e"></span>')
                .click(function() {
                $(this)
                    .toggleClass("ui-accordion-header-active ui-state-active ui-state-default ui-corner-bottom")
                    .find("> .ui-icon").toggleClass("ui-icon-triangle-1-e ui-icon-triangle-1-s").end()
                    .next().slideToggle();
                return false;
                })
                .next()
                .addClass("ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom")
                .hide();
            });
        };

        $("#notaccordion").togglepanels();

        $("#advancedSearchDiv").toggle('show');
    }

    doAdvancedSearch(query:string, level: string, maxLevel: string): void {
        console.log("Perform advanced search:");
        console.log("level: " + level + " | maxLevel: " + maxLevel);

        let urlString = "&query=" + query;
        if (+level !== 0) urlString += "&level=" + +level;
        if (+maxLevel !== 0) urlString += "&maxLevel=" + +maxLevel;

        console.log("URL: " + urlString);

        this.orgUnitService.search(urlString);
    }

    ngAfterViewInit() {
       
    }

    search(term: string): void {
        this.orgUnits = this.orgUnitService.search(term);
    }

    ngOnInit(): void {
        // TODO: Auto search on key-press, rather than a button?
    }

    gotoDetail(orgUnit: OrgUnit) {
        console.log("gotoDetail(): " + orgUnit);
    }
}