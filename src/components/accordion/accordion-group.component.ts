import {Component, Input, Host, forwardRef, Inject, ContentChild, ElementRef} from "@angular/core";
import {AccordionComponent} from "./accordion.component";
import {AccordionToggleComponent} from "./accordion-toggle.component";

import {OrgUnitService} from "../../services/org-unit.service";

@Component({
    selector: "accordion-group",
    template: `
  <div class="panel panel-default" [class.dropup]="isOpened">
    <div class="panel-heading" role="tab" (click)="checkAndToggle()" style="cursor: pointer;">
      <h4 class="panel-title">
        <a *ngIf="heading" role="button" data-toggle="collapse" [attr.aria-expanded]="isOpened">
            {{ heading }}
        </a>
        <ng-content select="accordion-heading"></ng-content>
        <div class="caret" [style.display]="accordion.showArrows ? '' : 'none'">
        </div>
      </h4>
    </div>
    <div *ngIf="isOpened" class="panel-collapse collapse in" role="tabpanel" [attr.aria-labelledby]="heading">
      <div class="panel-body">
        <ng-content></ng-content>
      </div>
    </div>
  </div>
`
})
export class AccordionGroupComponent {

    @Input()
    heading: string;

    @Input()
    orgUnitId: string;

    @Input()
    isOpened: boolean = false;

    @ContentChild(AccordionToggleComponent)
    toggler: ElementRef;

    constructor(private orgUnitService: OrgUnitService, @Host() @Inject(forwardRef(() => AccordionComponent)) public accordion: AccordionComponent) {
    }

    checkAndToggle() {
        // if custom toggle element is supplied, then do nothing, custom toggler will take care of it
        if (this.toggler)
            return;

        if (!this.isOpened) {
            this.orgUnitService.callOnSideBarClick(this.orgUnitId);
        } else {
            this.orgUnitService.deselectMap();
        }
        this.toggle();
    }

    toggle() {
        const isOpenedBeforeWeChange = this.isOpened;
        if (this.accordion.closeOthers)
            this.accordion.closeAll();

        this.isOpened = !isOpenedBeforeWeChange;
    }

    toggleOpen() {
        if (this.isOpened) return;
        
        const isOpenedBeforeWeChange = this.isOpened;
        if (this.accordion.closeOthers)
            this.accordion.closeAll();

        this.isOpened = !isOpenedBeforeWeChange;
    }

}