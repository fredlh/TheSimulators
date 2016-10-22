import { Component, OnInit, AfterViewInit, OnChanges }    from "@angular/core";

import { OrgUnit }  from "../../core/org-unit";

import { OrgUnitService } from "../../services/org-unit.service";

import { OrgUnitUpdate} from "../../core/org-unit-update.interface";

declare var $:any;

@Component({
    selector: "side-bar",
    template: require<any>("./side-bar.component.html"),
    styles: [ require<any>("./side-bar.component.less") ]
})

export class SideBarComponent implements OrgUnitUpdate, AfterViewInit, OnChanges {
    private orgUnits: OrgUnit[] = null;

    constructor(private orgUnitService: OrgUnitService) {}

    onOrgUnitGet(orgUnits: OrgUnit[]): void {
        this.orgUnits = orgUnits;
        console.log("Side bar - received new orgUnits: " + this.orgUnits);
    }

    ngOnInit(): void {
        this.orgUnitService.registerOrgUnitUpdateListener(this);
    }

    ngAfterViewInit() {
 
    }

    ngOnChanges(): void {
        console.log("CHAAANGE");
    }

    test(): void {
        console.log("teeest");
        $.fn.togglepanels = function(){
            return this.each(function(){
                $(this).addClass("ui-accordion ui-accordion-icons ui-widget ui-helper-reset")
            .find("h3")
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

    }

}