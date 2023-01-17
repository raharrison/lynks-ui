import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "@shared/services/auth.service";
import {AuthRequest, AuthResult} from "@shared/models";

@Component({
  selector: 'lks-login',
  templateUrl: './login.component.html',
  styleUrls: ['login.component.scss'],
})
export class LoginComponent implements OnInit {

  loginRequest: AuthRequest;
  totpRequired: boolean = false;

  constructor(private router: Router,
              private authService: AuthService) {
    this.loginRequest = {
      username: "",
      password: "",
      totp: ""
    }
  }

  ngOnInit() {
    this.authService.logoutUser();
  }

  onLoginSubmit() {
    this.authService.login(this.loginRequest).subscribe({
      next: () => {
        this.router.navigate(["/"]);
      },
      error: (res) => {
        if (res?.error?.result === AuthResult.TOTP_REQUIRED) {
          this.totpRequired = true;
        } else {
          this.loginRequest.password = "";
          this.loginRequest.totp = "";
        }
      }
    });
  }
}
