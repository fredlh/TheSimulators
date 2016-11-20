import {ContentChildren, Component, QueryList, Input, forwardRef, AfterContentInit}     from "@angular/core";
import {AccordionGroupComponent}                                                        from "./accordion-group.component";

import { MapService }                                                                   from "../../services/map.service";
import { OrgUnitService }                                                               from "../../services/org-unit.service";

/*
 * Taken from https://github.com/pleerock/ng2-accordion and modified:
 * - Added css class for hovering
 * - Added orgUnitId input for the sideBar and mapService
 * - Added orgUnitGroupId for the orgUnitGroup panel
 * 
 * Added background color on the heading when selected in the sideBar
 * 
 * Removed som uneccessarry options, such as arrows in the headings
 */

@Component({
    selector: "accordion",
    template: `
            <div class="panel-group" role="tablist" aria-multiselectable="true">
                <ng-content></ng-content>
            </div>
            `
})
export class AccordionComponent implements AfterContentInit {

    constructor(private mapService: MapService, private orgUnitSerivce: OrgUnitService) {}

    @Input()
    closeOthers = true;

    @Input()
    showArrows = false;

    @Input()
    expandAll = false;

    @ContentChildren(forwardRef(() => AccordionGroupComponent))
    groups: QueryList<AccordionGroupComponent>;

    ngAfterContentInit() {
        if (this.expandAll) {
            this.closeOthers = false;
            this.groups.toArray().forEach(group => {
                group.isOpened = true;
            });
        }

        this.orgUnitSerivce.registerAccordion(this);
        this.mapService.registerAccordion(this);
    }

    // Closes all orgUnits, and removes the selected color
    closeAll() {
        this.groups.toArray().forEach(group => {
            group.isOpened = false;
            $("#" + group.orgUnitId).find(".orgUnitHeader").css({"background-color": ""});
        });
    }

    // Toggles the orgUnit with the given ID in the sideBar
    // Also applies the selected background in the header
    toggleOrgUnitInSideBar(orgUnitId: string) {
        this.groups.toArray().forEach(group => {
            if (group.orgUnitId === orgUnitId) {
                group.toggleOpen();
                $("#" + group.orgUnitId).find(".orgUnitHeader").css({"background-color": "#5bc0de"});
            }
        });
    }

}