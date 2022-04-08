import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "@shared/services/auth.service";
import {AuthRequest} from "@shared/models";

@Component({
  selector: 'lks-login',
  templateUrl: './login.component.html',
  styleUrls: ['login.component.scss'],
})
export class LoginComponent implements OnInit {

  loginRequest: AuthRequest;

  constructor(private router: Router,
              private authService: AuthService) {
    this.loginRequest = {
      username: "",
      password: ""
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
      error: () => this.loginRequest.password = ""
    });
  }
}
