import { Component, NgZone }    from "@angular/core";

import { OrgUnit }  from "../../core/org-unit";

import { OrgUnitService } from "../../services/org-unit.service";

@Component({
    selector: "side-bar",
    template: require<any>("./side-bar.component.html"),
    styles: [ require<any>("./side-bar.component.less") ]
})

export class SideBarComponent {
    private orgUnits: OrgUnit[] = null;

    constructor(private orgUnitService: OrgUnitService, private zone: NgZone) {}

    checkNewOrgUnits(): void {
        this.orgUnits  = this.orgUnitService.getSavedOrgUnits();
        if (this.orgUnits  === undefined || this.orgUnits === null) {
            this.orgUnits = null;
        }
    }

}