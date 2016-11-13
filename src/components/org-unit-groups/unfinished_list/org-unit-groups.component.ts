import { Component, ElementRef, Renderer, AfterViewInit }  from "@angular/core";

import { OrgUnitService}                    from "../../services/org-unit.service";
import { SideBarService}                    from "../../services/side-bar.service";

import { OrgUnitGroupsUpdateInterface }     from "../../core/org-unit-groups-update.interface";

import { OrgUnit }                          from "../../core/org-unit.class";
import { Globals, OrganisationUnitGroup }   from "../../globals/globals.class";

const callps = require<any>("../../../CollapsibleLists.js");

declare var CollapsibleLists: any;

@Component({
    selector: "org-unit-groups",
    template: require<any>("./org-unit-groups.component.html"),
    styles: [ require<any>("./org-unit-groups.component.less")]
})


export class OrgUnitGroupsComponent implements OrgUnitGroupsUpdateInterface {

    private orgUnitGroups: OrganisationUnitGroup[] = [];
    private orgUnits = [];
    private displayedOrgUnits = [];
    private hasRetrievedChildren = [];

    private openedId;
    private openedIndex;

    private listenFunc: Function;


    constructor(private orgUnitService: OrgUnitService,
                private sideBarService: SideBarService,
                private elementRef: ElementRef,
                private rendered: Renderer) {
        this.orgUnitService.registerOrgUnitGroupsListener(this);
        this.orgUnitService.registerOrgUnitGroups(this);

        let tmpThis = this;
        this.listenFunc = rendered.listen(elementRef.nativeElement, "click", (event) => {
            tmpThis.elementClicked(event);
        });
    }


    onOrgUnitGroupsUpdate(): void {
        this.orgUnitGroups = Globals.organisationUnitGroups;
    }

    toggleOrgUnitGroups(): void {
        this.showOrgUnitGroupsPanel();

        let tmpThis = this;
        $(".org-unit-groups-close").click(function() {
            tmpThis.onCancel(tmpThis);
        });

        window.onclick = function(event) {
            if (event.target === document.getElementById("orgUnitGroupsArea")) {
                tmpThis.onCancel(tmpThis);
            }
        };
    }

    showOrgUnitGroupsPanel(): void {
        document.getElementById("orgUnitGroupsArea").style.display = "block";
        this.sideBarService.hideSideBar();
    }

    hideOrgUnitGroupsPanel(): void {
        document.getElementById("orgUnitGroupsArea").style.display = "none";
        this.sideBarService.unHideSideBar();
    }

    onCancel(tmpThis = this): void {
        tmpThis.hideOrgUnitGroupsPanel();
    }

    getOrgUnits(orgUnitGroupId: string, orgUnitGroupIndex: number): void {
        this.orgUnitGroups[orgUnitGroupIndex].orgUnitArray = [];

        for (let orgUnit of this.orgUnitGroups[orgUnitGroupIndex].organisationUnits) {
            this.orgUnitService.getOrgUnit(orgUnit.id).subscribe(
                res => {
                    this.orgUnitGroups[orgUnitGroupIndex].orgUnitArray.push(res);
                },
                error => {
                    console.error(error);
                });
        }
    }

    orgUnitGroupOpened(orgUnitGroupId: string, orgUnitGroupIndex: number) {
        this.openedId = orgUnitGroupId;
        this.openedIndex = orgUnitGroupIndex;

        if (!this.orgUnitGroups[orgUnitGroupIndex].orgUnitArray) {
            this.getOrgUnits(orgUnitGroupId, orgUnitGroupIndex);
            this.getOrgUnitLevel1();
        }
    }

    getOrgUnitLevel1(): void {
        this.orgUnitService.getOrgUnits("&level=1").subscribe(
            res => {
                this.orgUnits = JSON.parse(JSON.stringify(res.organisationUnits));
                this.displayedOrgUnits = JSON.parse(JSON.stringify(res.organisationUnits));
            },
            error => {
                console.error(error);
            }
        )
    }
    // Can have the following classes:
    // - listOpened    | The list is opened, should have a "-" icon and should show a hand
    // - listClosed    | The list is closed, should have a "+" icon and should show a hand
    // - listLastChild | Last child of of the list, should have an empty icon and a "|"" cursor

    elementClicked(event: any): void {

        // Get the target element
        let target = event.target;

        console.log(event);
  
        // Is an image
        if (target.nodeName === "SPAN") {
            console.log("Name: " + event.target.parentNode.childNodes[4].data.trim());
            console.log("Type: " + event.target.className);
        }


        // Not a list element, so return
        if (target.nodeName !== "LI") return;

        

        // Get info about the event
        let name = target.innerText.split("\n")[0].trim();
        let spanContent = target.childNodes[1].innerText.split("|");
        let index = +spanContent[0];
        let parent = spanContent[1];
     
        // Retrieve children and append them
        if (this.hasRetrievedChildren.indexOf(name) < 0) {
            this.appendNewOrgUnits(index, name);
        
        // Have already retrieved the children, so toggle the element
        } else {
            this.toggleOrgUnit(index, name);
            
        }
    }

    toggleOrgUnit(index: number, name: string): void {
        $("#" + this.openedId).find("li").each(function () {

            let splitText = $(this).text().split("|");

            let listName = splitText[2];

            console.log("-------")
            console.log($(this).text());
            console.log("-------")
            
 
            if (listName === name || (listName.split("1")[0]) === name) {

                let childUl = $(this).find("ul");
                let isOpened = childUl.css("display") === "block";
                let isLastChild = $(this).css("color") === "rgb(0, 128, 0)"; // Green

                console.log($(this).css("color"));
                console.log("opened: " + isOpened + " | last child: "+ isLastChild);

                // Last child, ignore it
                if (isLastChild) {
                    return;
                }

                // Is opened, so close it
                else if (isOpened) {
                    $(this).find("ul").css({"display": "none"});
                    $(this).css({"color": "blue"});
                }

                // Is closed, so open it
                else if (!isOpened) {
                    console.log("Tring to open")
                    $(this).find("ul").css({"display": "block"});
                    $(this).css({"color": "red"});
                }

                return;
            }

        });
    }

    // TODO:
    // - If units.length === 1, set the class to listLastChild
    // - If not, set the class to listOpened
    appendNewOrgUnits(index: number, name: string): void {
        let tmpThis = this;

        // Get the org units from the API
        this.orgUnitService.getOrgUnitWithChildren(this.getIdByName(name)).subscribe(
            res => {

                // Org units retrieved, so push the name to retrievedChildren array
                let units = res.organisationUnits;
                tmpThis.hasRetrievedChildren.push(name);

                    // Traverse the list
                    $("#" + this.openedId).find("li").each(function () {

                        // Text is in the form of (index|parent|name|)
                        let splitText = $(this).text().split("|");

                        // Don't care about the item if the split length is incorrect
                        if (splitText.length < 3) {
                            return;
                        }

                        // Check if thi is the correct <li>
                        // Is correct if the clicked name equals the name of the li
                        if (splitText[2].trim() === name) {

                            // Found the name, but no children
                            // Set the class and return
                            if (units.length === 1) {
                                $(this).css({"color": "green"});
                                return;
                            }
                            let buildString = "<ul>";
                            
                            // Iterate over all orgUnits and build the list
                            for (let i = 1; i < units.length; i++) {
                                let spanContent = `<span style="display: none;">${i}|${name}|</span>`;
                                buildString += `<li>` + spanContent + units[i].name + "</li>";
                                tmpThis.displayedOrgUnits.push(units[i]);
                            }

                            // End the build string and append it
                            buildString += "</ul>";
                            $(this).css({"color": "red"});
                            $(this).append(buildString);

                            $(this).find("li").each(function() {
                                $(this).css({"color": "black"});
                            });

                            return;
                        }

                    });
                },
            error => {
                //console.error(error);
            }
        );
    }


    getIdByName(name: string): string {
        for (let i = 0; i < this.displayedOrgUnits.length; i++) {
            if (this.displayedOrgUnits[i].name.trim() === name) {
                return "" + this.displayedOrgUnits[i].id;
            }
        }

        return "-1";
    }



}