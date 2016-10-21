import { Component, OnInit }    from "@angular/core";

import { OrgUnit }  from "../../core/org-unit";

import { OrgUnitService } from "../../services/org-unit.service";

import { OrgUnitUpdate} from "../../core/org-unit-update.interface";

@Component({
    selector: "side-bar",
    template: require<any>("./side-bar.component.html"),
    styles: [ require<any>("./side-bar.component.less") ]
})

export class SideBarComponent implements OrgUnitUpdate {
    private orgUnits: OrgUnit[] = null;

    constructor(private orgUnitService: OrgUnitService) {}

    onOrgUnitGet(orgUnits: OrgUnit[]): void {
        this.orgUnits = orgUnits;
        console.log("Side bar - received new orgUnits: " + this.orgUnits);
    }

    ngOnInit(): void {
        this.orgUnitService.registerOrgUnitUpdateListener(this);
    }

}