import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {UserService} from "@shared/services/user.service";
import {RouteProviderService} from "@shared/services/route-provider.service";

@Component({
  selector: 'lks-register',
  templateUrl: './register.component.html',
  styleUrls: ['register.component.scss'],
})
export class RegisterComponent {

  registerRequest = {
    username: "",
    password: "",
    confirmPassword: ""
  };

  constructor(private router: Router,
              public routeProvider: RouteProviderService,
              private userService: UserService) {
  }

  onRegisterSubmit() {
    const newUser = {
      username: this.registerRequest.username,
      password: this.registerRequest.password
    }
    this.userService.register(newUser).subscribe({
      next: () => {
        this.router.navigate([this.routeProvider.loginPath]);
      },
      error: () => {
        this.registerRequest.password = "";
        this.registerRequest.confirmPassword = "";
      }
    });
  }

}
