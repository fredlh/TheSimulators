import { Component }        from "@angular/core";

@Component({
    selector: "nav-bar",
    template: require<any> ("./nav-bar.component.html"),
    styles: [ require<any> ("./nav-bar.component.less") ]
})


export class NavBarComponent {

}