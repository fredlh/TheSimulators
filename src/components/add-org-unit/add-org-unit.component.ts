import { Component, OnInit } from "@angular/core";

import {OrgUnit} from "../../core/org-unit";

@Component({
    selector: "add-org-unit",
    template: require<any>("./add-org-unit.component.html"),
    styles: [ require<any>("./add-org-unit.component.less") ]
})

export class AddOrgUnitComponent implements OnInit {

    private orgUnit: OrgUnit = new OrgUnit();
    private self = this;

    openAddOrgUnitForm(): void {
        $("#addOrgUnitButton").click(this.onOpen);
        $(".add-org-unit-close").click(this.onCancel);

        let tmpThis = this;
        window.onclick = function(event) {
            let options = document.getElementById("addOrgUnitArea");
            if (event.target === options) {
                options.style.display = "none";
                tmpThis.orgUnit = new OrgUnit();
            }
        };
    }

    ngOnInit(): void {
        this.orgUnit.coordinates = "[1]";        
    }   

    onOpen(): void {
        document.getElementById("addOrgUnitArea").style.display = "block";
    }

    onSubmit(): void {
        console.log(this.orgUnit);
    }

    onCancel(): void {
        let options = document.getElementById("addOrgUnitArea").style.display = "none";
        this.orgUnit = new OrgUnit();
    }

    drawOrgUnit(): void {
        console.log("DRAW");
    }
}