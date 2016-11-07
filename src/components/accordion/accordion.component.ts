import {ContentChildren, Component, QueryList, Input, forwardRef, AfterContentInit} from "@angular/core";
import {AccordionGroupComponent} from "./accordion-group.component";

import { MapService }       from "../../services/map.service";

@Component({
    selector: "accordion",
    template: `
<div class="panel-group" role="tablist" aria-multiselectable="true">
    <ng-content></ng-content>
</div>
`
})
export class AccordionComponent implements AfterContentInit {

    constructor(private mapService: MapService) {}

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
        
        this.mapService.registerAccordion(this);
    }

    closeAll() {
        this.groups.toArray().forEach(group => {
            group.isOpened = false;
            $("#" + group.orgUnitId).find(".orgUnitHeader").css({"background-color": ""});
        });
    }

    toggleOrgUnitInSideBar(orgUnitId: string) {
        this.groups.toArray().forEach(group => {
            if (group.orgUnitId === orgUnitId) {
                group.toggleOpen();
                $("#" + group.orgUnitId).find(".orgUnitHeader").css({"background-color": "#5bc0de"});
            }
        });
    }

}