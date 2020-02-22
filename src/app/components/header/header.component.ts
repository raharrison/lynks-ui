import {Component, OnInit} from "@angular/core";

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html"
})
export class HeaderComponent implements OnInit {
    constructor() {}

    ngOnInit() {}

    navbarOpen = false;

    toggleNavbar() {
        this.navbarOpen = !this.navbarOpen;
    }
}