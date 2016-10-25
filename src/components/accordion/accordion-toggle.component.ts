import {Component, HostListener, forwardRef, Inject, Host} from "@angular/core";
import {AccordionGroupComponent} from "./accordion-group.component";

@Component({
    selector: "accordion-toggle",
    template: `<ng-content></ng-content>`
})
export class AccordionToggleComponent {

    constructor(@Host() @Inject(forwardRef(() => AccordionGroupComponent)) private accordionGroup: AccordionGroupComponent) {
    }

    @HostListener("click")
    onClick() {
        this.accordionGroup.toggle();
    }

}