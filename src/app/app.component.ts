import {Component} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ChildActivationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'lks-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent {
  title = 'Lynks';

  constructor(public router: Router, private titleService: Title) {
    this.router.events
      .pipe(filter(event => event instanceof ChildActivationEnd))
      .subscribe(event => {
        let snapshot = (event as ChildActivationEnd).snapshot;
        while (snapshot.firstChild !== null) {
          snapshot = snapshot.firstChild;
        }
        // take new title from route data if available, otherwise use default
        let newTitle = this.title;
        if (snapshot && snapshot.data.title) {
          newTitle = `${snapshot.data.title} - ${this.title}`;
        }
        this.titleService.setTitle(newTitle);
      });
  }
}
