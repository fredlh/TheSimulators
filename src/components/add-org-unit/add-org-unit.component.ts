import { Component, OnInit } from "@angular/core";

import {OrgUnit} from "../../core/org-unit";

import {Constants} from "../../constants/constants";

import {OrgUnitService} from "../../services/org-unit.service";

declare var $: any;

@Component({
    selector: "add-org-unit",
    template: require<any>("./add-org-unit.component.html"),
    styles: [ require<any>("./add-org-unit.component.less") ]
})

export class AddOrgUnitComponent implements OnInit {

    private orgUnit: OrgUnit = new OrgUnit();
    private self = this;
    private constants = Constants;

    constructor(private orgUnitService: OrgUnitService) {}

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
              
    }   

    onOpen(): void {
        document.getElementById("addOrgUnitArea").style.display = "block";
    }

    onSubmit(): void {
        document.getElementById("addOrgUnitArea").style.display = "none";
        
    }

    onCancel(): void {
        document.getElementById("addOrgUnitArea").style.display = "none";
        this.orgUnit = new OrgUnit();
    }

    closePanel(): void {
        document.getElementById("addOrgUnitArea").style.display = "none";
    }

    drawOrgUnit(): void {
        this.closePanel();
        $("#drawOrgUnitPanelArea").slideToggle("fast");
        this.orgUnitService.callAddNewPolygon();
    }

    saveDrawnOrgUnit(): void {
        $("#drawOrgUnitPanelArea").slideToggle("fast");
        this.onOpen();
    }

    cancelDrawnOrgUnit(): void {
        $("#drawOrgUnitPanelArea").slideToggle("fast");
        this.onOpen();
    }
}