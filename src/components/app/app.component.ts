import { Component } from "@angular/core";

@Component({
    selector : "app",
    template: require<any>("./app.component.html"),
    styles: [ require<any>("./app.component.less") ]
})

export class AppComponent { }
