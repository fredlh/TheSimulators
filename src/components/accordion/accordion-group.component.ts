import {Component, Input, Host, forwardRef, Inject, ContentChild, ElementRef} from "@angular/core";

import {AccordionComponent}                                                   from "./accordion.component";
import {AccordionToggleComponent}                                             from "./accordion-toggle.component";

import { MapService }                                                         from "../../services/map.service";
import { SideBarService }                                                     from "../../services/side-bar.service";
import { OrgUnitService }                                                     from "../../services/org-unit.service";

@Component({
    selector: "accordion-group",
    template: require<any>("./accordion-group.component.html"),
    styles: [ require<any>("./accordion-group.component.less") ]
})
export class AccordionGroupComponent {

    @Input()
    heading: string;

    @Input()
    orgUnitId: string = "";

    @Input()
    orgUnitGroupId: string = "";

    @Input()
    orgUnitGroupIndex: number;

    @Input()
    isOpened: boolean = false;

    @ContentChild(AccordionToggleComponent)
    toggler: ElementRef;

    constructor(private mapService: MapService, private sideBarService: SideBarService, private orgUnitService: OrgUnitService,
                @Host() @Inject(forwardRef(() => AccordionComponent)) public accordion: AccordionComponent) {}

    checkAndToggle() {
        // If custom toggle element is supplied, then do nothing, custom toggler will take care of it
        if (this.toggler)
            return;

        this.toggle();
    }

    toggle() {
        const isOpenedBeforeWeChange = this.isOpened;
        if (this.accordion.closeOthers)
            this.accordion.closeAll();

        this.isOpened = !isOpenedBeforeWeChange;

        // If orgUnitGroupId is specified, notify the orgUnitService of the opened group and return
        if (this.orgUnitGroupId !== "" && this.isOpened) {
            this.orgUnitService.orgUnitGroupOpened(this.orgUnitGroupId, this.orgUnitGroupIndex);
            return;
        }

        // If no orgUnitId is speficied, return as the rest is irrelevant then
        if (this.orgUnitId === "") return;

        // If opened, notify the mapService and sideBar, and set the selected color
        if (this.isOpened) {
            this.mapService.selectMap(this.orgUnitId);
            this.sideBarService.appendParent(this.orgUnitId);
            $("#" + this.orgUnitId).find(".orgUnitHeader").css({"background-color": "#5bc0de"});

        // If closed, notify the mapService
        } else {
            this.mapService.deselectMap();
        }
    }

    // Opens the orgUnit in the sideBar
    // Called when the user selects an orgUnit on the map
    toggleOpen() {
        if (this.isOpened) return;

        const isOpenedBeforeWeChange = this.isOpened;
        if (this.accordion.closeOthers)
            this.accordion.closeAll();

        this.isOpened = !isOpenedBeforeWeChange;
    }

}