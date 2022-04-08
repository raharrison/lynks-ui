import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "@shared/services/auth.service";
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
              private authService: AuthService) {
  }

  onRegisterSubmit() {
    const newUser = {
      username: this.registerRequest.username,
      password: this.registerRequest.password
    }
    this.authService.register(newUser).subscribe({
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
